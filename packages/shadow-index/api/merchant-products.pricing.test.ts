import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getMerchantPriceCents, getConsumerPriceCents, type MerchantProduct } from './merchant-products.js';

const baseProduct = (): MerchantProduct => ({
  id: 'p1',
  merchant_id: 'm1',
  title: 'Test',
  price_cents: 15000,
  stock_count: 1,
  status: 'published',
  currency: 'ZAR',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

describe('getConsumerPriceCents / getMerchantPriceCents', () => {
  let prevRate: string | undefined;

  beforeEach(() => {
    prevRate = process.env.PLATFORM_COMMISSION_RATE;
    delete process.env.PLATFORM_COMMISSION_RATE;
  });

  afterEach(() => {
    if (prevRate === undefined) delete process.env.PLATFORM_COMMISSION_RATE;
    else process.env.PLATFORM_COMMISSION_RATE = prevRate;
  });

  it('consumer pays full list price in cents', () => {
    expect(getConsumerPriceCents(baseProduct())).toBe(15000);
  });

  it('default platform commission is 3% of gross; net is remainder', () => {
    const gross = 15000;
    const commission = Math.round(gross * 0.03);
    const net = gross - commission;
    expect(commission).toBe(450);
    expect(net).toBe(14550);
    expect(getMerchantPriceCents(baseProduct())).toBe(net);
  });

  it('respects PLATFORM_COMMISSION_RATE when set', () => {
    process.env.PLATFORM_COMMISSION_RATE = '0.05';
    expect(getMerchantPriceCents(baseProduct())).toBe(Math.round(15000 * 0.95));
  });
});
