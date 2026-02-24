/**
 * Shadow Index API — MVP path tests (compile + resolve + health).
 * Uses app.request() so no server required; all tests run in-process.
 */

import app from './index';

const BASE = 'http://localhost';

async function request(path: string, init?: RequestInit): Promise<Response> {
  return app.request(new Request(`${BASE}${path}`, init));
}

type CompileResponse = {
  hash: string;
  matter_uri: string;
  thing_url: string;
  gist: { title: string; price: number; [k: string]: unknown };
  [k: string]: unknown;
};

type ResolveResponse = {
  hash: string;
  gist?: { title?: string; price?: number; [k: string]: unknown };
  matter_uri?: string;
  checkout_url?: string;
  thing_url?: string;
  [k: string]: unknown;
};

type ErrorResponse = { code?: string; message?: string; details?: unknown; [k: string]: unknown };

describe('POST /compile', () => {
  const validProduct = {
    title: 'Vitest Demo Product',
    price: 9999,
    currency: 'USD',
    image_url: 'https://example.com/demo.jpg',
    checkout_url: 'https://example.com/buy',
  };

  it('valid product body → 200', async () => {
    const res = await request('/compile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validProduct),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as CompileResponse;
    expect(typeof body.hash).toBe('string');
    expect(body.hash.length).toBeGreaterThan(0);
    expect(body.matter_uri).toMatch(/^matter:\/\//);
    expect(typeof body.thing_url).toBe('string');
    expect(body.gist).toBeDefined();
    expect(body.gist.title).toBe(validProduct.title);
    expect(body.gist.price).toBe(validProduct.price);
  });

  it('invalid JSON body → 400', async () => {
    const res = await request('/compile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as ErrorResponse;
    expect(body.code).toBe('invalid_json');
  });

  it('missing required field → 400', async () => {
    const res = await request('/compile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price: 100, currency: 'USD' }),
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as ErrorResponse;
    expect(body.code).toBe('invalid_product');
    expect(typeof body.message).toBe('string');
  });

  it('invalid price type → 400', async () => {
    const res = await request('/compile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test',
        price: 'not-a-number',
        currency: 'USD',
      }),
    });
    expect(res.status).toBe(400);
  });

  it('idempotent hash — same body twice returns same hash', async () => {
    const res1 = await request('/compile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validProduct),
    });
    const res2 = await request('/compile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validProduct),
    });
    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    const body1 = (await res1.json()) as CompileResponse;
    const body2 = (await res2.json()) as CompileResponse;
    expect(body1.hash).toBe(body2.hash);
  });
});

describe('GET /resolve/:hash', () => {
  it('known hash → 200', async () => {
    const compileRes = await request('/compile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Resolve Test',
        price: 1999,
        currency: 'USD',
      }),
    });
    const compileBody = (await compileRes.json()) as CompileResponse;
    const { hash } = compileBody;
    const res = await request(`/resolve/${hash}`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as ResolveResponse;
    expect(body.hash).toBe(hash);
    expect(body.gist?.title).toBeDefined();
    expect(body.gist?.price).toBeDefined();
    expect(body.matter_uri).toMatch(/^matter:\/\//);
    expect(body.checkout_url !== undefined || body.thing_url).toBeDefined();
  });

  it('unknown hash → 404', async () => {
    const res = await request(
      '/resolve/0000000000000000000000000000000000000000000000000000000000000000'
    );
    expect(res.status).toBe(404);
  });
});

describe('GET /health', () => {
  it('returns 200', async () => {
    const res = await request('/health');
    expect(res.status).toBe(200);
  });
});

// MVP-09: Auth (optional API key). Uses app.request(); env set before import.
describe('MVP-09: Auth when SHADOW_INDEX_API_KEY is set', () => {
  let appWithKey: typeof app;

  beforeAll(async () => {
    (globalThis as unknown as { __saved_api_key?: string }).__saved_api_key =
      process.env.SHADOW_INDEX_API_KEY;
    process.env.SHADOW_INDEX_API_KEY = 'testkey';
    const mod = await import('./index');
    appWithKey = mod.default;
  });

  afterAll(() => {
    const saved = (globalThis as unknown as { __saved_api_key?: string }).__saved_api_key;
    if (saved !== undefined) process.env.SHADOW_INDEX_API_KEY = saved;
    else delete process.env.SHADOW_INDEX_API_KEY;
  });

  it('returns 200 for /health without API key (whitelisted for observability)', async () => {
    const res = await appWithKey.request(
      new Request(`${BASE}/health`, {
        headers: { 'x-forwarded-for': 'test-auth-1' },
      })
    );
    expect(res.status).toBe(200);
  });

  it('returns 200 for /health with any API key (whitelisted for observability)', async () => {
    const res = await appWithKey.request(
      new Request(`${BASE}/health`, {
        headers: { 'x-api-key': 'wrong', 'x-forwarded-for': 'test-auth-2' },
      })
    );
    expect(res.status).toBe(200);
  });

  it('returns 200 when x-api-key is valid on /health', async () => {
    const res = await appWithKey.request(
      new Request(`${BASE}/health`, {
        headers: { 'x-api-key': 'testkey', 'x-forwarded-for': 'test-auth-3' },
      })
    );
    expect(res.status).toBe(200);
  });

  it('returns 200 when Authorization Bearer is valid', async () => {
    const res = await appWithKey.request(
      new Request(`${BASE}/health`, {
        headers: { Authorization: 'Bearer testkey', 'x-forwarded-for': 'test-auth-4' },
      })
    );
    expect(res.status).toBe(200);
  });
});

// Sprint 4 — MVP-11: Batch compilation
describe('POST /batch', () => {
  it('valid products array → 200 and correct number of results', async () => {
    const res = await request('/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        products: [
          { title: 'Batch A', price: 100, currency: 'USD' },
          { title: 'Batch B', price: 200, currency: 'USD' },
        ],
      }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { results: unknown[]; errors: unknown[] };
    expect(body.results).toHaveLength(2);
    expect(body.errors).toHaveLength(0);
    (body.results as Array<{ hash?: string; matter_uri?: string; thing_url?: string; gist?: unknown }>).forEach((r) => {
      expect(typeof r.hash).toBe('string');
      expect(r.matter_uri).toMatch(/^matter:\/\//);
      expect(r.gist).toBeDefined();
    });
  });

  it('empty products array → 400', async () => {
    const res = await request('/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products: [] }),
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as ErrorResponse;
    expect(body.code).toBe('empty_batch');
  });

  it('batch over limit → 400', async () => {
    const products = Array.from({ length: 101 }, (_, i) => ({
      title: `Product ${i}`,
      price: 100 + i,
      currency: 'USD',
    }));
    const res = await request('/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products }),
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as ErrorResponse;
    expect(body.code).toBe('batch_too_large');
  });

  it('invalid item in batch → 207 with errors array', async () => {
    const res = await request('/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        products: [
          { title: 'Valid', price: 50, currency: 'USD' },
          { title: '', price: 100, currency: 'USD' },
          { title: 'Also valid', price: 75, currency: 'EUR' },
        ],
      }),
    });
    expect(res.status).toBe(207);
    const body = (await res.json()) as { results: unknown[]; errors: Array<{ index: number; code: string; message: string }> };
    expect(body.results).toHaveLength(2);
    expect(body.errors).toHaveLength(1);
    expect(body.errors[0].index).toBe(1);
    expect(body.errors[0].code).toBe('invalid_product');
  });

  it('invalid JSON → 400', async () => {
    const res = await request('/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as ErrorResponse;
    expect(body.code).toBe('invalid_json');
  });

  it('missing products key → 400', async () => {
    const res = await request('/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [] }),
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as ErrorResponse;
    expect(body.code).toBe('invalid_batch');
  });
});

// Sprint 4 — MVP-12: Catalog import (JSON + CSV)
describe('POST /catalog/import', () => {
  it('JSON with products array → 200 and results', async () => {
    const res = await request('/catalog/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        products: [
          { title: 'Catalog A', price: 111, currency: 'USD' },
          { title: 'Catalog B', price: 222, currency: 'EUR' },
        ],
      }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { results: unknown[]; errors: unknown[]; imported?: number };
    expect(body.results).toHaveLength(2);
    expect(body.imported).toBe(2);
  });

  it('CSV with header and rows → 200', async () => {
    const csv = `title,price,currency,image_url,checkout_url
Widget,99,USD,https://example.com/w.jpg,https://example.com/buy
Gadget,199,EUR,,`;
    const res = await request('/catalog/import', {
      method: 'POST',
      headers: { 'Content-Type': 'text/csv' },
      body: csv,
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { results: unknown[]; imported?: number };
    expect(body.results).toHaveLength(2);
    expect(body.imported).toBe(2);
  });

  it('CSV with invalid row → partial success 207', async () => {
    const csv = `title,price,currency
Good,10,USD
,20,USD
Fine,30,EUR`;
    const res = await request('/catalog/import', {
      method: 'POST',
      headers: { 'Content-Type': 'text/csv' },
      body: csv,
    });
    expect(res.status).toBe(207);
    const body = (await res.json()) as { results: unknown[]; errors: Array<{ message?: string }> };
    expect(body.results.length).toBeGreaterThanOrEqual(1);
    expect(body.errors.length).toBeGreaterThanOrEqual(1);
  });

  it('unsupported Content-Type → 400', async () => {
    const res = await request('/catalog/import', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: 'nothing',
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as ErrorResponse;
    expect(body.code).toBe('unsupported_media');
  });

  it('empty CSV (no data rows) → 400', async () => {
    const res = await request('/catalog/import', {
      method: 'POST',
      headers: { 'Content-Type': 'text/csv' },
      body: 'title,price,currency',
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { imported?: number; errors?: unknown[] };
    expect(body.imported).toBe(0);
    expect(Array.isArray(body.errors) && body.errors.length > 0).toBe(true);
  });
});
