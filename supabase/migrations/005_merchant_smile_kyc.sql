-- Smile ID KYC + payout eligibility (merchant_accounts)
-- Apply in Supabase SQL editor or via supabase db push.

alter table public.merchant_accounts
  add column if not exists payout_eligible boolean not null default false,
  add column if not exists next_payout_date timestamptz,
  add column if not exists kyc_verified_at timestamptz,
  add column if not exists smile_id_job_id text,
  add column if not exists smile_id_session_id text,
  add column if not exists smile_id_result_code text,
  add column if not exists smile_id_result_text text,
  add column if not exists kyc_rejection_reason text,
  add column if not exists smile_kyc_notified_key text;

comment on column public.merchant_accounts.smile_id_job_id is 'Last Smile job_id we generated for web token (session tracking)';
comment on column public.merchant_accounts.smile_id_session_id is 'Alias / duplicate tracking field for job_id if needed';
comment on column public.merchant_accounts.smile_kyc_notified_key is 'Idempotency: SmileJobID:ResultCode after email+notification sent';
