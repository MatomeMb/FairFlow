/**
 * Shadow Index API
 * 
 * Fast hash-to-artifact resolution service
 * Deployed on Vercel Edge Functions
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import crypto from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { isR2Configured, uploadThing, getThing } from '../lib/storage.js';
import { getReport, validateDateRange } from '../lib/analytics-report.js';
import { recordQuery, startQuery, endQuery } from '../lib/dashboard-metrics.js';
import { getCached, setCached, invalidateCache, buildCacheKey } from '../lib/query-cache.js';
import { logError } from '../lib/error-logger.js';
import { dashboardHandler } from './dashboard.js';
import { RetentionPolicy } from '../lib/retention-policy.js';
import { isApiKeyValid } from '../lib/api-key-registry.js';

const app = new Hono();

// Allow extension/page on different origin (e.g. localhost:5177) to call API
app.use('*', cors());

/** Optional API key (MVP-09). If set, require x-api-key or Authorization: Bearer <key>. Supports revocation via SHADOW_INDEX_REVOKED_KEYS. */
app.use('*', async (c, next) => {
  const hasKeys = process.env.SHADOW_INDEX_API_KEY || process.env.SHADOW_INDEX_API_KEYS;
  if (!hasKeys) {
    return next();
  }
  const headerKey = c.req.header('x-api-key');
  const auth = c.req.header('Authorization');
  const bearer = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  const key = headerKey ?? bearer;
  if (!isApiKeyValid(key)) {
    return c.json(err('unauthorized', 'Invalid or missing API key'), 401);
  }
  return next();
});

/** Rate limit (MVP-09). Configurable via RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX. Default 100 req/min per IP. */
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '60000', 10) || 60_000;
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX ?? '100', 10) || 100;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function getClientId(c: { req: { header: (n: string) => string | undefined } }): string {
  const forwarded = c.req.header('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return c.req.header('x-real-ip') ?? 'unknown';
}
app.use('*', async (c, next) => {
  const id = getClientId(c);
  const now = Date.now();
  let entry = rateLimitMap.get(id);
  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
    rateLimitMap.set(id, entry);
  }
  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX) {
    return c.json(err('rate_limit_exceeded', 'Too many requests; try again later'), 429);
  }
  return next();
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataRoot = path.join(__dirname, '..', 'data');
const thingsDir = path.join(dataRoot, 'things');
const indexFile = path.join(dataRoot, 'index.json');

/** Events dir: override via ANALYTICS_EVENTS_DIR for tests */
function getEventsDir(): string {
  return process.env.ANALYTICS_EVENTS_DIR || path.join(dataRoot, 'events');
}

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

const viewEventSchema = z.object({
  event: z.literal('view'),
  hash: z.string().regex(/^[a-f0-9]{64}$/),
  timestamp: z.string().datetime().optional(),
  source_url: z.string().url(),
  anon_id: z.string().optional(),
});

const clickEventSchema = z.object({
  event: z.literal('click'),
  hash: z.string().regex(/^[a-f0-9]{64}$/),
  timestamp: z.string().datetime().optional(),
  source_url: z.string().url(),
  target_action: z.enum(['checkout_initiated', 'image_expanded', 'external_link']),
  anon_id: z.string().optional(),
});

const analyticsEventSchema = z.discriminatedUnion('event', [viewEventSchema, clickEventSchema]);

type StoredThing = {
  hash: string;
  matter_uri: string;
  thing_url: string;
  thing_path: string;
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
};

const loadIndex = async (): Promise<IndexStore> => {
  try {
    const raw = await fs.readFile(indexFile, 'utf8');
    return JSON.parse(raw) as IndexStore;
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === 'ENOENT') {
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

/** Consistent error response shape for MVP flows (MVP-10) */
type ErrorPayload = { code: string; message: string; details?: unknown };
const err = (code: string, message: string, details?: unknown): ErrorPayload =>
  details !== undefined ? { code, message, details } : { code, message };

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
    const port = Number(process.env.PORT) || 3000;
    const baseUrl = `http://localhost:${port}`;
    thingUrl = `${baseUrl}/thing/${hash}`;
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

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'shadow-index',
    company: 'fairflow',
    version: '0.6.0',
    timestamp: new Date().toISOString(),
  });
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

// Analytics Event Ingestion (MVP-14)
app.post('/v1/analytics/event', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (body === null) {
    return c.json(err('invalid_json', 'Request body must be valid JSON'), 400);
  }

  const parsed = analyticsEventSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(err('invalid_event', 'Invalid event payload', parsed.error.flatten()), 400);
  }

  const event = {
    ...parsed.data,
    timestamp: parsed.data.timestamp ?? new Date().toISOString(),
  };
  const date = new Date().toISOString().split('T')[0];
  const eventsDir = getEventsDir();
  const logFile = path.join(eventsDir, `${date}.jsonl`);

  try {
    await fs.mkdir(eventsDir, { recursive: true });
    await fs.appendFile(logFile, JSON.stringify(event) + '\n', 'utf8');
    invalidateCache();
    return c.json({ ok: true }, 201);
  } catch (error) {
    console.error(`[Analytics Error] ${error}`);
    return c.json(err('storage_error', 'Failed to persist analytics event'), 500);
  }
});

/** MVP-14: Report query params */
const ReportQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  groupBy: z.enum(['day', 'hash', 'both']).optional().default('day'),
  sortBy: z.enum(['date', 'views', 'clicks']).optional().default('date'),
  limit: z.coerce.number().int().min(1).max(1000).optional().default(100),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

// MVP-14: Analytics report (GET /v1/analytics/report)
app.get('/v1/analytics/report', async (c) => {
  const raw = Object.fromEntries(c.req.url ? new URL(c.req.url).searchParams : []);
  const parsed = ReportQuerySchema.safeParse(raw);
  if (!parsed.success) {
    return c.json(
      err('invalid_params', 'Invalid query parameters', parsed.error.flatten()),
      400
    );
  }
  const { from, to, groupBy, sortBy, limit, offset } = parsed.data;
  const rangeErr = validateDateRange(from, to);
  if (rangeErr) {
    return c.json(
      err('invalid_params', rangeErr === 'from > to' ? 'from must be ≤ to' : rangeErr),
      400
    );
  }
  const params = { from, to, groupBy, sortBy, limit, offset };
  const cacheKey = buildCacheKey({ from, to, groupBy, sortBy, limit, offset });

  startQuery();
  const t0 = performance.now();
  try {
    let result = getCached(cacheKey);
    if (result) {
      const durationMs = Math.round(performance.now() - t0);
      recordQuery(params, durationMs, result.rows.length);
      endQuery();
      return c.json(result, 200);
    }

    result = await getReport(getEventsDir(), from, to, groupBy, sortBy, limit, offset);
    const durationMs = Math.round(performance.now() - t0);
    const resultCount = result.ok ? result.rows.length : 0;
    if (!result.ok) {
      logError(params, result.error ?? 'Invalid parameters');
      recordQuery(params, durationMs, 0, result.error ?? '');
      endQuery();
      return c.json(err('invalid_params', result.error ?? 'Invalid parameters'), 400);
    }
    setCached(cacheKey, result);
    recordQuery(params, durationMs, resultCount);
    endQuery();
    return c.json(result, 200);
  } catch (e) {
    const durationMs = Math.round(performance.now() - t0);
    const message = e instanceof Error ? e.message : String(e);
    const stack = e instanceof Error ? e.stack : undefined;
    logError(params, message, stack);
    recordQuery(params, durationMs, 0, message);
    endQuery();
    return c.json(err('report_failed', message), 500);
  }
});

// Sprint 4: Analytics dashboard (GET /v1/analytics/dashboard)
const STORAGE_QUOTA_BYTES = parseInt(process.env.STORAGE_QUOTA_BYTES ?? String(5 * 1024 * 1024 * 1024), 10) || 5 * 1024 * 1024 * 1024;
app.get('/v1/analytics/dashboard', (c) => dashboardHandler(c, {
  eventsDir: getEventsDir(),
  dataRoot,
  quotaBytes: STORAGE_QUOTA_BYTES,
}));

// Sprint 4 Week 2: Retention policy — manual trigger (POST /v1/admin/retention/run)
app.post('/v1/admin/retention/run', async (c) => {
  const eventsDir = getEventsDir();
  const archiveDir = path.join(dataRoot, 'archive');
  const retentionDays = parseInt(process.env.RETENTION_DAYS ?? '90', 10) || 90;

  const policy = new RetentionPolicy({
    eventsDir,
    archiveDir,
    retentionDays,
  });

  try {
    const result = await policy.execute();
    const accept = c.req.header('Accept') ?? '';
    const isForm = c.req.header('Content-Type')?.includes('application/x-www-form-urlencoded');

    if (accept.includes('text/html') || isForm) {
      return c.redirect(`/v1/analytics/dashboard?retention_processed=${result.processed}&retention_archived=${result.archived}`);
    }
    return c.json({
      ok: true,
      processed: result.processed,
      archived: result.archived,
      errors: result.errors,
    }, 200);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return c.json(err('retention_failed', message), 500);
  }
});

// Sprint 4 Week 3: Cache invalidation (POST /v1/admin/cache/clear)
app.post('/v1/admin/cache/clear', (c) => {
  invalidateCache();
  const accept = c.req.header('Accept') ?? '';
  const isForm = c.req.header('Content-Type')?.includes('application/x-www-form-urlencoded');
  if (accept.includes('text/html') || isForm) {
    return c.redirect('/v1/analytics/dashboard?cache_cleared=1');
  }
  return c.json({ ok: true, message: 'Cache cleared' }, 200);
});

// Serve .thing payloads for MVP (from R2 or local)
app.get('/thing/:hash', async (c) => {
  const hash = c.req.param('hash');
  if (useR2) {
    const data = await getThing(hash);
    if (data === null) {
      return c.json(err('not_found', `No .thing file found for hash: ${hash}`, { hash }), 404);
    }
    return c.body(new Uint8Array(data), 200, {
      'Content-Type': 'application/octet-stream',
    });
  }
  const filePath = path.join(thingsDir, `${hash}.thing`);
  try {
    const data = await fs.readFile(filePath);
    return c.body(new Uint8Array(data), 200, {
      'Content-Type': 'application/octet-stream',
    });
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === 'ENOENT') {
      return c.json(err('not_found', `No .thing file found for hash: ${hash}`, { hash }), 404);
    }
    throw error;
  }
});

// Development server - skip when NODE_ENV=test so tests can import app without starting server
const port = Number(process.env.PORT) || 3000;
if (process.env.NODE_ENV !== 'test') {
  console.log('');
  console.log('  fairflow - Shadow Index API');
  console.log('  ---------------------------');
  console.log(`  API:       http://localhost:${port}`);
  console.log(`  Health:    http://localhost:${port}/health`);
  console.log(`  Dashboard: http://localhost:${port}/v1/analytics/dashboard`);
  if (useR2) console.log('  Storage:   R2 enabled');
  console.log('');
  serve({
    fetch: app.fetch,
    port,
  });
}

// Export for Vercel Edge Functions and tests
export default app;
