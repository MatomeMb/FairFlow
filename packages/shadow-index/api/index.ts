/**
 * Shadow Index API
 * 
 * Fast hash-to-artifact resolution service
 * Deployed on Vercel Edge Functions
 */

import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import crypto from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const app = new Hono();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataRoot = path.join(__dirname, '..', 'data');
const thingsDir = path.join(dataRoot, 'things');
const indexFile = path.join(dataRoot, 'index.json');

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

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'shadow-index', timestamp: new Date().toISOString() });
});

// Compile endpoint - transforms product data into .thing file
app.post('/compile', async (c) => {
  await ensureDataDirs();
  const body = await c.req.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Invalid product payload', details: parsed.error.flatten() }, 400);
  }

  const createdAt = new Date().toISOString();
  const product = { ...parsed.data, created_at: createdAt };
  const hash = hashProduct(product);
  const matterUri = buildMatterUri(hash);
  const thingPayload = buildThingPayload(hash, product);
  const thingPath = path.join(thingsDir, `${hash}.thing`);
  await fs.writeFile(thingPath, JSON.stringify(thingPayload, null, 2), 'utf8');

  const port = Number(process.env.PORT) || 3000;
  const baseUrl = `http://localhost:${port}`;
  const thingUrl = `${baseUrl}/thing/${hash}`;

  const index = await loadIndex();
  index[hash] = {
    hash,
    matter_uri: matterUri,
    thing_url: thingUrl,
    thing_path: thingPath,
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
    return c.json({ error: 'Not found', hash }, 404);
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
    return c.json({ error: 'Not found', hash }, 404);
  }
  return c.json({
    hash: entry.hash,
    gist: entry.gist,
    checkout_url: entry.checkout_url,
  });
});

// Batch compilation endpoint
app.post('/batch', async (c) => {
  // TODO: Implement batch compilation
  return c.json({ error: 'Not implemented yet' }, 501);
});

// Serve .thing payloads for MVP
app.get('/thing/:hash', async (c) => {
  const hash = c.req.param('hash');
  const filePath = path.join(thingsDir, `${hash}.thing`);
  try {
    const data = await fs.readFile(filePath);
    return c.body(data, 200, {
      'Content-Type': 'application/octet-stream',
    });
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === 'ENOENT') {
      return c.json({ error: 'Not found', hash }, 404);
    }
    throw error;
  }
});

// Development server - always start in dev mode
const port = Number(process.env.PORT) || 3000;
console.log(`🚀 Shadow Index API starting on http://localhost:${port}`);
console.log(`📡 Health check: http://localhost:${port}/health`);
serve({
  fetch: app.fetch,
  port,
});

// Export for Vercel Edge Functions
export default app;
