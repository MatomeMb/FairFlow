-- Allow merchant rows without auth.users (Google / custom JWT merchants).
-- Safe to run once; no-op if column is missing or already nullable.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'merchant_accounts'
      AND column_name = 'user_id'
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.merchant_accounts ALTER COLUMN user_id DROP NOT NULL;
  END IF;
END $$;
