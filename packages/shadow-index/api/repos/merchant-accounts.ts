import crypto from 'node:crypto';
import { db } from '../db.js';
import type { MerchantAccount } from '../shared/merchant-types.js';

/** Stored when the merchant has no password (Google OAuth). `verifyPassword` rejects it (no `salt:hex` pair). */
export const OAUTH_NO_PASSWORD_SENTINEL = '!oauth-no-password!';

const escapeIlikeExact = (value: string): string =>
  value.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');

type PgErr = { message: string; code?: string; details?: string; hint?: string };

const formatPgErr = (ctx: string, err: PgErr): Error =>
  new Error(
    [
      ctx,
      err.message,
      err.code && `code=${err.code}`,
      err.details && `details=${err.details}`,
      err.hint && `hint=${err.hint}`,
    ]
      .filter(Boolean)
      .join(' | ')
  );

export const hashPassword = (password: string): string => {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.pbkdf2Sync(password, salt, 100_000, 32, 'sha256').toString('hex');
  return `${salt}:${derived}`;
};

export const verifyPassword = (password: string, storedHash?: string): boolean => {
  if (!storedHash) return false;
  const [salt, expected] = storedHash.split(':');
  if (!salt || !expected) return false;
  const derived = crypto.pbkdf2Sync(password, salt, 100_000, 32, 'sha256').toString('hex');
  const providedBuf = Buffer.from(derived, 'utf8');
  const expectedBuf = Buffer.from(expected, 'utf8');
  return providedBuf.length === expectedBuf.length && crypto.timingSafeEqual(providedBuf, expectedBuf);
};

const mapMerchantRow = (row: Record<string, unknown>): MerchantAccount => {
  const rawPh = row.password_hash;
  const password_hash =
    typeof rawPh === 'string' && rawPh !== OAUTH_NO_PASSWORD_SENTINEL ? rawPh : undefined;
  const hasRealPassword = Boolean(password_hash?.includes(':'));

  return {
  id: String(row.id ?? ''),
  business_name: String(row.business_name ?? ''),
  email: String(row.email ?? ''),
  password_hash,
  auth_provider: hasRealPassword ? 'password' : 'google',
  kyc_status: row.kyc_status as MerchantAccount['kyc_status'],
  commission_rate: typeof row.commission_rate === 'number' ? row.commission_rate : undefined,
  payout_frequency: row.payout_frequency as MerchantAccount['payout_frequency'],
  payout_minimum: typeof row.payout_minimum === 'number' ? row.payout_minimum : undefined,
  total_earnings: typeof row.total_earnings === 'number' ? row.total_earnings : undefined,
  pending_payout: typeof row.pending_payout === 'number' ? row.pending_payout : undefined,
  payout_eligible:
    typeof row.payout_eligible === 'boolean'
      ? row.payout_eligible
      : row.kyc_status === 'approved'
        ? true
        : undefined,
  next_payout_date: typeof row.next_payout_date === 'string' ? row.next_payout_date : undefined,
  kyc_verified_at: typeof row.kyc_verified_at === 'string' ? row.kyc_verified_at : undefined,
  smile_id_job_id: typeof row.smile_id_job_id === 'string' ? row.smile_id_job_id : undefined,
  smile_id_session_id: typeof row.smile_id_session_id === 'string' ? row.smile_id_session_id : undefined,
  smile_id_result_code: typeof row.smile_id_result_code === 'string' ? row.smile_id_result_code : undefined,
  smile_id_result_text: typeof row.smile_id_result_text === 'string' ? row.smile_id_result_text : undefined,
  kyc_rejection_reason: typeof row.kyc_rejection_reason === 'string' ? row.kyc_rejection_reason : undefined,
  smile_kyc_notified_key: typeof row.smile_kyc_notified_key === 'string' ? row.smile_kyc_notified_key : undefined,
  kyc_data: (row.kyc_data as MerchantAccount['kyc_data']) ?? undefined,
  bank_account: (row.bank_account as MerchantAccount['bank_account']) ?? undefined,
  created_at: typeof row.created_at === 'string' ? row.created_at : undefined,
  updated_at: typeof row.updated_at === 'string' ? row.updated_at : undefined,
  };
};


/**
 * Lookup by email. Uses `.limit(1)` instead of `.maybeSingle()` so duplicate email rows
 * (data issue) return one row instead of PostgREST error PGRST116.
 */
export const findMerchantAccountByEmail = async (email: string): Promise<MerchantAccount | null> => {
  const normalized = email.toLowerCase();

  const byEq = await db.from('merchant_accounts').select('*').eq('email', normalized).limit(1);
  if (byEq.error) {
    throw formatPgErr('find merchant by email (eq)', byEq.error);
  }
  const row0 = byEq.data?.[0];
  if (row0 && typeof row0 === 'object') {
    return mapMerchantRow(row0 as Record<string, unknown>);
  }

  const byIlike = await db
    .from('merchant_accounts')
    .select('*')
    .ilike('email', escapeIlikeExact(normalized))
    .limit(1);
  if (byIlike.error) {
    throw formatPgErr('find merchant by email (ilike)', byIlike.error);
  }
  const row1 = byIlike.data?.[0];
  if (!row1 || typeof row1 !== 'object') return null;
  return mapMerchantRow(row1 as Record<string, unknown>);
};

export const loadMerchantAccounts = async (): Promise<MerchantAccount[]> => {
  const { data, error } = await db
    .from('merchant_accounts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw formatPgErr('load merchant_accounts', error);
  }

  return ((data ?? []) as Array<Record<string, unknown>>).map((row) => mapMerchantRow(row));
};

const merchantAccountToDbRow = (account: MerchantAccount) => ({
  id: account.id,
  business_name: account.business_name,
  email: account.email.toLowerCase(),
  password_hash: account.password_hash ?? OAUTH_NO_PASSWORD_SENTINEL,
  kyc_status: account.kyc_status ?? 'not_started',
  kyc_data: account.kyc_data ?? null,
  bank_account: account.bank_account ?? null,
  commission_rate: account.commission_rate ?? 0.03,
  payout_frequency: account.payout_frequency ?? 'weekly',
  payout_minimum: account.payout_minimum ?? 50000,
  total_earnings: account.total_earnings ?? 0,
  pending_payout: account.pending_payout ?? 0,
  payout_eligible: account.payout_eligible ?? false,
  next_payout_date: account.next_payout_date ?? null,
  kyc_verified_at: account.kyc_verified_at ?? null,
  smile_id_job_id: account.smile_id_job_id ?? null,
  smile_id_session_id: account.smile_id_session_id ?? null,
  smile_id_result_code: account.smile_id_result_code ?? null,
  smile_id_result_text: account.smile_id_result_text ?? null,
  kyc_rejection_reason: account.kyc_rejection_reason ?? null,
  smile_kyc_notified_key: account.smile_kyc_notified_key ?? null,
  created_at: account.created_at ?? new Date().toISOString(),
  updated_at: account.updated_at ?? new Date().toISOString(),
});

/** Persist one account (OAuth, targeted updates) without re-upserting every merchant row. */
export const upsertMerchantAccount = async (account: MerchantAccount): Promise<void> => {
  const { error } = await db
    .from('merchant_accounts')
    .upsert([merchantAccountToDbRow(account)], { onConflict: 'id' });

  if (error) {
    throw formatPgErr('upsert merchant_accounts', error);
  }
};

/**
 * Google OAuth: insert new row or update existing. On unique violation (email/id race), merge onto DB row and update.
 */
export const persistMerchantAccountForOAuth = async (
  account: MerchantAccount,
  isNew: boolean
): Promise<void> => {
  if (!isNew) {
    const { error } = await db
      .from('merchant_accounts')
      .update(merchantAccountToDbRow(account))
      .eq('id', account.id);
    if (error) throw formatPgErr('oauth update merchant_accounts', error);
    return;
  }

  const row = merchantAccountToDbRow(account);
  const { error: insErr } = await db.from('merchant_accounts').insert(row);
  if (!insErr) return;

  const code = (insErr as PgErr).code;
  if (code === '23505') {
    const existing = await findMerchantAccountByEmail(account.email);
    if (!existing) throw formatPgErr('oauth insert duplicate but email not found', insErr);

    const merged: MerchantAccount = {
      ...existing,
      ...account,
      id: existing.id,
      password_hash: existing.password_hash ?? account.password_hash,
      created_at: existing.created_at ?? account.created_at,
      business_name: account.business_name || existing.business_name,
      updated_at: row.updated_at as string,
    };
    Object.assign(account, merged);

    const { error: upErr } = await db
      .from('merchant_accounts')
      .update(merchantAccountToDbRow(account))
      .eq('id', account.id);
    if (upErr) throw formatPgErr('oauth reconcile after unique violation', upErr);
    return;
  }

  throw formatPgErr('oauth insert merchant_accounts', insErr);
};

export const saveMerchantAccounts = async (accounts: MerchantAccount[]): Promise<void> => {
  if (accounts.length === 0) return;

  const rows = accounts.map(merchantAccountToDbRow);

  const { error } = await db.from('merchant_accounts').upsert(rows, { onConflict: 'id' });

  if (error) {
    throw formatPgErr('save merchant_accounts', error);
  }
};

export const sanitizeMerchantAccount = (account: MerchantAccount) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password_hash: _ph, reset_token: _rt, reset_expires_at: _re, ...safe } = account;
  if (safe.bank_account?.account_number) {
    const masked = safe.bank_account.account_number.slice(-4).padStart(safe.bank_account.account_number.length, '*');
    safe.bank_account = { ...safe.bank_account, account_number: masked };
  }
  return safe;
};
