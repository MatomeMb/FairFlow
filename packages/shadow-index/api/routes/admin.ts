import { Hono } from 'hono';
import path from 'node:path';
import crypto from 'node:crypto';
import { validateAdminAuth } from '../middleware/adminAuth.js';
import { err } from '../shared/errors.js';
import { logger } from '../../lib/logger.js';
import { invalidateCache } from '../../lib/query-cache.js';
import { RetentionPolicy } from '../../lib/retention-policy.js';
import { getEventsDir, dataRoot } from '../shared/server-paths.js';
import {
  loadMerchantAccounts,
  saveMerchantAccounts,
  sanitizeMerchantAccount,
} from '../repos/merchant-accounts.js';
import {
  loadPayoutLogs,
  releasePayoutLog,
  queueOrderForPayout,
  buildMoRStatus,
  loadOrders,
  releaseToMerchant,
  loadNotifications,
  saveNotifications,
} from '../services/commerce-store.js';
import { unlockPayoutsAfterKycApproval } from '../shared/unlock-payouts-after-kyc.js';
import { sendKycStatusEmail } from '../email.js';

export const adminRouter = new Hono();
// GET /v1/admin/payouts - List pending payouts for admin release
adminRouter.get('/payouts', async (c) => {
  if (!validateAdminAuth(c.req.header('authorization'))) {
    return c.json({ ok: false, error: 'Forbidden' }, 403);
  }

  const [payoutLogs, merchants] = await Promise.all([loadPayoutLogs(), loadMerchantAccounts()]);
  
  // Filter to pending payouts and enrich with merchant names
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
      return aTime - bTime; // Oldest first
    });

  const page = Math.max(1, parseInt(c.req.query('page') ?? '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(c.req.query('limit') ?? '20', 10)));
  const offset = (page - 1) * limit;
  const total = pending.length;
  const pageItems = pending.slice(offset, offset + limit);

  return c.json({
    ok: true,
    payouts: pageItems,
    count: total,
    pagination: {
      page,
      limit,
      total,
      pages: Math.max(1, Math.ceil(total / limit)),
    },
  });
});

adminRouter.post('/payouts/release', async (c) => {
  if (!validateAdminAuth(c.req.header('authorization'))) {
    return c.json({ ok: false, error: 'Forbidden' }, 403);
  }

  const body = await c.req.json().catch(() => null) as { payout_log_id?: string } | null;
  const payoutLogId = body?.payout_log_id;
  if (!payoutLogId) {
    return c.json({ ok: false, error: 'Missing payout_log_id' }, 400);
  }

  try {
    const released = await releasePayoutLog(payoutLogId, 'admin_manual');
    return c.json({ ok: true, payout_log: released });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const currentStatus = (error as { currentStatus?: string }).currentStatus;
    if (message.includes('not found')) {
      return c.json({ ok: false, error: 'Payout log not found' }, 404);
    }
    if (currentStatus) {
      return c.json({ ok: false, error: 'Payout already processed', current_status: currentStatus }, 400);
    }
    logger.error('Payout release failed', { payout_log_id: payoutLogId, error: message });
    return c.json({ ok: false, error: 'Release failed', detail: message }, 500);
  }
});

// POST /v1/admin/payouts/release-to-merchant - Release payout to a specific merchant's bank account
adminRouter.post('/payouts/release-to-merchant', async (c) => {
  if (!validateAdminAuth(c.req.header('authorization'))) {
    return c.json({ ok: false, error: 'Forbidden' }, 403);
  }

  const body = await c.req.json().catch(() => null) as { merchant_id?: string; amount_cents?: number } | null;
  if (!body?.merchant_id) {
    return c.json(err('invalid_request', 'Missing merchant_id'), 400);
  }

  try {
    const merchants = await loadMerchantAccounts();
    const merchant = merchants.find((m) => m.id === body.merchant_id);
    
    if (!merchant) {
      return c.json(err('not_found', `Merchant not found: ${body.merchant_id}`), 404);
    }

    if (!merchant.bank_account?.account_number) {
      return c.json(
        err('invalid_request', 'Merchant has no bank account configured'),
        400
      );
    }

    // Calculate pending payout or use provided amount
    const payoutAmount = body.amount_cents ?? (merchant.pending_payout ?? 0);
    
    if (payoutAmount <= 0) {
      return c.json(
        err('invalid_request', 'No pending payout amount to release'),
        400
      );
    }

    // Find pending payouts for this merchant
    const payoutLogs = await loadPayoutLogs();
    const pendingPayouts = payoutLogs.filter(
      (log) => log.merchant_id === body.merchant_id && log.status === 'pending'
    );

    if (pendingPayouts.length === 0) {
      return c.json(
        err('not_found', 'No pending payouts found for merchant'),
        404
      );
    }

    // Release all pending payouts for this merchant
    const released = [];
    for (const payout of pendingPayouts) {
      const updated = await releasePayoutLog(payout.id, 'admin_manual_batch');
      released.push(updated);
    }

    // Update merchant pending_payout balance
    merchant.pending_payout = Math.max(0, (merchant.pending_payout ?? 0) - payoutAmount);
    merchant.updated_at = new Date().toISOString();
    await saveMerchantAccounts(merchants);

    logger.info('Merchant payouts released', {
      merchant_id: body.merchant_id,
      amount: payoutAmount,
      count: released.length,
      bank_name: merchant.bank_account.bank_name,
    });

    return c.json({
      ok: true,
      message: `Released ${released.length} payout(s) to merchant's bank account`,
      merchant: {
        id: merchant.id,
        business_name: merchant.business_name,
        bank_account: {
          account_name: merchant.bank_account.account_holder_name,
          bank_name: merchant.bank_account.bank_name,
          account_number: merchant.bank_account.account_number.slice(-4).padStart(merchant.bank_account.account_number.length, '*'),
        },
      },
      payouts_released: released,
      total_amount: payoutAmount,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Merchant payout release failed', { merchant_id: body?.merchant_id, error: message });
    return c.json(err('release_failed', `Release failed: ${message}`), 500);
  }
});

adminRouter.get('/mor-status', async (c) => {
  if (!validateAdminAuth(c.req.header('authorization'))) {
    return c.json({ ok: false, error: 'Forbidden' }, 403);
  }

  try {
    const status = await buildMoRStatus();
    return c.json({ ok: true, ...status });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('MoR status check failed', { error: message });
    return c.json({ ok: false, error: 'Status check failed', detail: message }, 500);
  }
});

adminRouter.post('/payouts/backfill', async (c) => {
  if (!validateAdminAuth(c.req.header('authorization'))) {
    return c.json({ ok: false, error: 'Forbidden' }, 403);
  }

  try {
    const status = await buildMoRStatus();
    const results: Array<{ orderId: string; result: string; payoutLogId?: string }> = [];

    for (const orderId of status.gap_order_ids) {
      try {
        const payoutLog = await queueOrderForPayout(orderId);
        results.push({ orderId, result: 'queued', payoutLogId: payoutLog?.id });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        results.push({ orderId, result: `error: ${message}` });
      }
    }

    const queued = results.filter((item) => item.result === 'queued').length;
    const errors = results.filter((item) => item.result.startsWith('error:')).length;
    logger.info('Backfill complete', { queued, errors, total: status.gap_order_ids.length });
    return c.json({ ok: true, queued, errors, results });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return c.json({ ok: false, error: 'Backfill failed', detail: message }, 500);
  }
});
// ==================== ADMIN KYC MANAGEMENT ====================

// GET /v1/admin/kyc/pending - List all pending KYC submissions
adminRouter.get('/kyc/pending', async (c) => {
  if (!validateAdminAuth(c.req.header('authorization'))) {
    return c.json({ ok: false, error: 'Forbidden' }, 403);
  }

  const accounts = await loadMerchantAccounts();
  const pending = accounts
    .filter((account) => account.kyc_status === 'pending')
    .map((account) => ({
      id: account.id,
      business_name: account.business_name,
      email: account.email,
      kyc_status: account.kyc_status,
      submitted_at: account.updated_at,
      kyc_data: account.kyc_data,
      bank_account: account.bank_account ? {
        account_holder_name: account.bank_account.account_holder_name,
        bank_name: account.bank_account.bank_name,
        account_number: account.bank_account.account_number.slice(-4).padStart(account.bank_account.account_number.length, '*'),
        branch_code: account.bank_account.branch_code,
        account_type: account.bank_account.account_type,
      } : null,
    }))
    .sort((a, b) => {
      const aTime = typeof a.submitted_at === 'string' ? new Date(a.submitted_at).getTime() : 0;
      const bTime = typeof b.submitted_at === 'string' ? new Date(b.submitted_at).getTime() : 0;
      return aTime - bTime; // Oldest first
    });

  const page = Math.max(1, parseInt(c.req.query('page') ?? '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(c.req.query('limit') ?? '20', 10)));
  const offset = (page - 1) * limit;
  const total = pending.length;
  const pageItems = pending.slice(offset, offset + limit);

  return c.json({
    ok: true,
    pending: pageItems,
    count: total,
    pagination: {
      page,
      limit,
      total,
      pages: Math.max(1, Math.ceil(total / limit)),
    },
  });
});

// PATCH /v1/admin/kyc/approve/:merchantId - Approve KYC submission
adminRouter.patch('/kyc/approve/:merchantId', async (c) => {
  if (!validateAdminAuth(c.req.header('authorization'))) {
    return c.json({ ok: false, error: 'Forbidden' }, 403);
  }

  const merchantId = c.req.param('merchantId');
  const body = await c.req.json().catch(() => null) as { notes?: string } | null;
  const approvalNotes = (body?.notes || '').trim();

  if (!merchantId) {
    return c.json(err('invalid_request', 'Missing merchantId'), 400);
  }

  const accounts = await loadMerchantAccounts();
  const merchant = accounts.find((m) => m.id === merchantId);

  if (!merchant) {
    return c.json(err('not_found', `Merchant ${merchantId} not found`), 404);
  }

  if (merchant.kyc_status === 'approved') {
    return c.json(err('invalid_request', 'KYC already approved'), 400);
  }

  if (merchant.kyc_status !== 'pending') {
    return c.json(err('invalid_request', `KYC status is ${merchant.kyc_status}, expected pending`), 400);
  }

  // Approve merchant
  merchant.kyc_status = 'approved';
  merchant.updated_at = new Date().toISOString();
  const nextPayoutIso = unlockPayoutsAfterKycApproval(merchant);

  // Store approval metadata
  if (!merchant.kyc_data) {
    merchant.kyc_data = { id_number: '', date_of_birth: '', address: '', phone: '' };
  }

  await saveMerchantAccounts(accounts);

  logger.info('Merchant KYC approved', {
    merchant_id: merchantId,
    business_name: merchant.business_name,
    approval_notes: approvalNotes,
  });

  sendKycStatusEmail({
    merchantEmail: merchant.email,
    merchantBusinessName: merchant.business_name,
    approved: true,
    notes: approvalNotes || undefined,
    nextPayoutDate: nextPayoutIso,
    payoutsActivated: true,
  }).catch((error) => console.error('[KYC] Status email error:', error));

  return c.json({
    ok: true,
    message: 'KYC approved successfully',
    merchant: sanitizeMerchantAccount(merchant),
  });
});

// PATCH /v1/admin/kyc/reject/:merchantId - Reject KYC submission
adminRouter.patch('/kyc/reject/:merchantId', async (c) => {
  if (!validateAdminAuth(c.req.header('authorization'))) {
    return c.json({ ok: false, error: 'Forbidden' }, 403);
  }

  const merchantId = c.req.param('merchantId');
  const body = await c.req.json().catch(() => null) as { reason?: string } | null;
  const rejectionReason = (body?.reason || '').trim();

  if (!merchantId) {
    return c.json(err('invalid_request', 'Missing merchantId'), 400);
  }

  if (!rejectionReason) {
    return c.json(err('invalid_request', 'Rejection reason is required'), 400);
  }

  const accounts = await loadMerchantAccounts();
  const merchant = accounts.find((m) => m.id === merchantId);

  if (!merchant) {
    return c.json(err('not_found', `Merchant ${merchantId} not found`), 404);
  }

  if (merchant.kyc_status === 'rejected') {
    return c.json(err('invalid_request', 'KYC already rejected'), 400);
  }

  if (merchant.kyc_status !== 'pending') {
    return c.json(err('invalid_request', `KYC status is ${merchant.kyc_status}, expected pending`), 400);
  }

  // Reject merchant
  merchant.kyc_status = 'rejected';
  merchant.updated_at = new Date().toISOString();

  await saveMerchantAccounts(accounts);

  // Notify merchant of rejection
  const notification = {
    id: crypto.randomUUID(),
    merchant_id: merchant.id,
    type: 'kyc' as const,
    title: 'KYC Verification Rejected',
    message: `Your KYC verification was rejected. Reason: ${rejectionReason}. Please resubmit with corrected information.`,
    read: false,
    created_at: new Date().toISOString(),
  };
  const notifications = await loadNotifications();
  notifications.push(notification);
  await saveNotifications(notifications);

  logger.info('Merchant KYC rejected', {
    merchant_id: merchantId,
    business_name: merchant.business_name,
    rejection_reason: rejectionReason,
  });

  sendKycStatusEmail({
    merchantEmail: merchant.email,
    merchantBusinessName: merchant.business_name,
    approved: false,
    notes: rejectionReason || undefined,
  }).catch((error) => console.error('[KYC] Status email error:', error));

  return c.json({
    ok: true,
    message: 'KYC rejected. Merchant has been notified.',
    merchant: sanitizeMerchantAccount(merchant),
  });
});

// Sprint 4 Week 2: Retention policy — manual trigger (POST /v1/admin/retention/run)
adminRouter.post('/retention/run', async (c) => {
  if (!validateAdminAuth(c.req.header('authorization'))) {
    return c.json({ ok: false, error: 'Forbidden' }, 403);
  }

  const eventsDir = getEventsDir();
  const archiveDir = path.join(dataRoot, 'archive');
  const retentionDays = parseInt(process.env.RETENTION_DAYS ?? '90', 10) || 90;

  const policy = new RetentionPolicy({
    eventsDir,
    archiveDir,
    retentionDays,
  });

  try {
    const result = await policy.execute();
    const accept = c.req.header('Accept') ?? '';
    const isForm = c.req.header('Content-Type')?.includes('application/x-www-form-urlencoded');

    if (accept.includes('text/html') || isForm) {
      return c.redirect(`/v1/analytics/dashboard?retention_processed=${result.processed}&retention_archived=${result.archived}`);
    }
    return c.json({
      ok: true,
      processed: result.processed,
      archived: result.archived,
      errors: result.errors,
    }, 200);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return c.json(err('retention_failed', message), 500);
  }
});

// POST /v1/admin/cron/release-escrow - Run 10-day auto-release (call daily via cron)
adminRouter.post('/cron/release-escrow', async (c) => {
  if (!validateAdminAuth(c.req.header('authorization'))) {
    return c.json({ ok: false, error: 'Forbidden' }, 403);
  }

  const now = Date.now();
  const tenDaysAgo = new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

  const orders = await loadOrders();
  let released = 0;
  let reminders = 0;

  for (const order of orders) {
    const heldAt = order.held_at;
    if (!heldAt) continue;
    if (order.payment_status !== 'held') continue;
    if (order.fulfillment_status !== 'shipped' && order.fulfillment_status !== 'fulfilled') continue;

    if (heldAt < tenDaysAgo) {
      try {
        await releaseToMerchant(order);
        released++;
      } catch (e) {
        logger.error('Auto-release failed', { orderId: order.id, error: String(e) });
      }
    } else if (heldAt < sevenDaysAgo && !order.customer_confirmed_at) {
      // Day 7 reminder - TODO: send email with confirm link
      reminders++;
      logger.info('Day 7 reminder due', { orderId: order.id, customer: order.customer?.email });
    }
  }

  return c.json({ ok: true, released, reminders }, 200);
});

// Sprint 4 Week 3: Cache invalidation (POST /v1/admin/cache/clear)
adminRouter.post('/cache/clear', (c) => {
  if (!validateAdminAuth(c.req.header('authorization'))) {
    return c.json({ ok: false, error: 'Forbidden' }, 403);
  }

  invalidateCache();
  const accept = c.req.header('Accept') ?? '';
  const isForm = c.req.header('Content-Type')?.includes('application/x-www-form-urlencoded');
  if (accept.includes('text/html') || isForm) {
    return c.redirect('/v1/analytics/dashboard?cache_cleared=1');
  }
  return c.json({ ok: true, message: 'Cache cleared' }, 200);
});