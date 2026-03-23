import { describe, it, expect, vi, beforeEach } from 'vitest';

const mp = vi.hoisted(() => ({
  findMerchantProductByThingHash: vi.fn(),
  findMerchantProductByThingHashAnyStatus: vi.fn(),
  readProducts: vi.fn(),
}));

const paystackInit = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    status: true,
    data: {
      authorization_url: 'https://checkout.paystack.test/pay',
      reference: 'ref-checkout-1',
    },
  }),
);

vi.mock('../api/merchant-products.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/merchant-products.js')>();
  return {
    ...actual,
    findMerchantProductByThingHash: mp.findMerchantProductByThingHash,
    findMerchantProductByThingHashAnyStatus: mp.findMerchantProductByThingHashAnyStatus,
    readProducts: mp.readProducts,
    getConsumerPriceCents: (p: { price_cents: number }) => p.price_cents,
    getMerchantPriceCents: (p: { price_cents: number }) => Math.max(0, p.price_cents - 100),
  };
});

vi.mock('../api/services/paystack-client.js', () => ({
  getPaystack: vi.fn().mockResolvedValue({
    transaction: {
      initialize: paystackInit,
    },
  }),
}));

import app from '../api/index.js';

const baseProduct = {
  id: 'prod-1',
  merchant_id: 'm1',
  title: 'Test product',
  status: 'published' as const,
  stock_count: 5,
  price_cents: 2500,
  currency: 'ZAR',
  thing_file: { hash: 'hash-abc', matter_uri: 'matter://x', thing_url: 'http://localhost:3000/thing/x' },
};

describe('POST /checkout/create-session', () => {
  beforeEach(() => {
    mp.findMerchantProductByThingHash.mockReset();
    mp.findMerchantProductByThingHashAnyStatus.mockReset();
    mp.readProducts.mockReset();
    paystackInit.mockClear();
    mp.readProducts.mockResolvedValue([]);
  });

  it('returns 409 when product is archived', async () => {
    mp.findMerchantProductByThingHashAnyStatus.mockResolvedValue({
      ...baseProduct,
      status: 'archived',
    });
    const res = await app.request('/checkout/create-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_hash: 'hash-abc',
        customer_email: 'c@example.com',
      }),
    });
    expect(res.status).toBe(409);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe('product_archived');
  });

  it('returns 409 when product stock_count is 0', async () => {
    mp.findMerchantProductByThingHashAnyStatus.mockResolvedValue({ ...baseProduct, status: 'published' });
    mp.findMerchantProductByThingHash.mockResolvedValue({ ...baseProduct, stock_count: 0 });
    const res = await app.request('/checkout/create-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_hash: 'hash-abc',
        customer_email: 'c@example.com',
      }),
    });
    expect(res.status).toBe(409);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe('out_of_stock');
  });

  it('returns 200 with Paystack authorization URL when stock is available', async () => {
    mp.findMerchantProductByThingHashAnyStatus.mockResolvedValue({ ...baseProduct, status: 'published' });
    mp.findMerchantProductByThingHash.mockResolvedValue({ ...baseProduct, stock_count: 3 });
    const res = await app.request('/checkout/create-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_hash: 'hash-abc',
        customer_email: 'c@example.com',
      }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok?: boolean; url?: string; authorization_url?: string };
    expect(body.ok).toBe(true);
    expect(body.url).toContain('paystack');
    expect(paystackInit).toHaveBeenCalled();
  });
});
