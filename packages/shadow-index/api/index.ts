/**
 * Shadow Index API
 *
 * Fast hash-to-artifact resolution service
 * Deployed on Vercel Edge Functions
 */

import './env-bootstrap.js';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { corsMiddleware } from './middleware/cors.js';
import {
  rateLimitMiddleware,
  startRateLimitCleanup,
  stopRateLimitCleanup,
} from './middleware/rateLimit.js';
import { apiKeyMiddleware } from './middleware/apiKey.js';
import { err } from './shared/errors.js';
import { verifyJwt } from './shared/jwt.js';
import { unlockPayoutsAfterKycApproval } from './shared/unlock-payouts-after-kyc.js';
import {
  dataRoot,
  thingsDir,
  indexFile,
  uploadsDir,
  slipsDir,
} from './shared/server-paths.js';
import { authPortalBaseUrl, publicApiBase, getJwtSecret } from './shared/runtime-config.js';
import crypto from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { isR2Configured, uploadThing, getThing, checkR2Health } from '../lib/storage.js';
import { logError } from '../lib/error-logger.js';
import { logger } from '../lib/logger.js';
import { getMerchantIdentity } from './auth/merchant-identity.js';
import {
  loadMerchantAccounts,
  saveMerchantAccounts,
  sanitizeMerchantAccount,
} from './repos/merchant-accounts.js';
import { analyticsRouter } from './routes/analytics.js';
import { authRouter } from './routes/auth.js';
import { webhooksRouter } from './routes/webhooks.js';
import { adminRouter } from './routes/admin.js';
import { checkoutRouter, checkoutPublicRouter } from './routes/checkout.js';
import {
  loadOrders,
  saveOrders,
  loadNotifications,
  saveNotifications,
  loadPayoutLogs,
  queueOrderForPayout,
  releaseToMerchant,
} from './services/commerce-store.js';
import { db } from './db.js';
import {
  merchantProductsRouter,
  readProducts,
  writeProducts,
  getConsumerPriceCents,
  findMerchantProductByThingHashAnyStatus,
  buildThingJsonFromMerchantProduct,
  type MerchantProduct,
} from './merchant-products.js';
import {
  sendKycStatusEmail,
  sendOrderCheckinEmail,
  sendDeliveryDateEmail,
} from './email.js';
import {
  buildKycNotifiedKey,
  computeNextPayoutDateIso,
  extractSumsubReviewResult,
  generateSumsubSdkAccessToken,
  getSumsubRejectionReason,
  mapSumsubStatus,
  resolveSumsubApplicantId,
  verifySumsubWebhookSignature,
} from './sumsub-kyc.js';

// Paystack is lazy-loaded via getPaystack() to reduce cold start

/** Paystack routing stub — ready for Peach Payments later when selectRail() chooses provider. */
export function selectRail(): 'paystack' {
  return 'paystack';
}

const app = new Hono();

app.use('*', corsMiddleware);
app.use('*', rateLimitMiddleware);
app.use('*', apiKeyMiddleware);

app.route('/v1/analytics', analyticsRouter);
app.route('/v1/auth', authRouter);
app.route('/webhooks', webhooksRouter);
app.route('/v1/admin', adminRouter);
app.route('/checkout', checkoutRouter);
app.route('/', checkoutPublicRouter);

const storageMode = process.env.STORAGE_MODE || 'local';
const useR2 = storageMode === 'r2' && isR2Configured();

const productSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  price: z.number().int().nonnegative(),
  currency: z.string().min(3).max(3),
  image_url: z.string().url().optional(),
  checkout_url: z.string().url().optional(),
});

type ProductInput = z.infer<typeof productSchema>;

type StoredThing = {
  hash: string;
  matter_uri: string;
  thing_url: string;
  thing_path: string;
  thing_file?: { hash: string; [key: string]: unknown };
  image_url?: string;
  checkout_url?: string;
  gist: {
    title: string;
    price: number;
    currency: string;
    image_url?: string;
  };
  created_at: string;
};

type IndexStore = Record<string, StoredThing>;

const ensureDataDirs = async () => {
  await fs.mkdir(thingsDir, { recursive: true });
  await fs.mkdir(uploadsDir, { recursive: true });
};

const loadIndex = async (): Promise<IndexStore> => {
  try {
    const raw = await fs.readFile(indexFile, 'utf8');
    return JSON.parse(raw) as IndexStore;
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === 'ENOENT') return {};
    if (error instanceof SyntaxError) {
      logger.warn('data/index.json is malformed — resetting to empty store');
      await fs.writeFile(indexFile, '{}', 'utf8').catch(() => {});
      return {};
    }
    throw error;
  }
};

const saveIndex = async (index: IndexStore) => {
  await fs.mkdir(dataRoot, { recursive: true });
  await fs.writeFile(indexFile, JSON.stringify(index, null, 2), 'utf8');
};

const stableStringify = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
      a.localeCompare(b)
    );
    return `{${entries
      .map(([key, val]) => `${JSON.stringify(key)}:${stableStringify(val)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
};

const hashProduct = (product: Record<string, unknown>): string => {
  const payload = stableStringify(product);
  return crypto.createHash('sha256').update(payload).digest('hex');
};

const buildMatterUri = (hash: string) => `matter://${hash}`;

/** Configurable batch size cap (Sprint 4 — MVP-11). Default 100. */
const BATCH_MAX_SIZE = Math.min(
  Math.max(1, parseInt(process.env.BATCH_MAX_SIZE ?? '100', 10) || 100),
  500
);

/** Parse CSV body to array of product-like objects. Header: title,price,currency,image_url,checkout_url (order flexible). */
function parseCsvToProducts(csvBody: string): {
  products: Array<Record<string, unknown>>;
  rowErrors: Array<{ row: number; message: string }>;
} {
  const rowErrors: Array<{ row: number; message: string }> = [];
  const lines = csvBody.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) {
    return { products: [], rowErrors: lines.length === 0 ? [{ row: 0, message: 'Empty file' }] : [{ row: 1, message: 'No data rows' }] };
  }
  const headerLine = lines[0].toLowerCase();
  const headers = headerLine.split(',').map((h) => h.trim().toLowerCase());
  const titleIdx = headers.indexOf('title');
  const priceIdx = headers.indexOf('price');
  const currencyIdx = headers.indexOf('currency');
  const imageUrlIdx = headers.indexOf('image_url');
  const checkoutUrlIdx = headers.indexOf('checkout_url');
  if (titleIdx === -1 || priceIdx === -1 || currencyIdx === -1) {
    return { products: [], rowErrors: [{ row: 0, message: 'CSV must have header: title, price, currency' }] };
  }
  const products: Array<Record<string, unknown>> = [];
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i];
    const values = row.split(',').map((v) => v.trim());
    const title = values[titleIdx] ?? '';
    const priceRaw = values[priceIdx] ?? '';
    const price = parseInt(priceRaw, 10);
    const currency = (values[currencyIdx] ?? '').toUpperCase().slice(0, 3);
    const image_url = imageUrlIdx >= 0 ? (values[imageUrlIdx] ?? undefined) : undefined;
    const checkout_url = checkoutUrlIdx >= 0 ? (values[checkoutUrlIdx] ?? undefined) : undefined;
    if (!title) {
      rowErrors.push({ row: i + 1, message: 'Missing title' });
      continue;
    }
    if (Number.isNaN(price) || price < 0) {
      rowErrors.push({ row: i + 1, message: `Invalid price: ${priceRaw}` });
      continue;
    }
    if (!currency || currency.length !== 3) {
      rowErrors.push({ row: i + 1, message: `Invalid currency: ${values[currencyIdx] ?? ''}` });
      continue;
    }
    const obj: Record<string, unknown> = { title, price, currency };
    if (image_url) obj.image_url = image_url;
    if (checkout_url) obj.checkout_url = checkout_url;
    products.push(obj);
  }
  return { products, rowErrors };
}

/** Single-product compile and persist. Shared by POST /compile and POST /batch (Sprint 4). */
async function compileAndPersistProduct(product: ProductInput): Promise<{
  hash: string;
  matter_uri: string;
  thing_url: string;
  gist: StoredThing['gist'];
}> {
  await ensureDataDirs();
  const createdAt = new Date().toISOString();
  const hash = hashProduct(product);
  const matterUri = buildMatterUri(hash);
  const thingPayload = { hash, ...product, created_at: createdAt };
  const thingPath = path.join(thingsDir, `${hash}.thing`);

  let thingUrl: string;
  if (useR2) {
    const buffer = Buffer.from(JSON.stringify(thingPayload, null, 2), 'utf8');
    thingUrl = await uploadThing(hash, buffer);
  } else {
    await fs.writeFile(thingPath, JSON.stringify(thingPayload, null, 2), 'utf8');
    const baseUrl = process.env.PUBLIC_API_BASE_URL
      || `http://localhost:${Number(process.env.PORT) || 3000}`;
    thingUrl = `${baseUrl.replace(/\/$/, '')}/thing/${hash}`;
  }

  const index = await loadIndex();
  index[hash] = {
    hash,
    matter_uri: matterUri,
    thing_url: thingUrl,
    thing_path: useR2 ? thingUrl : thingPath,
    image_url: product.image_url,
    checkout_url: product.checkout_url,
    gist: {
      title: product.title,
      price: product.price,
      currency: product.currency,
      image_url: product.image_url,
    },
    created_at: createdAt,
  };
  await saveIndex(index);

  return {
    hash,
    matter_uri: matterUri,
    thing_url: thingUrl,
    gist: index[hash].gist,
  };
}

// Root endpoint for platform checks and quick verification in browsers.
app.get('/', (c) =>
  c.json({
    status: 'ok',
    service: 'shadow-index',
    company: 'fairflow',
    version: '0.6.0',
    docs_hint: 'Use /health for liveness and /resolve/:hash for lookups',
  })
);

// Health check endpoint
app.get('/health', async (c) => {
  const checks: Record<string, string> = {};

  if (useR2) {
    try {
      const r2ok = await checkR2Health();
      checks.storage = r2ok ? 'ok' : 'r2-unreachable';
    } catch {
      checks.storage = 'r2-error';
    }
  } else {
    try {
      await fs.access(dataRoot);
      checks.storage = 'ok';
    } catch {
      checks.storage = 'unavailable';
    }
  }

  // Check Supabase using shared client
  try {
    const { error } = await db
      .from('merchant_accounts')
      .select('id')
      .limit(1);
    checks.supabase = error ? `error: ${error.message}` : 'connected';
  } catch {
    checks.supabase = 'unavailable';
  }

  // Check Google OAuth config
  checks.google_oauth = (
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REDIRECT_URI
  ) ? 'configured' : 'missing env vars';

  checks.r2 = useR2 ? 'enabled' : 'disabled';
  checks.paystack = process.env.PAYSTACK_SECRET_KEY ? 'configured' : 'not_configured';
  checks.resend = process.env.RESEND_API_KEY ? 'configured' : 'not configured';

  const allHealthy = Object.values(checks).every(v =>
    v === 'configured' || v === 'connected' || v === 'ok' || v === 'enabled'
  );

  const httpStatus =
    process.env.NODE_ENV === 'test' ? 200 : allHealthy ? 200 : 207;

  return c.json({
    status: allHealthy ? 'ok' : 'degraded',
    service: 'shadow-index',
    company: 'fairflow',
    version: '0.6.0',
    timestamp: new Date().toISOString(),
    checks,
  }, httpStatus);
});

type UploadedImageFile = {
  name: string;
  type: string;
  size: number;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

const isUploadedImageFile = (value: unknown): value is UploadedImageFile => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.name === 'string'
    && typeof candidate.type === 'string'
    && typeof candidate.size === 'number'
    && typeof candidate.arrayBuffer === 'function';
};

const imageMimeByExtension: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
};

const imageExtensionByMime: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
  'image/svg+xml': '.svg',
};

app.post('/v1/merchant/uploads/image', async (c) => {
  // Merchant JWT validation (same as other merchant routes)
  const auth = c.req.header('Authorization');
  const bearer = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!bearer) {
    return c.json(err('unauthorized', 'Authentication required'), 401);
  }
  const payload = verifyJwt(bearer, getJwtSecret());
  if (!payload || payload.typ !== 'merchant_auth') {
    return c.json(err('unauthorized', 'Invalid merchant token'), 401);
  }

  const parsedBody = await c.req.parseBody().catch(() => null);
  if (!parsedBody || typeof parsedBody !== 'object') {
    return c.json(err('invalid_upload', 'Expected multipart form data'), 400);
  }

  const body = parsedBody as Record<string, unknown>;
  const rawFile = body.image ?? body.file ?? body.upload;
  const firstRaw = Array.isArray(rawFile) ? rawFile[0] : rawFile;
  if (!isUploadedImageFile(firstRaw)) {
    return c.json(err('invalid_upload', 'Image file is required'), 400);
  }

  const file = firstRaw;
  const mimeType = file.type.toLowerCase();
  if (!mimeType.startsWith('image/')) {
    return c.json(err('invalid_upload', 'Only image files are allowed'), 400);
  }

  const maxBytes = 8 * 1024 * 1024;
  if (file.size <= 0 || file.size > maxBytes) {
    return c.json(err('invalid_upload', 'Image file must be between 1 byte and 8MB'), 400);
  }

  const extFromMime = imageExtensionByMime[mimeType];
  const extFromName = path.extname(file.name || '').toLowerCase();
  const extension = extFromMime || (imageMimeByExtension[extFromName] ? extFromName : '.png');
  const imageBuffer = Buffer.from(await file.arrayBuffer());

  await fs.mkdir(uploadsDir, { recursive: true });
  const fileName = `${Date.now()}-${crypto.randomUUID()}${extension}`;
  const filePath = path.join(uploadsDir, fileName);
  await fs.writeFile(filePath, imageBuffer);

  const baseUrl = process.env.PUBLIC_API_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
  return c.json(
    {
      image_url: `${baseUrl.replace(/\/$/, '')}/uploads/${fileName}`,
      bytes: imageBuffer.length,
    },
    201,
  );
});

app.get('/uploads/:filename', async (c) => {
  const requested = c.req.param('filename');
  if (!/^[A-Za-z0-9._-]+$/.test(requested)) {
    return c.json(err('invalid_request', 'Invalid file name'), 400);
  }

  const safeName = path.basename(requested);
  const filePath = path.join(uploadsDir, safeName);

  try {
    const imageBuffer = await fs.readFile(filePath);
    const ext = path.extname(safeName).toLowerCase();
    c.header('Content-Type', imageMimeByExtension[ext] || 'application/octet-stream');
    c.header('Cache-Control', 'public, max-age=31536000, immutable');
    return c.body(imageBuffer);
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === 'ENOENT') {
      return c.json(err('not_found', 'Uploaded image not found'), 404);
    }
    return c.json(err('internal_error', 'Failed to load uploaded image'), 500);
  }
});

// Merchant dashboard endpoints
app.route('/v1/merchant/products', merchantProductsRouter);

app.post('/v1/merchant/products/:productId/restock', async (c) => {
  const productId = c.req.param('productId');
  const body = await c.req.json().catch(() => ({}));
  const quantityRaw = typeof body === 'object' && body ? (body as { quantity?: unknown }).quantity : undefined;
  const quantity = typeof quantityRaw === 'number' && Number.isFinite(quantityRaw) ? Math.max(1, Math.floor(quantityRaw)) : 10;

  const products = await readProducts();
  const target = products.find((product: MerchantProduct) => product.id === productId);
  if (!target) {
    return c.json(err('not_found', 'Product not found'), 404);
  }

  const stockBefore = target.stock_count ?? 0;
  const stockAfter = Math.max(0, stockBefore + quantity);
  target.stock_count = stockAfter;
  target.updated_at = new Date().toISOString();
  await writeProducts(products);

  if (target.merchant_id && target.id) {
    await db.from('inventory_logs').insert({
      product_id: target.id,
      merchant_id: target.merchant_id,
      transaction_type: 'restock',
      quantity_change: quantity,
      stock_before: stockBefore,
      stock_after: stockAfter,
      reference_id: `restock:${productId}`,
    });
  }

  return c.json({
    id: target.id,
    stock_count: target.stock_count,
    updated_at: target.updated_at,
  });
});

app.get('/v1/merchant/orders', async (c) => {
  const { merchantIds } = await getMerchantIdentity(c);
  if (merchantIds.length === 0) {
    return c.json({ ok: false, error: 'Unauthorized' }, 401);
  }
  const orders = await loadOrders();
  const products = await readProducts();
  const filtered = orders
    .filter((order) => !order.merchant_id || merchantIds.includes(order.merchant_id))
    .map((o) => {
      const product = products.find((p) => p.id === o.product_id || p.thing_file?.hash === o.product_hash);
      return { ...o, product_title: o.product_title ?? product?.title };
    });
  filtered.sort((a, b) => {
    const aCreated = typeof a.created_at === 'string' ? a.created_at : '';
    const bCreated = typeof b.created_at === 'string' ? b.created_at : '';
    return bCreated.localeCompare(aCreated);
  });
  const page = Math.max(1, parseInt(c.req.query('page') ?? '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(c.req.query('limit') ?? '20', 10)));
  const offset = (page - 1) * limit;
  const total = filtered.length;
  const pageItems = filtered.slice(offset, offset + limit);
  return c.json({
    orders: pageItems,
    pagination: {
      page,
      limit,
      total,
      pages: Math.max(1, Math.ceil(total / limit)),
    },
  });
});

app.patch('/v1/merchant/orders/:id/delivery-date', async (c) => {
  const { account, merchantIds } = await getMerchantIdentity(c);
  if (!account) {
    return c.json({ ok: false, error: 'Unauthorized' }, 401);
  }

  const orderId = c.req.param('id');
  const body = await c.req.json().catch(() => null) as { estimated_delivery_date?: string } | null;
  const estimatedDeliveryDate = body?.estimated_delivery_date;

  if (!estimatedDeliveryDate) {
    return c.json({ ok: false, error: 'estimated_delivery_date is required (ISO date string)' }, 400);
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(estimatedDeliveryDate)) {
    return c.json({ ok: false, error: 'Invalid date format. Use YYYY-MM-DD.' }, 400);
  }

  const orders = await loadOrders();
  const order = orders.find((candidate) => candidate.id === orderId && !!candidate.merchant_id && merchantIds.includes(candidate.merchant_id));
  if (!order) {
    return c.json({ ok: false, error: 'Order not found' }, 404);
  }

  const nowIso = new Date().toISOString();
  const { data: updated, error: updateError } = await db
    .from('orders')
    .update({ estimated_delivery_date: estimatedDeliveryDate, updated_at: nowIso })
    .eq('id', orderId)
    .eq('merchant_id', account.id)
    .select('*')
    .single();

  if (updateError || !updated) {
    return c.json({ ok: false, error: 'Failed to update delivery date' }, 500);
  }

  order.estimated_delivery_date = estimatedDeliveryDate;
  order.updated_at = nowIso;

  const customerEmail = order.customer?.email ?? order.customer_email;
  if (customerEmail) {
    sendDeliveryDateEmail({
      customerEmail,
      orderId,
      productTitle: order.product_title ?? 'your order',
      estimatedDeliveryDate,
      merchantBusinessName: account.business_name,
    }).catch((error) => console.error('[DeliveryDate] Email error:', error));
  }

  return c.json({ ok: true, data: updated });
});

app.patch('/v1/merchant/orders/:orderId/fulfill', async (c) => {
  const { merchantIds } = await getMerchantIdentity(c);
  if (merchantIds.length === 0) {
    return c.json({ ok: false, error: 'Unauthorized' }, 401);
  }

  const orderId = c.req.param('orderId');
  const orders = await loadOrders();
  const order = orders.find((candidate) => candidate.id === orderId);
  if (!order) {
    return c.json(err('not_found', 'Order not found'), 404);
  }
  if (!order.merchant_id || !merchantIds.includes(order.merchant_id)) {
    return c.json({ ok: false, error: 'Forbidden' }, 403);
  }

  const now = new Date().toISOString();
  order.fulfillment_status = 'fulfilled';
  order.fulfilled_at = now;
  order.updated_at = now;
  await saveOrders(orders);

  if (order.status === 'paid') {
    const payoutLog = await queueOrderForPayout(order.id);
    if (payoutLog) {
      logger.info('Order queued for payout', {
        orderId: order.id,
        payoutLogId: payoutLog.id,
        amount: payoutLog.net_amount,
        merchant_id: payoutLog.merchant_id,
      });
    }
  }

  return c.json({ ok: true, order });
});

// POST /v1/merchant/orders/:id/upload-slip - Upload shipment slip (PDF, JPG, PNG, max 5MB)
const SLIP_MAX_BYTES = 5 * 1024 * 1024;
const SLIP_ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
app.post('/v1/merchant/orders/:orderId/upload-slip', async (c) => {
  const { merchantIds } = await getMerchantIdentity(c);
  if (merchantIds.length === 0) {
    return c.json({ ok: false, error: 'Unauthorized' }, 401);
  }

  const orderId = c.req.param('orderId');
  const orders = await loadOrders();
  const order = orders.find((o) => o.id === orderId);
  if (!order) return c.json(err('not_found', 'Order not found'), 404);
  if (!order.merchant_id || !merchantIds.includes(order.merchant_id)) {
    return c.json({ ok: false, error: 'Forbidden' }, 403);
  }

  const body = await c.req.parseBody();
  const file = body['file'] ?? body['slip'];
  if (!file || typeof file === 'string') {
    return c.json(err('invalid_request', 'Missing file in multipart form (field: file or slip)'), 400);
  }

  const f = file as File;
  if (f.size > SLIP_MAX_BYTES) {
    return c.json(err('invalid_request', 'File too large (max 5MB)'), 400);
  }
  if (!SLIP_ALLOWED_TYPES.includes(f.type) && !f.name.match(/\.(pdf|jpg|jpeg|png)$/i)) {
    return c.json(err('invalid_request', 'Only PDF, JPG, PNG allowed'), 400);
  }

  const ext = f.name.match(/\.(pdf|jpg|jpeg|png)$/i)?.[1] ?? 'pdf';
  const filename = `${orderId}-${Date.now()}.${ext}`;
  await fs.mkdir(slipsDir, { recursive: true });
  const filePath = path.join(slipsDir, filename);
  const buf = Buffer.from(await f.arrayBuffer());
  await fs.writeFile(filePath, buf);

  const slipUrl = `${publicApiBase.replace(/\/$/, '')}/v1/slips/${filename}`;
  return c.json({ ok: true, slip_url: slipUrl, filename }, 201);
});

// PATCH /v1/merchant/orders/:id/ship - Mark order as shipped (requires shipment_slip_url)
app.patch('/v1/merchant/orders/:orderId/ship', async (c) => {
  const { merchantIds } = await getMerchantIdentity(c);
  if (merchantIds.length === 0) {
    return c.json({ ok: false, error: 'Unauthorized' }, 401);
  }

  const orderId = c.req.param('orderId');
  const body = await c.req.json().catch(() => null) as { shipment_slip_url?: string } | null;
  const slipUrl = body?.shipment_slip_url?.trim();

  if (!slipUrl) {
    return c.json(err('invalid_request', 'shipment_slip_url is required'), 400);
  }
  try {
    new URL(slipUrl);
  } catch {
    return c.json(err('invalid_request', 'shipment_slip_url must be a valid URL'), 400);
  }

  const orders = await loadOrders();
  const order = orders.find((o) => o.id === orderId);
  if (!order) return c.json(err('not_found', 'Order not found'), 404);
  if (!order.merchant_id || !merchantIds.includes(order.merchant_id)) {
    return c.json({ ok: false, error: 'Forbidden' }, 403);
  }

  const confirmToken = crypto.randomBytes(24).toString('hex');
  const now = new Date().toISOString();
  order.fulfillment_status = 'shipped';
  order.shipped_at = now;
  order.shipment_slip_url = slipUrl;
  order.confirm_token = confirmToken;
  order.payment_status = order.payment_status === 'held' ? 'held' : order.payment_status;
  order.updated_at = now;
  await saveOrders(orders);

  // TODO: Send customer email "Your order has been shipped. Click here to confirm when it arrives: [link]"
  const confirmUrl = `${authPortalBaseUrl}/order/${orderId}/confirm?token=${confirmToken}`;
  logger.info('Order marked shipped', { orderId, confirmUrl });

  return c.json({ ok: true, order });
});

// POST /v1/orders/:id/confirm-receipt - Customer confirms receipt (releases funds to merchant)
app.post('/v1/orders/:orderId/confirm-receipt', async (c) => {
  const orderId = c.req.param('orderId');
  const orders = await loadOrders();
  const order = orders.find((o) => o.id === orderId);
  if (!order) return c.json(err('not_found', 'Order not found'), 404);

  if (order.fulfillment_status !== 'shipped' && order.fulfillment_status !== 'fulfilled') {
    return c.json(err('invalid_request', 'Order has not been shipped yet'), 400);
  }
  if (!order.shipment_slip_url) {
    return c.json(err('invalid_request', 'Merchant has not confirmed shipment yet'), 400);
  }
  if (order.payment_status === 'released') {
    return c.json({ ok: true, message: 'Already confirmed' }, 200);
  }

  const now = new Date().toISOString();
  order.payment_status = 'confirmed';
  order.customer_confirmed_at = now;
  order.updated_at = now;

  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx >= 0) orders[idx] = order;
  await saveOrders(orders);

  await releaseToMerchant(order);

  return c.json({ ok: true, message: 'Thank you! Payment has been released to the merchant.' }, 200);
});

// GET /v1/slips/:filename - Serve uploaded slip (public for now)
app.get('/v1/slips/:filename', async (c) => {
  const filename = c.req.param('filename');
  if (!filename || filename.includes('..')) {
    return c.json(err('invalid_request', 'Invalid filename'), 400);
  }
  const filePath = path.join(slipsDir, filename);
  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filename).toLowerCase();
    const ct = ext === '.pdf' ? 'application/pdf' : ext === '.png' ? 'image/png' : 'image/jpeg';
    return c.body(new Uint8Array(data), 200, { 'Content-Type': ct });
  } catch (e) {
    const nodeErr = e as NodeJS.ErrnoException;
    if (nodeErr.code === 'ENOENT') return c.json(err('not_found', 'Slip not found'), 404);
    throw e;
  }
});


app.get('/v1/merchant/account', async (c) => {
  const { account } = await getMerchantIdentity(c);
  if (!account) {
    return c.json({ ok: false, error: 'Unauthorized' }, 401);
  }
  return c.json(sanitizeMerchantAccount(account));
});

app.get('/v1/merchant/payouts', async (c) => {
  const { merchantIds } = await getMerchantIdentity(c);
  if (merchantIds.length === 0) {
    return c.json({ ok: false, error: 'Unauthorized' }, 401);
  }
  const payouts = await loadPayoutLogs();
  const filtered = payouts.filter((item) => !item.merchant_id || merchantIds.includes(item.merchant_id));
  filtered.sort((a, b) => {
    const aCreated = typeof a.created_at === 'string' ? a.created_at : '';
    const bCreated = typeof b.created_at === 'string' ? b.created_at : '';
    return bCreated.localeCompare(aCreated);
  });
  return c.json(filtered);
});

app.post('/v1/merchant/kyc/submit', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (body === null || body === undefined || typeof body !== 'object') {
    return c.json(err('invalid_json', 'Request body must be valid JSON'), 400);
  }

  const { account } = await getMerchantIdentity(c);
  if (!account) {
    return c.json({ ok: false, error: 'Unauthorized' }, 401);
  }
  const accounts = await loadMerchantAccounts();
  const target = accounts.find((candidate) => candidate.id === account.id);
  if (!target) {
    return c.json(err('not_found', 'Merchant account not found'), 404);
  }

  const payload = body as {
    business_name?: string;
    id_number?: string;
    date_of_birth?: string;
    residential_address?: string;
    phone?: string;
    bank_account?: {
      account_holder_name?: string;
      bank_name?: string;
      branch_code?: string;
      account_type?: string;
      account_number?: string;
    };
  };

  target.business_name = payload.business_name?.trim() || target.business_name;
  target.kyc_status = 'pending';
  target.kyc_data = {
    id_number: payload.id_number ?? '',
    date_of_birth: payload.date_of_birth ?? '',
    address: payload.residential_address ?? '',
    phone: payload.phone ?? '',
  };
  target.bank_account = {
    account_holder_name: payload.bank_account?.account_holder_name ?? '',
    bank_name: payload.bank_account?.bank_name ?? '',
    branch_code: payload.bank_account?.branch_code ?? '',
    account_type: (payload.bank_account?.account_type as 'cheque' | 'savings' | 'transmission' | undefined) ?? 'cheque',
    account_number: payload.bank_account?.account_number ?? '',
  };
  target.updated_at = new Date().toISOString();

  await saveMerchantAccounts(accounts);
  return c.json({ ok: true, account: sanitizeMerchantAccount(target) });
});

app.post('/v1/merchant/kyc/start', async (c) => {
  const { account } = await getMerchantIdentity(c);
  if (!account) {
    return c.json({ ok: false, error: 'Unauthorized' }, 401);
  }

  if (account.kyc_status === 'approved') {
    return c.json({ ok: false, error: 'KYC already approved' }, 409);
  }

  const appToken = process.env.SUMSUB_APP_TOKEN?.trim();
  const secretKey = process.env.SUMSUB_SECRET_KEY?.trim();
  const levelName = process.env.SUMSUB_FLOW_NAME?.trim() || 'merchant-kyc';

  if (!appToken || !secretKey) {
    console.error('[Sumsub KYC] Missing SUMSUB_APP_TOKEN or SUMSUB_SECRET_KEY', { merchant_id: account.id });
    return c.json(err('sumsub_config', 'KYC provider is not configured on this server'), 503);
  }

  const externalUserId = account.id;

  try {
    const applicantId = await resolveSumsubApplicantId(appToken, secretKey, externalUserId, levelName);
    const accessToken = await generateSumsubSdkAccessToken(appToken, secretKey, externalUserId, levelName);

    const accounts = await loadMerchantAccounts();
    const target = accounts.find((m) => m.id === account.id);
    if (!target) {
      return c.json(err('not_found', 'Merchant account not found'), 404);
    }

    target.kyc_status = 'pending';
    target.smile_id_session_id = applicantId;
    target.smile_id_result_code = undefined;
    target.smile_id_result_text = undefined;
    target.updated_at = new Date().toISOString();
    await saveMerchantAccounts(accounts);

    return c.json({
      ok: true,
      access_token: accessToken,
      applicant_id: applicantId,
      kyc_status: 'pending' as const,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error('[Sumsub KYC] start failed', { merchant_id: account.id, error: message });
    return c.json({ ok: false, error: 'KYC provider unavailable' }, 502);
  }
});

app.post('/v1/merchant/kyc/callback', async (c) => {
  const rawBody = await c.req.text();
  const digest = c.req.header('x-payload-digest');
  const webhookSecret = process.env.SUMSUB_WEBHOOK_SECRET?.trim() ?? '';
  const skipSig = process.env.SUMSUB_SKIP_SIGNATURE_VERIFY === 'true';

  if (!webhookSecret && !skipSig) {
    console.error('[Sumsub KYC] callback: missing SUMSUB_WEBHOOK_SECRET');
    return c.json(err('sumsub_config', 'Not configured'), 503);
  }

  if (!skipSig && !verifySumsubWebhookSignature(rawBody, digest, webhookSecret)) {
    console.error('[Sumsub KYC] Invalid webhook signature');
    return c.json(err('invalid_signature', 'Signature verification failed'), 400);
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return c.json(err('invalid_json', 'Expected JSON body'), 400);
  }

  const eventType = typeof parsed.type === 'string' ? parsed.type : '';
  if (eventType !== 'applicantReviewed') {
    return c.json({ ok: true });
  }

  const externalUserId = typeof parsed.externalUserId === 'string' ? parsed.externalUserId : '';
  const applicantId = typeof parsed.applicantId === 'string' ? parsed.applicantId : '';
  const reviewResult = extractSumsubReviewResult(parsed);
  const mapped = mapSumsubStatus(reviewResult);

  const accounts = await loadMerchantAccounts();
  const merchant = accounts.find((m) => m.id === externalUserId || (applicantId && m.smile_id_session_id === applicantId));
  if (!merchant) {
    console.error('[Sumsub KYC] Unknown merchant for webhook', { externalUserId, applicantId });
    return c.json(err('not_found', 'Merchant not found'), 404);
  }

  const reviewAnswerKey = (reviewResult?.reviewAnswer ?? 'UNKNOWN').toUpperCase();
  const notifyKey = buildKycNotifiedKey(applicantId || merchant.id, reviewAnswerKey);

  if (mapped === 'approved' && merchant.kyc_status === 'approved') {
    return c.json({ ok: true });
  }

  merchant.smile_id_result_code = reviewAnswerKey;
  merchant.smile_id_result_text =
    typeof reviewResult?.reviewRejectType === 'string'
      ? reviewResult.reviewRejectType
      : reviewResult?.reviewAnswer ?? undefined;

  if (mapped === 'pending') {
    merchant.kyc_status = 'pending';
    merchant.updated_at = new Date().toISOString();
    await saveMerchantAccounts(accounts);
    return c.json({ ok: true, status: 'pending' });
  }

  const shouldNotify = merchant.smile_kyc_notified_key !== notifyKey;

  if (mapped === 'approved') {
    merchant.kyc_status = 'approved';
    merchant.kyc_rejection_reason = undefined;
    unlockPayoutsAfterKycApproval(merchant);
  } else {
    merchant.kyc_status = 'rejected';
    merchant.kyc_rejection_reason = getSumsubRejectionReason(reviewResult);
    merchant.payout_eligible = false;
  }

  merchant.updated_at = new Date().toISOString();
  if (shouldNotify) {
    merchant.smile_kyc_notified_key = notifyKey;
  }
  await saveMerchantAccounts(accounts);

  if (shouldNotify) {
    const dash = `${authPortalBaseUrl.replace(/\/$/, '')}/dashboard/merchant`;
    if (mapped === 'approved') {
      const nextPayoutIso =
        merchant.next_payout_date ?? computeNextPayoutDateIso(merchant.payout_frequency ?? 'weekly');
      const notifications = await loadNotifications();
      notifications.push({
        id: crypto.randomUUID(),
        merchant_id: merchant.id,
        type: 'kyc_approved',
        title: 'Identity Verified — Payouts Unlocked',
        message: `Your identity has been verified. Your first payout is scheduled for ${new Date(nextPayoutIso).toLocaleDateString('en-ZA', { dateStyle: 'long' })}.`,
        kyc_verified_at: merchant.kyc_verified_at,
        next_payout_date: nextPayoutIso,
        read: false,
        created_at: new Date().toISOString(),
      });
      await saveNotifications(notifications);

      sendKycStatusEmail({
        merchantEmail: merchant.email,
        merchantBusinessName: merchant.business_name,
        approved: true,
        payoutsActivated: true,
        nextPayoutDate: nextPayoutIso,
        dashboardUrl: dash,
      }).catch((err) => console.error('[Sumsub KYC] email error', { merchant_id: merchant.id, err }));
    } else {
      const notifications = await loadNotifications();
      notifications.push({
        id: crypto.randomUUID(),
        merchant_id: merchant.id,
        type: 'kyc_rejected',
        title: 'Verification Failed',
        message: merchant.kyc_rejection_reason || 'Sumsub could not verify your identity.',
        rejection_reason: merchant.kyc_rejection_reason,
        read: false,
        created_at: new Date().toISOString(),
      });
      await saveNotifications(notifications);

      sendKycStatusEmail({
        merchantEmail: merchant.email,
        merchantBusinessName: merchant.business_name,
        approved: false,
        notes: merchant.kyc_rejection_reason,
        dashboardUrl: dash,
      }).catch((err) => console.error('[Sumsub KYC] email error', { merchant_id: merchant.id, err }));
    }
  }

  return c.json({ ok: true, status: mapped });
});

// PATCH /v1/merchant/account - Update merchant profile (business name, contact info)
app.patch('/v1/merchant/account', async (c) => {
  const { account } = await getMerchantIdentity(c);
  if (!account) {
    return c.json({ ok: false, error: 'Unauthorized' }, 401);
  }
  const accounts = await loadMerchantAccounts();
  const target = accounts.find((candidate) => candidate.id === account.id);
  if (!target) {
    return c.json(err('not_found', 'Merchant account not found'), 404);
  }

  const body = await c.req.json().catch(() => null);
  if (body === null || body === undefined || typeof body !== 'object') {
    return c.json(err('invalid_json', 'Request body must be valid JSON'), 400);
  }

  const payload = body as {
    business_name?: string;
    phone?: string;
    address?: string;
  };

  // Update account fields
  if (payload.business_name !== undefined) {
    target.business_name = payload.business_name;
  }
  if (payload.phone !== undefined || payload.address !== undefined) {
    if (!target.kyc_data) {
      target.kyc_data = { id_number: '', date_of_birth: '', address: '', phone: '' };
    }
    if (payload.phone !== undefined) {
      if (target.kyc_data) target.kyc_data.phone = payload.phone;
    }
    if (payload.address !== undefined) {
      if (target.kyc_data) target.kyc_data.address = payload.address;
    }
  }
  target.updated_at = new Date().toISOString();

  await saveMerchantAccounts(accounts);
  
  logger.info('Merchant account profile updated', { merchant_id: target.id, business_name: target.business_name });
  
  return c.json({ 
    ok: true, 
    message: 'Account profile updated successfully',
    account: sanitizeMerchantAccount(target) 
  });
});

// PATCH /v1/merchant/account/bank - Update bank account details for payouts
app.patch('/v1/merchant/account/bank', async (c) => {
  const { account } = await getMerchantIdentity(c);
  if (!account) {
    return c.json({ ok: false, error: 'Unauthorized' }, 401);
  }
  const accounts = await loadMerchantAccounts();
  const target = accounts.find((candidate) => candidate.id === account.id);
  if (!target) {
    return c.json(err('not_found', 'Merchant account not found'), 404);
  }

  const body = await c.req.json().catch(() => null);
  if (body === null || body === undefined || typeof body !== 'object') {
    return c.json(err('invalid_json', 'Request body must be valid JSON'), 400);
  }

  const payload = body as {
    account_name?: string;
    account_number?: string;
    branch_code?: string;
    bank_name?: string;
  };

  // Validate required fields
  if (!payload.account_name || !payload.account_number || !payload.branch_code || !payload.bank_name) {
    return c.json(
      err('invalid_request', 'All bank fields required: account_name, account_number, branch_code, bank_name'),
      400
    );
  }

  // Update bank account
  target.bank_account = {
    account_holder_name: payload.account_name,
    account_number: payload.account_number,
    branch_code: payload.branch_code,
    bank_name: payload.bank_name,
    account_type: 'cheque', // Default  to cheque account
  };
  target.updated_at = new Date().toISOString();

  await saveMerchantAccounts(accounts);
  
  logger.info('Merchant bank account updated', { merchant_id: target.id, bank_name: payload.bank_name });
  
  return c.json({ 
    ok: true, 
    message: 'Bank account updated successfully',
    account: sanitizeMerchantAccount(target) 
  });
});

app.get('/v1/merchant/notifications', async (c) => {
  const { merchantIds } = await getMerchantIdentity(c);
  if (merchantIds.length === 0) {
    return c.json({ ok: false, error: 'Unauthorized' }, 401);
  }
  const items = await loadNotifications();
  const filtered = items.filter((item) => !item.merchant_id || merchantIds.includes(item.merchant_id));
  filtered.sort((a, b) => {
    const aCreated = typeof a.created_at === 'string' ? a.created_at : '';
    const bCreated = typeof b.created_at === 'string' ? b.created_at : '';
    return bCreated.localeCompare(aCreated);
  });
  const page = Math.max(1, parseInt(c.req.query('page') ?? '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(c.req.query('limit') ?? '20', 10)));
  const offset = (page - 1) * limit;
  const total = filtered.length;
  const pageItems = filtered.slice(offset, offset + limit);
  return c.json({
    ok: true,
    notifications: pageItems,
    pagination: {
      page,
      limit,
      total,
      pages: Math.max(1, Math.ceil(total / limit)),
    },
  });
});

app.patch('/v1/merchant/notifications/:notificationId', async (c) => {
  const notificationId = c.req.param('notificationId');
  const notifications = await loadNotifications();
  const target = notifications.find((item) => item.id === notificationId);
  if (!target) {
    return c.json(err('not_found', 'Notification not found'), 404);
  }
  target.read = true;
  await saveNotifications(notifications);
  return c.json({ ok: true, notification: target });
});

// Compile endpoint - transforms product data into .thing file (uses shared compileAndPersistProduct)
app.post('/compile', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (body === null || body === undefined) {
    return c.json(err('invalid_json', 'Request body must be valid JSON'), 400);
  }
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      err('invalid_product', 'Invalid product payload', parsed.error.flatten()),
      400
    );
  }

  const result = await compileAndPersistProduct(parsed.data);
  return c.json({
    ...result,
    image_url: parsed.data.image_url,
    checkout_url: parsed.data.checkout_url,
  });
});

// Resolve hash to artifact URL
app.get('/resolve/:hash', async (c) => {
  const hash = c.req.param('hash');
  const index = await loadIndex();
  const entry = index[hash];
  if (!entry) {
    return c.json(err('not_found', `No artifact found for hash: ${hash}`, { hash }), 404);
  }
  return c.json({
    hash: entry.hash,
    matter_uri: entry.matter_uri,
    thing_url: entry.thing_url,
    image_url: entry.image_url,
    gist: entry.gist,
    checkout_url: entry.checkout_url,
    created_at: entry.created_at,
  });
});

// Get gist (minimal product data) by hash
app.get('/gist/:hash', async (c) => {
  const hash = c.req.param('hash');
  const index = await loadIndex();
  const entry = index[hash];
  if (!entry) {
    return c.json(err('not_found', `No gist found for hash: ${hash}`, { hash }), 404);
  }
  return c.json({
    hash: entry.hash,
    gist: entry.gist,
    checkout_url: entry.checkout_url,
  });
});

/** If this hash is an archived merchant row, mark JSON so the storefront hides checkout. */
async function mergeArchivedListingFlag(thing: unknown, thingHash: string): Promise<unknown> {
  const mp = await findMerchantProductByThingHashAnyStatus(thingHash);
  if (mp?.status !== 'archived') return thing;
  if (!thing || typeof thing !== 'object') return thing;
  const obj = { ...(thing as Record<string, unknown>) };
  const meta = obj.metadata;
  obj.metadata =
    meta && typeof meta === 'object'
      ? { ...(meta as Record<string, unknown>), fairflow_listing: 'archived' }
      : { fairflow_listing: 'archived' };
  return obj;
}

// Get full thing file (product detail) by hash
app.get('/thing/:hash', async (c) => {
  let hash = c.req.param('hash');
  // Remove trailing .json if present
  if (hash.endsWith('.json')) {
    hash = hash.slice(0, -5);
  }
  const jsonPath = path.join(thingsDir, `${hash}.json`);
  try {
    const content = await fs.readFile(jsonPath, 'utf8');
    const thing = JSON.parse(content);
    const merged = await mergeArchivedListingFlag(thing, hash);
    c.header('Content-Type', 'application/json');
    return c.json(merged);
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code !== 'ENOENT') {
      return c.json(
        err('internal_error', 'Failed to load thing file', { hash, error: nodeError.message }),
        500,
      );
    }
  }

  // Legacy compile path writes {hash}.thing (not .json)
  const thingPath = path.join(thingsDir, `${hash}.thing`);
  try {
    const content = await fs.readFile(thingPath, 'utf8');
    const parsed = JSON.parse(content) as Record<string, unknown>;
    if (parsed && typeof parsed === 'object' && 'product' in parsed && 'commerce' in parsed) {
      const merged = (await mergeArchivedListingFlag(parsed, hash)) as Record<string, unknown>;
      c.header('Content-Type', 'application/json');
      return c.json(merged);
    }
  } catch {
    // continue to Supabase fallback
  }

  // Merchant dashboard creates hashes in Supabase only — no local file on Vercel
  const mpAny = await findMerchantProductByThingHashAnyStatus(hash);
  if (mpAny) {
    const body = buildThingJsonFromMerchantProduct(mpAny, hash);
    if (mpAny.status === 'archived') {
      const meta = (body.metadata ?? {}) as Record<string, unknown>;
      body.metadata = { ...meta, fairflow_listing: 'archived' };
    }
    c.header('Content-Type', 'application/json');
    return c.json(body);
  }

  return c.json(err('not_found', `Thing file not found for hash: ${hash}`, { hash }), 404);
});

// Batch compilation endpoint (Sprint 4 — MVP-11)
const batchBodySchema = z.object({ products: z.array(z.unknown()) });
app.post('/batch', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (body === null || body === undefined) {
    return c.json(err('invalid_json', 'Request body must be valid JSON'), 400);
  }
  const parsed = batchBodySchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      err('invalid_batch', 'Request body must be { products: Product[] }', parsed.error.flatten()),
      400
    );
  }

  const products = parsed.data.products as Array<Record<string, unknown>>;
  if (products.length > BATCH_MAX_SIZE) {
    return c.json(
      err('batch_too_large', `Maximum batch size is ${BATCH_MAX_SIZE}`, {
        max: BATCH_MAX_SIZE,
        received: products.length,
      }),
      400
    );
  }
  if (products.length === 0) {
    return c.json(
      err('empty_batch', 'products array must not be empty'),
      400
    );
  }

  const results: Array<{ hash: string; matter_uri: string; thing_url: string; gist: StoredThing['gist'] }> = [];
  const errors: Array<{ index: number; code: string; message: string }> = [];

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const validated = productSchema.safeParse(product);
    if (!validated.success) {
      const msg = validated.error.errors.map((e) => e.message).join('; ');
      errors.push({ index: i, code: 'invalid_product', message: msg });
      continue;
    }
    try {
      const result = await compileAndPersistProduct(validated.data);
      results.push(result);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      errors.push({ index: i, code: 'compile_failed', message });
    }
  }

  const status = errors.length > 0 && results.length > 0 ? 207 : errors.length > 0 ? 400 : 200;
  return c.json({ results, errors }, status);
});

// Catalog import (Sprint 4 — MVP-12): JSON array or CSV
app.post('/catalog/import', async (c) => {
  const contentType = c.req.header('Content-Type') ?? '';
  let products: Array<Record<string, unknown>>;
  const importErrors: Array<{ index: number; code: string; message: string }> = [];

  if (contentType.includes('text/csv')) {
    const raw = await c.req.text();
    const { products: parsed, rowErrors } = parseCsvToProducts(raw);
    products = parsed;
    rowErrors.forEach((e) => importErrors.push({ index: e.row, code: 'invalid_row', message: e.message }));
  } else if (contentType.includes('application/json')) {
    const body = await c.req.json().catch(() => null);
    if (body === null || body === undefined) {
      return c.json(err('invalid_json', 'Request body must be valid JSON'), 400);
    }
    const parsed = z.object({ products: z.array(z.unknown()) }).safeParse(body);
    if (!parsed.success) {
      return c.json(
        err('invalid_body', 'Body must be { products: Product[] }', parsed.error.flatten()),
        400
      );
    }
    products = parsed.data.products as Array<Record<string, unknown>>;
  } else {
    return c.json(
      err('unsupported_media', 'Content-Type must be application/json or text/csv'),
      400
    );
  }

  if (products.length > BATCH_MAX_SIZE) {
    return c.json(
      err('batch_too_large', `Maximum batch size is ${BATCH_MAX_SIZE}`, {
        max: BATCH_MAX_SIZE,
        received: products.length,
      }),
      400
    );
  }
  if (products.length === 0 && importErrors.length === 0) {
    return c.json(err('empty_import', 'No valid products to import'), 400);
  }

  const results: Array<{ hash: string; matter_uri: string; thing_url: string; gist: StoredThing['gist'] }> = [];
  const errors: Array<{ index: number; code: string; message: string }> = [...importErrors];

  for (let i = 0; i < products.length; i++) {
    const validated = productSchema.safeParse(products[i]);
    if (!validated.success) {
      const msg = validated.error.errors.map((e) => e.message).join('; ');
      errors.push({ index: i, code: 'invalid_product', message: msg });
      continue;
    }
    try {
      const result = await compileAndPersistProduct(validated.data);
      results.push(result);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      errors.push({ index: i, code: 'compile_failed', message });
    }
  }

  const status = errors.length > 0 && results.length > 0 ? 207 : errors.length > 0 ? 400 : 200;
  return c.json(
    {
      results,
      errors,
      imported: results.length,
      failed: errors.length,
    },
    status
  );
});

// Public catalog endpoint for consumer storefront
app.get('/catalog/public', async (c) => {
  const products = (await readProducts())
    .filter((product: MerchantProduct) => product.status === 'published' && (product.stock_count ?? 0) > 0 && !!product.thing_file?.hash)
    .map((product: MerchantProduct) => ({
      hash: product.thing_file!.hash,
      title: product.title,
      price: getConsumerPriceCents(product),
      currency: product.currency,
      category: product.category,
      merchant_id: product.merchant_id,
    }));

  return c.json({ products }, 200);
});


// Serve binary .thing payloads using explicit route (from R2 or local)
app.get('/thing-bin/:hash', async (c) => {
  const hash = c.req.param('hash');
  if (useR2) {
    const data = await getThing(hash);
    if (data !== null) {
      c.header('X-Thing-Source', 'r2-binary');
      return c.body(new Uint8Array(data), 200, {
        'Content-Type': 'application/octet-stream',
      });
    }

    const jsonPath = path.join(thingsDir, `${hash}.json`);
    try {
      const jsonData = await fs.readFile(jsonPath, 'utf8');
      c.header('X-Thing-Source', 'json-fallback');
      return c.body(new TextEncoder().encode(jsonData), 200, {
        'Content-Type': 'application/octet-stream',
      });
    } catch {
      return c.json(err('not_found', `No .thing payload found for hash: ${hash}`, { hash }), 404);
    }
  }

  const filePath = path.join(thingsDir, `${hash}.thing`);
  try {
    const data = await fs.readFile(filePath);
    c.header('X-Thing-Source', 'local-binary');
    return c.body(new Uint8Array(data), 200, {
      'Content-Type': 'application/octet-stream',
    });
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === 'ENOENT') {
      const jsonPath = path.join(thingsDir, `${hash}.json`);
      try {
        const jsonData = await fs.readFile(jsonPath, 'utf8');
        c.header('X-Thing-Source', 'json-fallback');
        return c.body(new TextEncoder().encode(jsonData), 200, {
          'Content-Type': 'application/octet-stream',
        });
      } catch {
        return c.json(err('not_found', `No .thing payload found for hash: ${hash}`, { hash }), 404);
      }
    }
    throw error;
  }
});

app.post('/v1/cron/order-checkins', async (c) => {
  const headerSecret = c.req.header('x-cron-secret');
  const authHeader = c.req.header('Authorization');
  const bearerSecret = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : undefined;
  const providedSecret = headerSecret || bearerSecret;
  if (!process.env.CRON_SECRET || providedSecret !== process.env.CRON_SECRET) {
    return c.json({ ok: false, error: 'Unauthorized' }, 401);
  }

  const now = Date.now();
  const fiveDaysMs = 5 * 24 * 60 * 60 * 1000;
  const orders = await loadOrders();
  const products = await readProducts();
  const accounts = await loadMerchantAccounts();
  const accountMap = new Map(accounts.map((account) => [account.id, account]));

  const eligible = orders.filter((order) => {
    if (order.fulfillment_status === 'fulfilled' || order.fulfillment_status === 'cancelled') {
      return false;
    }

    const createdAt = order.created_at ? new Date(order.created_at).getTime() : null;
    const lastCheckin = order.last_checkin_sent_at ? new Date(order.last_checkin_sent_at).getTime() : null;
    if (lastCheckin !== null) {
      return now - lastCheckin >= fiveDaysMs;
    }
    if (createdAt === null) return false;
    return now - createdAt >= fiveDaysMs;
  });

  if (eligible.length === 0) {
    return c.json({ ok: true, data: { processed: 0, sent: 0 } });
  }

  let sent = 0;

  for (const order of eligible) {
    const customerEmail = order.customer?.email ?? order.customer_email;
    if (!customerEmail) continue;

    const product = products.find((p) => p.id === order.product_id || p.thing_file?.hash === order.product_hash);
    const merchant = order.merchant_id ? accountMap.get(order.merchant_id) : undefined;

    try {
      await sendOrderCheckinEmail({
        customerEmail,
        orderId: order.id,
        productTitle: order.product_title ?? product?.title ?? 'your order',
        estimatedDeliveryDate: order.estimated_delivery_date ?? null,
        merchantBusinessName: merchant?.business_name ?? 'the merchant',
        checkinNumber: (order.checkin_email_count ?? 0) + 1,
        orderStatusUrl: `${authPortalBaseUrl}/order/${order.id}`,
      });

      await db
        .from('orders')
        .update({
          checkin_email_count: (order.checkin_email_count ?? 0) + 1,
          last_checkin_sent_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      sent += 1;
    } catch (error) {
      console.error(`[Cron] Failed check-in for order ${order.id}:`, error);
    }
  }

  console.log(`[Cron] Check-in emails sent: ${sent}/${eligible.length}`);
  return c.json({ ok: true, data: { processed: eligible.length, sent } });
});


app.onError((error, c) => {
  const msg = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  logError({ path: c.req.path, method: c.req.method }, msg, stack);
  logger.error('Unhandled error', { error: msg });
  return c.json(err('internal_error', 'An unexpected error occurred'), 500);
});

app.notFound((c) =>
  c.json(
    err('not_found', 'Route not found', {
      path: c.req.path,
      method: c.req.method,
      health: '/health',
    }),
    404
  )
);

// Development server — skip when NODE_ENV=test so tests can import app without starting server
const port = Number(process.env.PORT) || 3000;
// Also skip when running on Vercel (serverless — port binding is not supported)
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  logger.info('Server starting', {
    port,
    storage: useR2 ? 'r2' : 'local',
    url: `http://localhost:${port}`,
  });

  const server = serve({ fetch: app.fetch, port });
  startRateLimitCleanup();

  const shutdown = () => {
    logger.info('Shutting down gracefully');
    stopRateLimitCleanup();
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 5000);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

// Export for Vercel Edge Functions and tests
export default app;
export { queueOrderForPayout, releasePayoutLog, buildMoRStatus } from './services/commerce-store.js';
export { validateAdminAuth } from './middleware/adminAuth.js';
export type { PayoutLogBackend, MerchantOrderBackend, MoRStatusResponse } from './services/commerce-store.js';
