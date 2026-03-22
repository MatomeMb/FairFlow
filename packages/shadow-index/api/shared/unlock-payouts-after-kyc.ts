import type { MerchantAccount } from './merchant-types.js';
import { computeNextPayoutDateIso } from '../sumsub-kyc.js';

export const unlockPayoutsAfterKycApproval = (merchant: MerchantAccount): string => {
  const frequency = merchant.payout_frequency ?? 'weekly';
  const nextIso = computeNextPayoutDateIso(frequency);
  merchant.payout_eligible = true;
  merchant.next_payout_date = nextIso;
  merchant.kyc_verified_at = new Date().toISOString();
  return nextIso;
};
