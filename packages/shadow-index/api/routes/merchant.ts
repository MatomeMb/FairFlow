import { Hono } from 'hono';
import crypto from 'node:crypto';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { err } from '../shared/errors.js';
import { logger } from '../../lib/logger.js';
import { verifyJwt } from '../shared/jwt.js';
import { authPortalBaseUrl, publicApiBase, getJwtSecret } from '../shared/runtime-config.js';
import { unlockPayoutsAfterKycApproval } from '../shared/unlock-payouts-after-kyc.js';
import { uploadsDir, slipsDir } from '../shared/server-paths.js';
import { getMerchantIdentity } from '../auth/merchant-identity.js';
import {
  loadMerchantAccounts,
  saveMerchantAccounts,
  sanitizeMerchantAccount,
} from '../repos/merchant-accounts.js';
import {
  loadOrders,
  saveOrders,
  loadNotifications,
  saveNotifications,
  loadPayoutLogs,
  queueOrderForPayout,
} from '../services/commerce-store.js';
import { db } from '../db.js';
import {
  readProducts,
  writeProducts,
  type MerchantProduct,
} from '../merchant-products.js';
import {
  sendKycStatusEmail,
  sendDeliveryDateEmail,
} from '../email.js';
import {
  buildKycNotifiedKey,
  computeNextPayoutDateIso,
  extractSumsubReviewResult,
  generateSumsubSdkAccessToken,
  getSumsubRejectionReason,
  mapSumsubStatus,
  resolveSumsubApplicantId,
  verifySumsubWebhookSignature,
} from '../sumsub-kyc.js';

export const merchantRouter = new Hono();
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

merchantRouter.post('/uploads/image', async (c) => {
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
merchantRouter.post('/products/:productId/restock', async (c) => {
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

merchantRouter.get('/orders', async (c) => {
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

merchantRouter.patch('/orders/:id/delivery-date', async (c) => {
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

merchantRouter.patch('/orders/:orderId/fulfill', async (c) => {
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
merchantRouter.post('/orders/:orderId/upload-slip', async (c) => {
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
merchantRouter.patch('/orders/:orderId/ship', async (c) => {
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

  // DEBT: Post-ship customer email with confirm-receipt deep link — tracked in architectural backlog
  // Context: copy and Resend template not finalised for beta
  // Impact: customers rely on portal / order status until this ships
  const confirmUrl = `${authPortalBaseUrl}/order/${orderId}/confirm?token=${confirmToken}`;
  logger.info('Order marked shipped', { orderId, confirmUrl });

  return c.json({ ok: true, order });
});
merchantRouter.get('/account', async (c) => {
  const { account } = await getMerchantIdentity(c);
  if (!account) {
    return c.json({ ok: false, error: 'Unauthorized' }, 401);
  }
  return c.json(sanitizeMerchantAccount(account));
});

merchantRouter.get('/payouts', async (c) => {
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

merchantRouter.post('/kyc/submit', async (c) => {
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

merchantRouter.post('/kyc/start', async (c) => {
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

merchantRouter.post('/kyc/callback', async (c) => {
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
merchantRouter.patch('/account', async (c) => {
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
merchantRouter.patch('/account/bank', async (c) => {
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

merchantRouter.get('/notifications', async (c) => {
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

merchantRouter.patch('/notifications/:notificationId', async (c) => {
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

/** Public file serving for merchant-uploaded product images (URLs match upload responses: /uploads/...). */
export const merchantUploadsPublicRouter = new Hono();
merchantUploadsPublicRouter.get('/:filename', async (c) => {
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

/** Public slip files (e.g. shipment PDFs) at /v1/slips/:filename. */
export const merchantSlipsPublicRouter = new Hono();
merchantSlipsPublicRouter.get('/:filename', async (c) => {
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