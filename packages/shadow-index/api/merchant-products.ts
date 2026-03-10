/**
 * Merchant Products API
 *
 * CRUD for merchant-managed products with stock, status, and thing_file linkage.
 * Products are stored in data/merchant_products.json (sync I/O for request-time reads).
 */

import { Hono } from 'hono';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataRoot = process.env.VERCEL
  ? path.join('/tmp', 'data')
  : path.join(__dirname, '..', 'data');
const productsFile = path.join(dataRoot, 'merchant_products.json');

/** Merchant product with stock, status, and thing linkage */
export type MerchantProduct = {
  id: string;
  title: string;
  price_cents: number;
  currency: string;
  status?: 'draft' | 'published';
  stock_count?: number;
  thing_file?: { hash: string; matter_uri?: string; thing_url?: string };
  category?: string;
  merchant_id?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
};

function loadProductsFromDisk(): MerchantProduct[] {
  try {
    if (!existsSync(productsFile)) return [];
    const raw = readFileSync(productsFile, 'utf8');
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveProductsToDisk(products: MerchantProduct[]): void {
  mkdirSync(path.dirname(productsFile), { recursive: true });
  writeFileSync(productsFile, JSON.stringify(products, null, 2), 'utf8');
}

/** Sync read of merchant products (used by index.ts for restock, catalog, checkout) */
export function readProducts(): MerchantProduct[] {
  return loadProductsFromDisk();
}

/** Sync write of merchant products */
export function writeProducts(products: MerchantProduct[]): void {
  saveProductsToDisk(products);
}

const err = (code: string, message: string) => ({ code, message });

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
merchantProductsRouter.get('/', (c) => {
  const products = readProducts();
  const enriched = products.map(enrichProductWithThingFile);
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

  if (!title) {
    return c.json(err('invalid_product', 'title is required'), 400);
  }

  if (!imageUrl) {
    return c.json(err('invalid_product', 'image_url is required'), 400);
  }

  try {
    const parsed = new URL(imageUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return c.json(err('invalid_product', 'image_url must use http or https'), 400);
    }
  } catch {
    return c.json(err('invalid_product', 'image_url must be a valid URL'), 400);
  }

  const products = readProducts();
  const product: MerchantProduct = {
    id: crypto.randomUUID(),
    title,
    price_cents: priceCents,
    currency: currency || 'USD',
    status: 'draft',
    stock_count: 0,
    thing_file: undefined,
    merchant_id: (body as Record<string, unknown>).merchant_id as string | undefined,
    image_url: imageUrl,
    category: (body as Record<string, unknown>).category as string | undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  products.push(product);
  writeProducts(products);

  // Return enriched product (will have empty thing_file until compiled)
  const enriched = enrichProductWithThingFile(product);
  return c.json(enriched, 201);
});

/** GET /v1/merchant/products/:id — get single product */
merchantProductsRouter.get('/:id', (c) => {
  const id = c.req.param('id');
  const products = readProducts();
  const product = products.find((p) => p.id === id);
  if (!product) {
    return c.json(err('not_found', 'Product not found'), 404);
  }
  return c.json(product, 200);
});

/** PATCH /v1/merchant/products/:id — update product */
merchantProductsRouter.patch('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => null);
  if (body === null || typeof body !== 'object') {
    return c.json(err('invalid_json', 'Request body must be valid JSON'), 400);
  }

  const products = readProducts();
  const idx = products.findIndex((p) => p.id === id);
  if (idx < 0) {
    return c.json(err('not_found', 'Product not found'), 404);
  }

  const product = products[idx];
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

  writeProducts(products);
  return c.json(product, 200);
});

/** DELETE /v1/merchant/products/:id */
merchantProductsRouter.delete('/:id', (c) => {
  const id = c.req.param('id');
  const products = readProducts();
  const filtered = products.filter((p) => p.id !== id);
  if (filtered.length === products.length) {
    return c.json(err('not_found', 'Product not found'), 404);
  }
  writeProducts(filtered);
  return c.json({ ok: true }, 200);
});
