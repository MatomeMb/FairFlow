/**
 * Shadow Index API — MVP path tests (compile + resolve + health).
 * Prerequisites: run 'npm run start' in packages/shadow-index before running tests.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const BASE = 'http://localhost:3000';

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
    const res = await fetch(`${BASE}/compile`, {
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
    const res = await fetch(`${BASE}/compile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as ErrorResponse;
    expect(body.code).toBe('invalid_json');
  });

  it('missing required field → 400', async () => {
    const res = await fetch(`${BASE}/compile`, {
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
    const res = await fetch(`${BASE}/compile`, {
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
    const res1 = await fetch(`${BASE}/compile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validProduct),
    });
    const res2 = await fetch(`${BASE}/compile`, {
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
    const compileRes = await fetch(`${BASE}/compile`, {
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
    const res = await fetch(`${BASE}/resolve/${hash}`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as ResolveResponse;
    expect(body.hash).toBe(hash);
    expect(body.gist?.title).toBeDefined();
    expect(body.gist?.price).toBeDefined();
    expect(body.matter_uri).toMatch(/^matter:\/\//);
    expect(body.checkout_url !== undefined || body.thing_url).toBeDefined();
  });

  it('unknown hash → 404', async () => {
    const res = await fetch(
      `${BASE}/resolve/0000000000000000000000000000000000000000000000000000000000000000`
    );
    expect(res.status).toBe(404);
  });
});

describe('GET /health', () => {
  it('returns 200', async () => {
    const res = await fetch(`${BASE}/health`);
    expect(res.status).toBe(200);
  });
});

// MVP-09: Auth (optional API key). Uses app.request() so no server required; env set before import.
describe('MVP-09: Auth when SHADOW_INDEX_API_KEY is set', () => {
  let app: { request: (req: Request) => Response | Promise<Response> };

  beforeAll(async () => {
    (globalThis as unknown as { __saved_api_key?: string }).__saved_api_key =
      process.env.SHADOW_INDEX_API_KEY;
    process.env.SHADOW_INDEX_API_KEY = 'testkey';
    const mod = await import('./index');
    app = mod.default;
  });

  afterAll(() => {
    const saved = (globalThis as unknown as { __saved_api_key?: string }).__saved_api_key;
    if (saved !== undefined) process.env.SHADOW_INDEX_API_KEY = saved;
    else delete process.env.SHADOW_INDEX_API_KEY;
  });

  it('returns 401 when API key is missing', async () => {
    const res = await app.request(
      new Request('http://localhost/health', {
        headers: { 'x-forwarded-for': 'test-auth-1' },
      })
    );
    expect(res.status).toBe(401);
    const body = (await res.json()) as ErrorResponse;
    expect(body.code).toBe('unauthorized');
  });

  it('returns 401 when API key is wrong', async () => {
    const res = await app.request(
      new Request('http://localhost/health', {
        headers: { 'x-api-key': 'wrong', 'x-forwarded-for': 'test-auth-2' },
      })
    );
    expect(res.status).toBe(401);
    const body = (await res.json()) as ErrorResponse;
    expect(body.code).toBe('unauthorized');
  });

  it('returns 200 when x-api-key is valid', async () => {
    const res = await app.request(
      new Request('http://localhost/health', {
        headers: { 'x-api-key': 'testkey', 'x-forwarded-for': 'test-auth-3' },
      })
    );
    expect(res.status).toBe(200);
  });

  it('returns 200 when Authorization Bearer is valid', async () => {
    const res = await app.request(
      new Request('http://localhost/health', {
        headers: { Authorization: 'Bearer testkey', 'x-forwarded-for': 'test-auth-4' },
      })
    );
    expect(res.status).toBe(200);
  });
});
