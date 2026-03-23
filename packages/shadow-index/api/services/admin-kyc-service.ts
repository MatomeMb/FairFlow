import crypto from 'node:crypto';
import { err } from '../shared/errors.js';
import { emitMetric, apiLogger } from '../shared/logger.js';
import {
  loadMerchantAccounts,
  saveMerchantAccounts,
  sanitizeMerchantAccount,
} from '../repos/merchant-accounts.js';
import { loadNotifications, saveNotifications } from './commerce-store.js';
import { unlockPayoutsAfterKycApproval } from '../shared/unlock-payouts-after-kyc.js';
import { sendKycStatusEmail } from '../email.js';
import { AdminHttpError } from './admin-http-error.js';

export async function getPendingKycSubmissions(page: number, limit: number) {
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
      bank_account: account.bank_account
        ? {
            account_holder_name: account.bank_account.account_holder_name,
            bank_name: account.bank_account.bank_name,
            account_number: account.bank_account.account_number
              .slice(-4)
              .padStart(account.bank_account.account_number.length, '*'),
            branch_code: account.bank_account.branch_code,
            account_type: account.bank_account.account_type,
          }
        : null,
    }))
    .sort((a, b) => {
      const aTime = typeof a.submitted_at === 'string' ? new Date(a.submitted_at).getTime() : 0;
      const bTime = typeof b.submitted_at === 'string' ? new Date(b.submitted_at).getTime() : 0;
      return aTime - bTime;
    });

  const safePage = Math.max(1, page);
  const safeLimit = Math.min(100, Math.max(1, limit));
  const offset = (safePage - 1) * safeLimit;
  const total = pending.length;
  const pageItems = pending.slice(offset, offset + safeLimit);

  return {
    ok: true,
    pending: pageItems,
    count: total,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      pages: Math.max(1, Math.ceil(total / safeLimit)),
    },
  };
}

export async function approveKycMerchant(merchantId: string, approvalNotes: string) {
  const startedAt = performance.now();
  if (!merchantId) {
    throw new AdminHttpError(400, err('invalid_request', 'Missing merchantId'));
  }

  const accounts = await loadMerchantAccounts();
  const merchant = accounts.find((m) => m.id === merchantId);

  if (!merchant) {
    throw new AdminHttpError(404, err('not_found', `Merchant ${merchantId} not found`));
  }

  if (merchant.kyc_status === 'approved') {
    throw new AdminHttpError(400, err('invalid_request', 'KYC already approved'));
  }

  if (merchant.kyc_status !== 'pending') {
    throw new AdminHttpError(
      400,
      err('invalid_request', `KYC status is ${merchant.kyc_status}, expected pending`),
    );
  }

  merchant.kyc_status = 'approved';
  merchant.updated_at = new Date().toISOString();
  const nextPayoutIso = unlockPayoutsAfterKycApproval(merchant);

  if (!merchant.kyc_data) {
    merchant.kyc_data = { id_number: '', date_of_birth: '', address: '', phone: '' };
  }

  await saveMerchantAccounts(accounts);

  apiLogger.info({
    msg: 'merchant_kyc_approved',
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
  }).catch((error) => apiLogger.error({ error: String(error) }, 'kyc_status_email_failed'));

  const latencyMs = Math.round((performance.now() - startedAt) * 100) / 100;
  emitMetric(apiLogger, 'kyc.approval.duration_ms', latencyMs, { merchantId });
  // FINAL-POLISH: codify operational alert thresholds with greppable markers.
  // ALERT_THRESHOLD: kyc_approval_duration_ms > 1000
  if (latencyMs > 1000) {
    apiLogger.warn({ merchantId, latencyMs }, 'kyc_approval_latency_high');
  }

  return {
    ok: true,
    message: 'KYC approved successfully',
    merchant: sanitizeMerchantAccount(merchant),
  };
}

export async function rejectKycMerchant(merchantId: string, rejectionReason: string) {
  const startedAt = performance.now();
  if (!merchantId) {
    throw new AdminHttpError(400, err('invalid_request', 'Missing merchantId'));
  }

  if (!rejectionReason) {
    throw new AdminHttpError(400, err('invalid_request', 'Rejection reason is required'));
  }

  const accounts = await loadMerchantAccounts();
  const merchant = accounts.find((m) => m.id === merchantId);

  if (!merchant) {
    throw new AdminHttpError(404, err('not_found', `Merchant ${merchantId} not found`));
  }

  if (merchant.kyc_status === 'rejected') {
    throw new AdminHttpError(400, err('invalid_request', 'KYC already rejected'));
  }

  if (merchant.kyc_status !== 'pending') {
    throw new AdminHttpError(
      400,
      err('invalid_request', `KYC status is ${merchant.kyc_status}, expected pending`),
    );
  }

  merchant.kyc_status = 'rejected';
  merchant.updated_at = new Date().toISOString();

  await saveMerchantAccounts(accounts);

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

  apiLogger.info({
    msg: 'merchant_kyc_rejected',
    merchant_id: merchantId,
    business_name: merchant.business_name,
    rejection_reason: rejectionReason,
  });

  sendKycStatusEmail({
    merchantEmail: merchant.email,
    merchantBusinessName: merchant.business_name,
    approved: false,
    notes: rejectionReason || undefined,
  }).catch((error) => apiLogger.error({ error: String(error) }, 'kyc_status_email_failed'));

  const latencyMs = Math.round((performance.now() - startedAt) * 100) / 100;
  emitMetric(apiLogger, 'kyc.rejection.duration_ms', latencyMs, { merchantId });

  return {
    ok: true,
    message: 'KYC rejected. Merchant has been notified.',
    merchant: sanitizeMerchantAccount(merchant),
  };
}
