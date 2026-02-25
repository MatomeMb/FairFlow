/**
 * Merchant Products API
 * 
 * Template-based product creation (replaces CSV upload for pivot)
 */

import { Hono } from 'hono';
import { z } from 'zod';
import crypto from 'node:crypto';
import { promises as fs } from 'node:fs';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataRoot = path.join(__dirname, '..', 'data');
const merchantProductsFile = path.join(dataRoot, 'merchant-products.json');
const thingsDir = path.join(dataRoot, 'things');
const indexFile = path.join(dataRoot, 'index.json');

// TypeScript interface
export interface MerchantProduct {
  id: string;
  merchant_id: string;
  title: string;
  description?: string;
  price_cents: number;
  currency: 'ZAR';
  category?: string;
  stock_count: number;
  image_url?: string;
  shipping_available: boolean;
  certifications: string[];
  thing_file: {
    hash: string;
    matter_uri: string;
    thing_url: string;
    generated_at: string;
  };
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

// Zod validation schema
const CreateProductSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be 255 characters or less'),
  description: z.string().optional(),
  price_cents: z.number().int().positive('Price must be greater than 0'),
  category: z.enum(['coffee', 'textiles', 'food', 'crafts', 'other']).optional(),
  stock_count: z.number().int().nonnegative('Stock count must be 0 or greater'),
  image_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  shipping_available: z.boolean().default(false),
  certifications: z.array(z.string()).default([]),
});

type CreateProductInput = z.infer<typeof CreateProductSchema>;

// Index types (from main index.ts)
type StoredThing = {
  hash: string;
  matter_uri: string;
  thing_url: string;
  thing_path: string;
  thing_file: any;
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

// Pure functions for data persistence

export function readProducts(): MerchantProduct[] {
  try {
    if (!existsSync(merchantProductsFile)) {
      return [];
    }
    const raw = readFileSync(merchantProductsFile, 'utf8');
    return JSON.parse(raw) as MerchantProduct[];
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

export function writeProducts(products: MerchantProduct[]): void {
  const dirPath = path.dirname(merchantProductsFile);
  if (!existsSync(dirPath)) {
    throw new Error(`Data directory does not exist: ${dirPath}`);
  }
  const json = JSON.stringify(products, null, 2);
  writeFileSync(merchantProductsFile, json, 'utf8');
}

// Index management functions
export function readIndex(): IndexStore {
  try {
    if (!existsSync(indexFile)) {
      return {};
    }
    const raw = readFileSync(indexFile, 'utf8');
    return JSON.parse(raw) as IndexStore;
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === 'ENOENT') {
      return {};
    }
    throw error;
  }
}

export function writeIndex(index: IndexStore): void {
  writeFileSync(indexFile, JSON.stringify(index, null, 2), 'utf8');
}

export function compileThing(
  input: CreateProductInput,
  merchant_id: string,
  baseUrl: string
): {
  hash: string;
  matter_uri: string;
  thing_url: string;
  thing_json: any;
  generated_at: string;
} {
  const generated_at = new Date().toISOString();
  
  // Build .thing file payload matching existing ThingFile structure
  const thing_json: any = {
    product: {
      title: input.title,
      description: input.description,
      price: input.price_cents,
      currency: 'ZAR',
      image_url: input.image_url,
      category: input.category,
    },
    commerce: {
      merchant_id,
      payment_gateway: 'stripe' as const,
      supported_currencies: ['ZAR'],
      shipping_available: input.shipping_available,
    },
    metadata: {
      schema_version: '1.0' as const,
      created_at: generated_at,
      certifications: input.certifications,
      stock_count: input.stock_count,
    },
  };

  // Create deterministic hash (stable stringify with sorted keys)
  const stableStringify = (obj: any): string => {
    if (Array.isArray(obj)) {
      return `[${obj.map(stableStringify).join(',')}]`;
    }
    if (obj && typeof obj === 'object') {
      const entries = Object.entries(obj).sort(([a], [b]) => a.localeCompare(b));
      return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`).join(',')}}`;
    }
    return JSON.stringify(obj);
  };

  const payload = stableStringify(thing_json);
  const hash = crypto.createHash('sha256').update(payload).digest('hex');
  const matter_uri = `matter://${hash}`;
  const thing_url = `${baseUrl}/thing/${hash}.json`;

  // Add matter_uri and thing_url to metadata
  (thing_json.metadata as any).matter_uri = matter_uri;
  (thing_json.metadata as any).thing_url = thing_url;

  return {
    hash,
    matter_uri,
    thing_url,
    thing_json,
    generated_at,
  };
}

// Hono router
export const merchantProductsRouter = new Hono();

// POST / - Create product
merchantProductsRouter.post('/', async (c) => {
  try {
    const body = await c.req.json();
    
    // Validate input
    const parsed = CreateProductSchema.safeParse(body);
    if (!parsed.success) {
      return c.json(
        {
          code: 'validation_error',
          message: 'Invalid product data',
          details: parsed.error.format(),
        },
        400
      );
    }

    const input = parsed.data;
    
    // Get merchant_id from header or use fallback
    const merchant_id = c.req.header('x-merchant-id') || 'dev-merchant-001';
    
    // Get base URL from env or use default
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    
    // Compile .thing file
    const { hash, matter_uri, thing_url, thing_json, generated_at } = compileThing(
      input,
      merchant_id,
      baseUrl
    );
    
    // Write .thing file to data/things/<hash>.json
    await fs.mkdir(thingsDir, { recursive: true });
    const thingFilePath = path.join(thingsDir, `${hash}.json`);
    await fs.writeFile(thingFilePath, JSON.stringify(thing_json, null, 2), 'utf8');
    
    // Update index.json to register the product
    const index = readIndex();
    index[hash] = {
      hash,
      matter_uri,
      thing_url,
      thing_path: thingFilePath,
      thing_file: thing_json,
      image_url: input.image_url,
      checkout_url: undefined,
      gist: {
        title: input.title,
        price: input.price_cents,
        currency: 'ZAR',
        image_url: input.image_url,
      },
      created_at: generated_at,
    };
    writeIndex(index);
    
    // Create product record
    const product: MerchantProduct = {
      id: crypto.randomUUID(),
      merchant_id,
      title: input.title,
      description: input.description,
      price_cents: input.price_cents,
      currency: 'ZAR',
      category: input.category,
      stock_count: input.stock_count,
      image_url: input.image_url || undefined,
      shipping_available: input.shipping_available,
      certifications: input.certifications,
      thing_file: {
        hash,
        matter_uri,
        thing_url,
        generated_at,
      },
      status: 'published',
      created_at: generated_at,
      updated_at: generated_at,
    };
    
    // Insert into merchant-products.json
    const products = readProducts();
    products.push(product);
    writeProducts(products);
    
    return c.json(product, 201);
  } catch (error) {
    console.error('Error creating product:', error);
    return c.json(
      {
        code: 'internal_error',
        message: 'Failed to create product',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

// GET / - List products
merchantProductsRouter.get('/', (c) => {
  try {
    const products = readProducts();
    
    // Optional: filter by merchant_id from header
    const merchant_id = c.req.header('x-merchant-id');
    if (merchant_id) {
      const filtered = products.filter((p) => p.merchant_id === merchant_id);
      return c.json(filtered);
    }
    
    return c.json(products);
  } catch (error) {
    console.error('Error reading products:', error);
    return c.json(
      {
        code: 'internal_error',
        message: 'Failed to read products',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});
