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

const app = new Hono();

// Allow extension/page on different origin (e.g. localhost:5177) to call API
app.use('*', cors());

/** Optional API key (MVP-09). If set, require x-api-key or Authorization: Bearer <key>. Read at request time for testability. */
app.use('*', async (c, next) => {
  const apiKey = process.env.SHADOW_INDEX_API_KEY;
  if (!apiKey) {
    return next();
  }
  const headerKey = c.req.header('x-api-key');
  const auth = c.req.header('Authorization');
  const bearer = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  const key = headerKey ?? bearer;
  if (key !== apiKey) {
    return c.json(err('unauthorized', 'Invalid or missing API key'), 401);
  }
  return next();
});

/** Simple in-memory rate limit (MVP-09): 100 req/min per IP (or per key when key is set). */
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 100;
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

const buildThingPayload = (hash: string, product: ProductInput) => ({
  hash,
  ...product,
});

const buildMatterUri = (hash: string) => `matter://${hash}`;

/** Consistent error response shape for MVP flows (MVP-10) */
type ErrorPayload = { code: string; message: string; details?: unknown };
const err = (code: string, message: string, details?: unknown): ErrorPayload =>
  details !== undefined ? { code, message, details } : { code, message };

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'shadow-index', timestamp: new Date().toISOString() });
});

// Compile endpoint - transforms product data into .thing file
app.post('/compile', async (c) => {
  await ensureDataDirs();
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

  const createdAt = new Date().toISOString();
  const product = { ...parsed.data, created_at: createdAt };
  const hash = hashProduct(parsed.data);
  const matterUri = buildMatterUri(hash);
  const thingPayload = buildThingPayload(hash, product);
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
    image_url: parsed.data.image_url,
    checkout_url: parsed.data.checkout_url,
    gist: {
      title: parsed.data.title,
      price: parsed.data.price,
      currency: parsed.data.currency,
      image_url: parsed.data.image_url,
    },
    created_at: createdAt,
  };
  await saveIndex(index);

  return c.json({
    hash,
    matter_uri: matterUri,
    thing_url: thingUrl,
    image_url: parsed.data.image_url,
    gist: index[hash].gist,
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

// Batch compilation endpoint
app.post('/batch', async (c) => {
  return c.json(err('not_implemented', 'Batch compilation is not yet implemented'), 501);
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
  console.log(`🚀 Shadow Index API starting on http://localhost:${port}`);
  console.log(`📡 Health check: http://localhost:${port}/health`);
  if (useR2) console.log('📦 R2 storage enabled');
  serve({
    fetch: app.fetch,
    port,
  });
}

// Export for Vercel Edge Functions and tests
export default app;
