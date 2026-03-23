import { describe, it, expect, vi } from 'vitest';

const loadOrdersFn = vi.hoisted(() => vi.fn());
const saveOrdersFn = vi.hoisted(() => vi.fn());

vi.mock('../api/services/commerce-store.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/services/commerce-store.js')>();
  return {
    ...actual,
    loadOrders: (...args: unknown[]) => loadOrdersFn(...args),
    saveOrders: (...args: unknown[]) => saveOrdersFn(...args),
  };
});

vi.mock('../api/merchant-products.js', () => ({
  readProducts: vi.fn().mockResolvedValue([]),
  writeProducts: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../api/email.js', () => ({
  sendMerchantOrderNotification: vi.fn().mockResolvedValue(undefined),
  sendCustomerOrderConfirmation: vi.fn().mockResolvedValue(undefined),
  sendLowStockWarning: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../api/repos/merchant-accounts.js', () => ({
  loadMerchantAccounts: vi.fn().mockResolvedValue([]),
}));

import { ensureOrderFromPaystackChargePayload } from '../api/services/paystack-order-flow.js';

describe('ensureOrderFromPaystackChargePayload', () => {
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
});
