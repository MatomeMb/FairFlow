import crypto from 'node:crypto';
import { err } from '../shared/errors.js';
import { logger } from '../../lib/logger.js';
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

  return {
    ok: true,
    message: 'KYC approved successfully',
    merchant: sanitizeMerchantAccount(merchant),
  };
}

export async function rejectKycMerchant(merchantId: string, rejectionReason: string) {
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

  return {
    ok: true,
    message: 'KYC rejected. Merchant has been notified.',
    merchant: sanitizeMerchantAccount(merchant),
  };
}
