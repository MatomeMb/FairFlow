/** Merchant account row shape used by auth and admin flows */
export type MerchantAccount = {
  id: string;
  business_name: string;
  email: string;
  password_hash?: string;
  auth_provider?: 'password' | 'google';
  kyc_status?: 'not_started' | 'pending' | 'approved' | 'rejected' | 'expired';
  commission_rate?: number;
  payout_frequency?: 'weekly' | 'monthly';
  payout_minimum?: number;
  total_earnings?: number;
  pending_payout?: number;
  payout_eligible?: boolean;
  next_payout_date?: string;
  kyc_verified_at?: string;
  smile_id_job_id?: string;
  smile_id_session_id?: string;
  smile_id_result_code?: string;
  smile_id_result_text?: string;
  kyc_rejection_reason?: string;
  smile_kyc_notified_key?: string;
  kyc_data?: {
    id_number: string;
    date_of_birth: string;
    address: string;
    phone: string;
  };
  bank_account?: {
    account_holder_name: string;
    bank_name: string;
    branch_code: string;
    account_type: 'cheque' | 'savings' | 'transmission';
    account_number: string;
  };
  reset_token?: string;
  reset_expires_at?: string;
  created_at?: string;
  updated_at?: string;
};
