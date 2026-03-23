import { logger } from '../../lib/logger.js';
import { loadPayoutLogs, releasePayoutLog } from './commerce-store.js';
import { loadMerchantAccounts } from '../repos/merchant-accounts.js';
import { AdminHttpError } from './admin-http-error.js';

export async function listPendingAdminPayouts(page: number, limit: number) {
  const [payoutLogs, merchants] = await Promise.all([loadPayoutLogs(), loadMerchantAccounts()]);

  const pending = payoutLogs
    .filter((log) => log.status === 'pending')
    .map((log) => {
      const merchant = merchants.find((m) => m.id === log.merchant_id);
      return {
        id: log.id,
        payout_log_id: log.id,
        merchant_id: log.merchant_id,
        merchant_name: merchant?.business_name || 'Unknown Merchant',
        net_amount: log.net_amount ?? 0,
        gross_amount: log.gross_amount ?? 0,
        commission_amount: log.commission_amount ?? 0,
        currency: log.currency ?? 'ZAR',
        status: log.status,
        created_at: log.created_at,
        orders_count: Array.isArray(log.orders_included) ? log.orders_included.length : 0,
      };
    })
    .sort((a, b) => {
      const aTime = typeof a.created_at === 'string' ? new Date(a.created_at).getTime() : 0;
      const bTime = typeof b.created_at === 'string' ? new Date(b.created_at).getTime() : 0;
      return aTime - bTime;
    });

  const safePage = Math.max(1, page);
  const safeLimit = Math.min(100, Math.max(1, limit));
  const offset = (safePage - 1) * safeLimit;
  const total = pending.length;
  const pageItems = pending.slice(offset, offset + safeLimit);

  return {
    ok: true,
    payouts: pageItems,
    count: total,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      pages: Math.max(1, Math.ceil(total / safeLimit)),
    },
  };
}

export async function releaseAdminPayoutByLogId(payoutLogId: string) {
  if (!payoutLogId) {
    throw new AdminHttpError(400, { ok: false, error: 'Missing payout_log_id' });
  }

  try {
    const released = await releasePayoutLog(payoutLogId, 'admin_manual');
    return { ok: true, payout_log: released };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const currentStatus = (error as { currentStatus?: string }).currentStatus;
    if (message.includes('not found')) {
      throw new AdminHttpError(404, { ok: false, error: 'Payout log not found' });
    }
    if (currentStatus) {
      throw new AdminHttpError(400, {
        ok: false,
        error: 'Payout already processed',
        current_status: currentStatus,
      });
    }
    logger.error('Payout release failed', { payout_log_id: payoutLogId, error: message });
    throw new AdminHttpError(500, { ok: false, error: 'Release failed', detail: message });
  }
}
