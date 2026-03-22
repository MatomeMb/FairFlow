-- Sumsub KYC (reuses merchant_accounts columns added in 005_merchant_smile_kyc.sql)
-- No new columns: smile_id_session_id stores Sumsub applicant id; smile_id_result_* stores review metadata.

comment on column public.merchant_accounts.smile_id_job_id is 'Legacy Smile job id; unused for Sumsub (may be null)';
comment on column public.merchant_accounts.smile_id_session_id is 'Sumsub applicant id for this merchant';
comment on column public.merchant_accounts.smile_id_result_code is 'Last Sumsub reviewAnswer (e.g. GREEN, RED)';
comment on column public.merchant_accounts.smile_id_result_text is 'Sumsub reviewRejectType or reviewAnswer detail';
comment on column public.merchant_accounts.smile_kyc_notified_key is 'Idempotency: applicantId:reviewAnswer after email+notification sent';
