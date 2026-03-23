import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
  merchants: [] as Array<Record<string, unknown>>,
  notifications: [] as Array<Record<string, unknown>>,
  payoutLogs: [] as Array<Record<string, unknown>>,
}));

vi.mock('../api/repos/merchant-accounts.js', () => ({
  loadMerchantAccounts: vi.fn(async () => state.merchants),
  saveMerchantAccounts: vi.fn(async (next: Array<Record<string, unknown>>) => {
    state.merchants = next;
  }),
  sanitizeMerchantAccount: (merchant: Record<string, unknown>) => merchant,
}));

vi.mock('../api/services/commerce-store.js', () => ({
  loadNotifications: vi.fn(async () => state.notifications),
  saveNotifications: vi.fn(async (next: Array<Record<string, unknown>>) => {
    state.notifications = next;
  }),
  loadPayoutLogs: vi.fn(async () => state.payoutLogs),
  releasePayoutLog: vi.fn(),
}));

vi.mock('../api/email.js', () => ({
  sendKycStatusEmail: vi.fn().mockResolvedValue(undefined),
}));

import { approveKycMerchant } from '../api/services/admin-kyc-service.js';
import { listPendingAdminPayouts } from '../api/services/admin-payout-service.js';

describe('KYC approval to payout eligibility round-trip', () => {
  beforeEach(() => {
    state.notifications = [];
    state.merchants = [
      {
        id: 'merchant-1',
        business_name: 'Roundtrip Merchant',
        email: 'merchant@example.com',
        kyc_status: 'pending',
        payout_frequency: 'weekly',
        payout_eligible: false,
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-01T00:00:00.000Z',
      },
    ];
    state.payoutLogs = [
      {
        id: 'payout-1',
        merchant_id: 'merchant-1',
        status: 'pending',
        net_amount: 10000,
        gross_amount: 10300,
        commission_amount: 300,
        currency: 'ZAR',
        orders_included: ['order-1'],
        created_at: '2026-03-02T00:00:00.000Z',
      },
    ];
  });

  it('approves KYC, unlocks payouts, and surfaces pending payout for admin review', async () => {
    const approval = await approveKycMerchant('merchant-1', 'docs look good');
    expect(approval.ok).toBe(true);
    expect(approval.merchant.kyc_status).toBe('approved');
    expect(approval.merchant.payout_eligible).toBe(true);
    expect(typeof approval.merchant.next_payout_date).toBe('string');
    expect(typeof approval.merchant.kyc_verified_at).toBe('string');

    const pending = await listPendingAdminPayouts(1, 20);
    expect(pending.ok).toBe(true);
    expect(pending.count).toBe(1);
    expect(pending.payouts[0]).toMatchObject({
      merchant_id: 'merchant-1',
      merchant_name: 'Roundtrip Merchant',
      status: 'pending',
    });
  });
});
