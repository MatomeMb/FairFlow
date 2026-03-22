import { Hono } from 'hono';
import crypto from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { err } from '../shared/errors.js';
import { logger } from '../../lib/logger.js';
import {
  dataRoot,
  thingsDir,
  indexFile,
  uploadsDir,
} from '../shared/server-paths.js';
import { isR2Configured, uploadThing, getThing } from '../../lib/storage.js';
import {
  readProducts,
  findMerchantProductByThingHashAnyStatus,
  getConsumerPriceCents,
  buildThingJsonFromMerchantProduct,
  type MerchantProduct,
} from '../merchant-products.js';

const storageMode = process.env.STORAGE_MODE || 'local';
const useR2 = storageMode === 'r2' && isR2Configured();

export const compilerRouter = new Hono();
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
// Compile endpoint - transforms product data into .thing file (uses shared compileAndPersistProduct)
compilerRouter.post('/compile', async (c) => {
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
compilerRouter.get('/resolve/:hash', async (c) => {
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
compilerRouter.get('/gist/:hash', async (c) => {
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

// Get full thing file (product detail) by hash
compilerRouter.get('/thing/:hash', async (c) => {
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
compilerRouter.post('/batch', async (c) => {
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
compilerRouter.post('/catalog/import', async (c) => {
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
compilerRouter.get('/catalog/public', async (c) => {
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
compilerRouter.get('/thing-bin/:hash', async (c) => {
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