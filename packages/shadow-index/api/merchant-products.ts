/**
 * Merchant Products API
 *
 * CRUD for merchant-managed products with stock, status, and thing_file linkage.
 * Products are stored in Supabase merchant_products.
 */

import { Hono } from 'hono';
import crypto from 'node:crypto';
import { db } from './db.js';

/** Merchant product with stock, status, and thing linkage */
export type MerchantProduct = {
  id: string;
  title: string;
  price_cents: number;
  currency: string;
  description?: string;
  status?: 'draft' | 'published' | 'archived';
  stock_count?: number;
  thing_file?: { hash: string; matter_uri?: string; thing_url?: string };
  category?: string;
  merchant_id?: string;
  image_url?: string;
  shipping_available?: boolean;
  certifications?: unknown[];
  created_at?: string;
  updated_at?: string;
};

type MerchantProductRow = {
  id: string;
  merchant_id: string | null;
  title: string;
  description: string | null;
  price_cents: number;
  currency: string;
  category: string | null;
  stock_count: number;
  image_url: string | null;
  shipping_available: boolean;
  certifications: unknown;
  thing_file: unknown;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isUuid = (value: unknown): value is string => typeof value === 'string' && UUID_RE.test(value);

const base64UrlDecode = (value: string): Buffer => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const pad = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  return Buffer.from(`${normalized}${pad}`, 'base64');
};

const hmacSha256 = (input: string, secret: string): string =>
  crypto.createHmac('sha256', secret).update(input).digest('base64url');

const verifyJwt = (token: string, secret: string): Record<string, unknown> | null => {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [headerB64, payloadB64, signatureB64] = parts;
  const signingInput = `${headerB64}.${payloadB64}`;
  const expected = hmacSha256(signingInput, secret);

  const providedBuf = Buffer.from(signatureB64, 'utf8');
  const expectedBuf = Buffer.from(expected, 'utf8');
  if (providedBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(providedBuf, expectedBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(payloadB64).toString('utf8')) as Record<string, unknown>;
    const exp = payload.exp;
    if (typeof exp === 'number' && Date.now() >= exp * 1000) return null;
    return payload;
  } catch {
    return null;
  }
};

const resolveMerchantId = async (c: {
  req: { header: (name: string) => string | undefined };
  get?: (key: string) => unknown;
}): Promise<string | null> => {
  const scopedMerchantId = c.get?.('merchantId') ?? c.get?.('merchant_id');
  if (isUuid(scopedMerchantId)) return scopedMerchantId;

  const auth = c.req.header('Authorization');
  const bearer = auth?.startsWith('Bearer ') ? auth.slice(7).trim() : null;
  if (!bearer) {
    return null;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) return null;
  const payload = verifyJwt(bearer, jwtSecret);
  if (!payload || payload.typ !== 'merchant_auth') return null;

  const subject = payload.sub;
  if (isUuid(subject)) return subject;

  const email = typeof payload.email === 'string' ? payload.email.toLowerCase() : null;
  if (!email) return null;

  const { data } = await db
    .from('merchant_accounts')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (data && isUuid(data.id)) return data.id;
  return null;
};

const rowToProduct = (row: MerchantProductRow): MerchantProduct => ({
  id: row.id,
  merchant_id: row.merchant_id ?? undefined,
  title: row.title,
  description: row.description ?? undefined,
  price_cents: row.price_cents,
  currency: row.currency,
  category: row.category ?? undefined,
  stock_count: row.stock_count,
  image_url: row.image_url ?? undefined,
  shipping_available: row.shipping_available,
  certifications: Array.isArray(row.certifications) ? row.certifications : [],
  thing_file: (row.thing_file as MerchantProduct['thing_file']) ?? undefined,
  status: row.status,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

const productToUpsertRow = (product: MerchantProduct) => ({
  id: product.id,
  merchant_id: product.merchant_id ?? null,
  title: product.title,
  description: product.description ?? null,
  price_cents: product.price_cents,
  currency: product.currency,
  category: product.category ?? null,
  stock_count: product.stock_count ?? 0,
  image_url: product.image_url ?? null,
  shipping_available: product.shipping_available ?? false,
  certifications: product.certifications ?? [],
  thing_file: product.thing_file ?? null,
  status: product.status ?? 'draft',
  updated_at: product.updated_at ?? new Date().toISOString(),
});

/** Async read of merchant products (used by index.ts for restock, catalog, checkout) */
export async function readProducts(): Promise<MerchantProduct[]> {
  const { data, error } = await db
    .from('merchant_products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to load merchant products: ${error.message}`);
  }

  const rows = (data ?? []) as MerchantProductRow[];
  return rows.map(rowToProduct);
}

/**
 * Resolve a merchant row by deterministic thing hash (same hash shown as matter:// and /product/:hash).
 * Used when no local things/{hash}.json exists (Supabase-only merchant flow, serverless disk).
 */
export async function findMerchantProductByThingHash(thingHash: string): Promise<MerchantProduct | null> {
  try {
    const products = await readProducts();
    return (
      products.find(
        (p) => p.thing_file?.hash === thingHash && p.status !== 'archived',
      ) ?? null
    );
  } catch {
    return null;
  }
}

/** Shape expected by auth-portal ProductPage (GET /thing/:hash.json). */
export function buildThingJsonFromMerchantProduct(
  product: MerchantProduct,
  thingHash: string,
): Record<string, unknown> {
  const baseUrl =
    process.env.PUBLIC_API_BASE_URL?.replace(/\/$/, '')
    || `http://localhost:${Number(process.env.PORT) || 3000}`;
  const matterUri = `matter://${thingHash}`;
  const thingUrl = `${baseUrl}/thing/${thingHash}`;
  return {
    product: {
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price_cents,
      currency: product.currency,
      image_url: product.image_url,
      category: product.category,
    },
    commerce: {
      merchant_id: product.merchant_id ?? '',
      payment_gateway: 'paystack',
      supported_currencies: [product.currency || 'ZAR'],
      shipping_available: product.shipping_available ?? false,
    },
    metadata: {
      schema_version: '1.0',
      created_at: product.created_at ?? new Date().toISOString(),
      matter_uri: matterUri,
      thing_url: thingUrl,
      stock_count: product.stock_count ?? 0,
    },
  };
}

/** Async write of merchant products list via id-based upsert. */
export async function writeProducts(products: MerchantProduct[]): Promise<void> {
  if (products.length === 0) {
    return;
  }

  const rows = products.map(productToUpsertRow);
  const { error } = await db
    .from('merchant_products')
    .upsert(rows, { onConflict: 'id' });

  if (error) {
    throw new Error(`Failed to save merchant products: ${error.message}`);
  }
}

/** Consumer-facing price (what the buyer pays). Currently same as merchant price_cents. */
export function getConsumerPriceCents(product: MerchantProduct): number {
  return product.price_cents;
}

/** Merchant net amount after platform commission is deducted. */
export function getMerchantPriceCents(product: MerchantProduct): number {
  const commissionRate = parseFloat(process.env.PLATFORM_COMMISSION_RATE ?? '0.06');
  return Math.round(product.price_cents * (1 - commissionRate));
}

const err = (code: string, message: string) => ({ code, message });

const stableStringify = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
      a.localeCompare(b),
    );
    return `{${entries
      .map(([key, val]) => `${JSON.stringify(key)}:${stableStringify(val)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
};

const buildThingHash = (payload: Record<string, unknown>): string =>
  crypto.createHash('sha256').update(stableStringify(payload)).digest('hex');

// Helper to construct thing_file with matter_uri and thing_url from hash
const enrichProductWithThingFile = (product: MerchantProduct): MerchantProduct => {
  if (!product.thing_file?.hash) return product;
  const hash = product.thing_file.hash;
  const baseUrl = process.env.PUBLIC_API_BASE_URL
    || `http://localhost:${process.env.PORT || 3000}`;
  return {
    ...product,
    thing_file: {
      hash,
      matter_uri: `matter://${hash}`,
      thing_url: `${baseUrl.replace(/\/$/, '')}/thing/${hash}`,
    },
  };
};

export const merchantProductsRouter = new Hono();

/** GET /v1/merchant/products — list products (filtered by merchant when auth present) */
merchantProductsRouter.get('/', async (c) => {
  const merchantId = await resolveMerchantId(c);
  if (!merchantId) {
    return c.json(err('unauthorized', 'Unauthorized'), 401);
  }

  const { data, error } = await db
    .from('merchant_products')
    .select('*')
    .eq('merchant_id', merchantId)
    .neq('status', 'archived')
    .order('created_at', { ascending: false });

  if (error) {
    return c.json(err('storage_error', `Failed to load products: ${error.message}`), 500);
  }

  const rows = (data ?? []) as MerchantProductRow[];
  const enriched = rows.map((row) => enrichProductWithThingFile(rowToProduct(row)));
  return c.json({ products: enriched }, 200);
});

/** POST /v1/merchant/products — create product */
merchantProductsRouter.post('/', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (body === null || typeof body !== 'object') {
    return c.json(err('invalid_json', 'Request body must be valid JSON'), 400);
  }

  const title = typeof (body as Record<string, unknown>).title === 'string'
    ? ((body as Record<string, unknown>).title as string).trim()
    : '';
  const priceRaw = (body as Record<string, unknown>).price_cents ?? (body as Record<string, unknown>).price;
  const priceCents = typeof priceRaw === 'number' ? Math.max(0, Math.floor(priceRaw)) : 0;
  const currency = typeof (body as Record<string, unknown>).currency === 'string'
    ? ((body as Record<string, unknown>).currency as string).toUpperCase().slice(0, 3)
    : 'USD';
  const imageUrl = typeof (body as Record<string, unknown>).image_url === 'string'
    ? ((body as Record<string, unknown>).image_url as string).trim()
    : '';
  const description = typeof (body as Record<string, unknown>).description === 'string'
    ? ((body as Record<string, unknown>).description as string).trim()
    : undefined;
  const stockCountRaw = (body as Record<string, unknown>).stock_count;
  const stockCount = typeof stockCountRaw === 'number' && Number.isFinite(stockCountRaw)
    ? Math.max(0, Math.floor(stockCountRaw))
    : 0;
  const shippingAvailable = typeof (body as Record<string, unknown>).shipping_available === 'boolean'
    ? (body as Record<string, unknown>).shipping_available as boolean
    : false;
  const certifications = Array.isArray((body as Record<string, unknown>).certifications)
    ? (body as Record<string, unknown>).certifications as unknown[]
    : [];
  const category = typeof (body as Record<string, unknown>).category === 'string'
    ? ((body as Record<string, unknown>).category as string).trim()
    : undefined;
  const merchantId = await resolveMerchantId(c);

  if (!title) {
    return c.json(err('invalid_product', 'title is required'), 400);
  }

  if (!imageUrl) {
    return c.json(err('invalid_product', 'image_url is required'), 400);
  }

  if (!merchantId) {
    return c.json(err('unauthorized', 'Unauthorized'), 401);
  }

  try {
    const parsed = new URL(imageUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return c.json(err('invalid_product', 'image_url must use http or https'), 400);
    }
  } catch {
    return c.json(err('invalid_product', 'image_url must be a valid URL'), 400);
  }

  const now = new Date().toISOString();
  const productId = crypto.randomUUID();
  const thingHash = buildThingHash({
    id: productId,
    merchant_id: merchantId,
    title,
    description: description ?? '',
    price_cents: priceCents,
    currency: currency || 'ZAR',
    image_url: imageUrl,
    category: category ?? '',
    shipping_available: shippingAvailable,
    certifications,
  });
  const product: MerchantProduct = {
    id: productId,
    title,
    price_cents: priceCents,
    currency: currency || 'ZAR',
    description,
    status: 'draft',
    stock_count: stockCount,
    shipping_available: shippingAvailable,
    certifications,
    thing_file: { hash: thingHash },
    merchant_id: merchantId,
    image_url: imageUrl,
    category,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await db
    .from('merchant_products')
    .insert({
      id: product.id,
      merchant_id: product.merchant_id,
      title: product.title,
      description: product.description ?? null,
      price_cents: product.price_cents,
      currency: product.currency,
      category: product.category ?? null,
      stock_count: product.stock_count ?? 0,
      image_url: product.image_url ?? null,
      shipping_available: product.shipping_available ?? false,
      certifications: product.certifications ?? [],
      thing_file: product.thing_file ?? null,
      status: product.status ?? 'draft',
      created_at: now,
      updated_at: now,
    })
    .select('*')
    .single();

  if (error) {
    return c.json(err('storage_error', `Failed to create product: ${error.message}`), 500);
  }

  const enriched = enrichProductWithThingFile(rowToProduct(data as MerchantProductRow));
  return c.json(enriched, 201);
});

/** GET /v1/merchant/products/:id — get single product */
merchantProductsRouter.get('/:id', async (c) => {
  const merchantId = await resolveMerchantId(c);
  if (!merchantId) {
    return c.json(err('unauthorized', 'Unauthorized'), 401);
  }

  const id = c.req.param('id');

  const { data, error } = await db
    .from('merchant_products')
    .select('*')
    .eq('id', id)
    .eq('merchant_id', merchantId)
    .single();

  if (error || !data) {
    return c.json(err('not_found', 'Product not found'), 404);
  }

  return c.json(rowToProduct(data as MerchantProductRow), 200);
});

/** PATCH /v1/merchant/products/:id — update product */
merchantProductsRouter.patch('/:id', async (c) => {
  const merchantId = await resolveMerchantId(c);
  if (!merchantId) {
    return c.json(err('unauthorized', 'Unauthorized'), 401);
  }

  const id = c.req.param('id');
  const body = await c.req.json().catch(() => null);
  if (body === null || typeof body !== 'object') {
    return c.json(err('invalid_json', 'Request body must be valid JSON'), 400);
  }

  const { data: existingData, error: existingError } = await db
    .from('merchant_products')
    .select('*')
    .eq('id', id)
    .single();

  if (existingError || !existingData) {
    return c.json(err('not_found', 'Product not found'), 404);
  }

  if ((existingData as MerchantProductRow).merchant_id !== merchantId) {
    return c.json(err('forbidden', 'Forbidden'), 403);
  }

  const product = rowToProduct(existingData as MerchantProductRow);
  const updates = body as Record<string, unknown>;
  if (typeof updates.title === 'string') product.title = updates.title.trim();
  if (typeof updates.price_cents === 'number') product.price_cents = Math.max(0, Math.floor(updates.price_cents));
  if (typeof updates.currency === 'string') product.currency = updates.currency.toUpperCase().slice(0, 3);
  if (updates.status === 'draft' || updates.status === 'published') product.status = updates.status;
  if (typeof updates.stock_count === 'number') product.stock_count = Math.max(0, Math.floor(updates.stock_count));
  if (typeof updates.thing_hash === 'string') product.thing_file = { hash: updates.thing_hash };
  if (Object.prototype.hasOwnProperty.call(updates, 'image_url')) {
    if (typeof updates.image_url !== 'string') {
      return c.json(err('invalid_product', 'image_url must be a string'), 400);
    }

    const imageUrl = updates.image_url.trim();
    if (!imageUrl) {
      return c.json(err('invalid_product', 'image_url cannot be empty'), 400);
    }

    try {
      const parsed = new URL(imageUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return c.json(err('invalid_product', 'image_url must use http or https'), 400);
      }
    } catch {
      return c.json(err('invalid_product', 'image_url must be a valid URL'), 400);
    }

    product.image_url = imageUrl;
  }
  if (typeof updates.category === 'string') product.category = updates.category;
  product.updated_at = new Date().toISOString();

  const { data, error } = await db
    .from('merchant_products')
    .update(productToUpsertRow(product))
    .eq('id', id)
    .eq('merchant_id', merchantId)
    .select('*')
    .single();

  if (error || !data) {
    return c.json(err('storage_error', `Failed to update product: ${error?.message ?? 'unknown error'}`), 500);
  }

  return c.json(rowToProduct(data as MerchantProductRow), 200);
});

/** DELETE /v1/merchant/products/:id */
merchantProductsRouter.delete('/:id', async (c) => {
  const merchantId = await resolveMerchantId(c);
  if (!merchantId) {
    return c.json(err('unauthorized', 'Unauthorized'), 401);
  }

  const id = c.req.param('id');

  const { data: existingData, error: existingError } = await db
    .from('merchant_products')
    .select('merchant_id')
    .eq('id', id)
    .single();

  if (existingError || !existingData) {
    return c.json(err('not_found', 'Product not found'), 404);
  }

  if ((existingData as { merchant_id: string | null }).merchant_id !== merchantId) {
    return c.json(err('forbidden', 'Forbidden'), 403);
  }

  const { data, error } = await db
    .from('merchant_products')
    .update({ status: 'archived', updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('merchant_id', merchantId)
    .select('id')
    .single();

  if (error || !data) {
    return c.json(err('not_found', 'Product not found'), 404);
  }

  return c.json({ ok: true }, 200);
});
