import { describe, it, expect, vi } from 'vitest';

const loadOrdersFn = vi.hoisted(() => vi.fn());
const saveOrdersFn = vi.hoisted(() => vi.fn());
const readProductsFn = vi.hoisted(() => vi.fn());
const writeProductsFn = vi.hoisted(() => vi.fn());
const loadNotificationsFn = vi.hoisted(() => vi.fn());
const saveNotificationsFn = vi.hoisted(() => vi.fn());
const dbUpdateMaybeSingleFn = vi.hoisted(() => vi.fn());
const dbInventoryInsertFn = vi.hoisted(() => vi.fn());
const loadMerchantAccountsFn = vi.hoisted(() => vi.fn());

vi.mock('../api/services/commerce-store.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/services/commerce-store.js')>();
  return {
    ...actual,
    loadOrders: (...args: unknown[]) => loadOrdersFn(...args),
    saveOrders: (...args: unknown[]) => saveOrdersFn(...args),
    loadNotifications: (...args: unknown[]) => loadNotificationsFn(...args),
    saveNotifications: (...args: unknown[]) => saveNotificationsFn(...args),
  };
});

vi.mock('../api/merchant-products.js', () => ({
  readProducts: (...args: unknown[]) => readProductsFn(...args),
  writeProducts: (...args: unknown[]) => writeProductsFn(...args),
}));

vi.mock('../api/email.js', () => ({
  sendMerchantOrderNotification: vi.fn().mockResolvedValue(undefined),
  sendCustomerOrderConfirmation: vi.fn().mockResolvedValue(undefined),
  sendLowStockWarning: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../api/repos/merchant-accounts.js', () => ({
  loadMerchantAccounts: (...args: unknown[]) => loadMerchantAccountsFn(...args),
}));

vi.mock('../api/db.js', () => ({
  db: {
    from: (table: string) => {
      if (table === 'merchant_products') {
        return {
          update: () => ({
            eq: () => ({
              eq: () => ({
                eq: () => ({
                  select: () => ({
                    maybeSingle: (...args: unknown[]) => dbUpdateMaybeSingleFn(...args),
                  }),
                }),
              }),
            }),
          }),
        };
      }
      if (table === 'inventory_logs') {
        return {
          insert: (...args: unknown[]) => dbInventoryInsertFn(...args),
        };
      }
      return {
        update: () => ({ eq: () => ({ eq: () => ({ eq: () => ({ select: () => ({ maybeSingle: () => Promise.resolve({ data: null, error: null }) }) }) }) }) }),
        insert: () => Promise.resolve({ data: null, error: null }),
      };
    },
  },
}));

import { ensureOrderFromPaystackChargePayload } from '../api/services/paystack-order-flow.js';

describe('ensureOrderFromPaystackChargePayload', () => {
  const product = {
    id: 'p1',
    merchant_id: 'm1',
    title: 'Demo Product',
    stock_count: 5,
    thing_file: { hash: 'hash-1' },
  };

  const chargePayload = {
    reference: 'ref-1',
    metadata: {
      product_id: 'p1',
      product_hash: 'hash-1',
      merchant_id: 'm1',
      merchant_price_cents: '1000',
      consumer_price_cents: '1200',
      platform_revenue_cents: '200',
      delivery_address: '{}',
    },
    customer: { email: 'buyer@example.com' },
    currency: 'ZAR',
  };

  beforeEach(() => {
    loadOrdersFn.mockReset();
    saveOrdersFn.mockReset();
    readProductsFn.mockReset();
    writeProductsFn.mockReset();
    loadNotificationsFn.mockReset();
    saveNotificationsFn.mockReset();
    dbUpdateMaybeSingleFn.mockReset();
    dbInventoryInsertFn.mockReset();
    loadMerchantAccountsFn.mockReset();

    loadOrdersFn.mockResolvedValue([]);
    loadNotificationsFn.mockResolvedValue([]);
    readProductsFn.mockResolvedValue([]);
    writeProductsFn.mockResolvedValue(undefined);
    dbUpdateMaybeSingleFn.mockResolvedValue({ data: null, error: null });
    dbInventoryInsertFn.mockResolvedValue({ data: null, error: null });
    saveOrdersFn.mockResolvedValue(undefined);
    saveNotificationsFn.mockResolvedValue(undefined);
    loadMerchantAccountsFn.mockResolvedValue([]);
  });

  it('returns the existing order when paystack reference was already processed (idempotent)', async () => {
    const existing = {
      id: 'existing-order',
      paystack_reference: 'same-ref',
      session_id: 'same-ref',
      status: 'paid' as const,
      payment_status: 'held' as const,
      fulfillment_status: 'pending' as const,
      customer: { email: 'a@b.com' },
    };
    loadOrdersFn.mockResolvedValue([existing]);
    const result = await ensureOrderFromPaystackChargePayload({
      reference: 'same-ref',
      metadata: { product_id: 'p1' },
      customer: { email: 'a@b.com' },
    });
    expect(result?.id).toBe('existing-order');
    expect(saveOrdersFn).not.toHaveBeenCalled();
  });

  it('decrements stock and writes inventory log when product stock is available', async () => {
    readProductsFn.mockResolvedValue([{ ...product }]);
    dbUpdateMaybeSingleFn.mockResolvedValue({ data: { stock_count: 4 }, error: null });

    const result = await ensureOrderFromPaystackChargePayload({ ...chargePayload });

    expect(result).not.toBeNull();
    expect(dbUpdateMaybeSingleFn).toHaveBeenCalledTimes(1);
    expect(dbInventoryInsertFn).toHaveBeenCalledTimes(1);
    expect(writeProductsFn).toHaveBeenCalledTimes(1);
  });

  it('does not decrement stock when product stock is zero', async () => {
    readProductsFn.mockResolvedValue([{ ...product, stock_count: 0 }]);

    const result = await ensureOrderFromPaystackChargePayload({ ...chargePayload, reference: 'ref-zero' });

    expect(result).not.toBeNull();
    expect(dbUpdateMaybeSingleFn).not.toHaveBeenCalled();
    expect(dbInventoryInsertFn).not.toHaveBeenCalled();
    expect(writeProductsFn).not.toHaveBeenCalled();
  });

  it('processes concurrent duplicate deliveries for one reference exactly once', async () => {
    let currentStock = 5;
    const sharedOrders: Array<{ id: string; paystack_reference?: string; session_id?: string }> = [];

    readProductsFn.mockResolvedValue([{ ...product, stock_count: currentStock }]);
    loadOrdersFn.mockImplementation(async () => sharedOrders as unknown[]);
    saveOrdersFn.mockImplementation(async (orders: unknown[]) => {
      sharedOrders.splice(0, sharedOrders.length, ...(orders as typeof sharedOrders));
    });
    dbUpdateMaybeSingleFn.mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
      currentStock -= 1;
      return { data: { stock_count: currentStock }, error: null };
    });

    const payload = { ...chargePayload, reference: 'ref-concurrent' };
    const [first, second] = await Promise.all([
      ensureOrderFromPaystackChargePayload(payload),
      ensureOrderFromPaystackChargePayload(payload),
    ]);

    expect(first).not.toBeNull();
    expect(second).not.toBeNull();
    expect(sharedOrders).toHaveLength(1);
    expect(sharedOrders[0]?.paystack_reference).toBe('ref-concurrent');
    expect(dbUpdateMaybeSingleFn).toHaveBeenCalledTimes(1);
    expect(dbInventoryInsertFn).toHaveBeenCalledTimes(1);
  });
});
