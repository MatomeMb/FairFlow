import { describe, it, expect } from 'vitest';
import app from '../api/index.js';

const PRODUCT = {
  title: 'Test Product',
  price: 2999,
  currency: 'ZAR',
  description: 'A test product for unit testing',
};

describe('compile and resolve pipeline', () => {
  let compiledHash: string;

  it('POST /compile returns hash and matter_uri', async () => {
    const res = await app.request('/compile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(PRODUCT),
    });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.hash).toMatch(/^[a-f0-9]{64}$/);
    expect(body.matter_uri).toMatch(/^matter:\/\//);
    expect(body.gist).toMatchObject({
      title: PRODUCT.title,
      price: PRODUCT.price,
      currency: PRODUCT.currency,
    });
    compiledHash = body.hash;
  });

  it('GET /resolve/:hash returns the stored thing', async () => {
    const res = await app.request(`/resolve/${compiledHash}`);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.hash).toBe(compiledHash);
    expect(body.gist.title).toBe(PRODUCT.title);
  });

  it('GET /gist/:hash returns the gist', async () => {
    const res = await app.request(`/gist/${compiledHash}`);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.gist.price).toBe(PRODUCT.price);
  });

  it('GET /resolve/:hash returns 404 for unknown hash', async () => {
    const fakeHash = 'f'.repeat(64);
    const res = await app.request(`/resolve/${fakeHash}`);
    expect(res.status).toBe(404);
  });

  it('POST /compile rejects invalid product', async () => {
    const res = await app.request('/compile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '' }),
    });
    expect(res.status).toBe(400);
  });
});
