/**
 * Merchant auth: register, login, refresh, Google OAuth, forgot-password.
 */
import { Hono } from 'hono';
import crypto from 'node:crypto';
import { z } from 'zod';
import { buildPortalUrlSafe, sanitizeOAuthPortalOrigin } from '../auth/oauth-portal-url.js';
import {
  buildGoogleState,
  exchangeGoogleCode,
  extractBearerToken,
  fetchGoogleProfile,
  getGoogleOAuthConfig,
  inferPortalBaseUrl,
  parseGoogleState,
} from '../auth/portal-oauth.js';
import {
  findMerchantAccountByEmail,
  hashPassword,
  loadMerchantAccounts,
  persistMerchantAccountForOAuth,
  saveMerchantAccounts,
  sanitizeMerchantAccount,
  verifyPassword,
} from '../repos/merchant-accounts.js';
import { logError } from '../../lib/error-logger.js';
import { logger } from '../../lib/logger.js';
import { err } from '../shared/errors.js';
import { issueMerchantToken, verifyJwt } from '../shared/jwt.js';
import type { MerchantAccount } from '../shared/merchant-types.js';
import { authPortalBaseUrl, getJwtSecret } from '../shared/runtime-config.js';

/**
 * When set to e.g. `.fairflow.co.za`, OAuth sets `ff_merchant_oauth` and redirects without `?token=`
 * (avoids long `Location` headers / broken redirects). Portal must set the same value in
 * `VITE_MERCHANT_OAUTH_COOKIE_DOMAIN` so the client can clear the cookie after copying to sessionStorage.
 */
const merchantOAuthCookieHeader = (token: string): string | null => {
  const domain = process.env.MERCHANT_OAUTH_COOKIE_DOMAIN?.trim();
  if (!domain) return null;
  const enc = encodeURIComponent(token);
  return `ff_merchant_oauth=${enc}; Domain=${domain}; Path=/; Max-Age=600; SameSite=Lax; Secure`;
};

const registerSchema = z.object({
  business_name: z.string().trim().min(1, 'Business name is required'),
  email: z.string().trim().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const loginSchema = z.object({
  email: z.string().trim().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Valid email is required'),
});

export const authRouter = new Hono();

authRouter.post('/merchant/register', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (body === null || body === undefined) {
    return c.json(err('invalid_json', 'Request body must be valid JSON'), 400);
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(err('invalid_request', 'Invalid registration payload', parsed.error.flatten()), 400);
  }

  const email = parsed.data.email.toLowerCase();
  const accounts = await loadMerchantAccounts();
  const exists = accounts.some((account) => account.email.toLowerCase() === email);
  if (exists) {
    return c.json(err('account_exists', 'A merchant account with this email already exists'), 409);
  }

  const now = new Date().toISOString();
  const account: MerchantAccount = {
    id: crypto.randomUUID(),
    business_name: parsed.data.business_name,
    email,
    password_hash: hashPassword(parsed.data.password),
    auth_provider: 'password',
    kyc_status: 'not_started',
    commission_rate: 0.03,
    payout_frequency: 'weekly',
    payout_minimum: 50000,
    total_earnings: 0,
    pending_payout: 0,
    created_at: now,
    updated_at: now,
  };

  accounts.push(account);
  await saveMerchantAccounts(accounts);

  return c.json(
    {
      token: issueMerchantToken(account, getJwtSecret()),
      account: sanitizeMerchantAccount(account),
    },
    201
  );
});

authRouter.post('/merchant/login', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (body === null || body === undefined) {
    return c.json(err('invalid_json', 'Request body must be valid JSON'), 400);
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(err('invalid_request', 'Invalid login payload', parsed.error.flatten()), 400);
  }

  const email = parsed.data.email.toLowerCase();
  const accounts = await loadMerchantAccounts();
  const account = accounts.find((candidate) => candidate.email.toLowerCase() === email);
  if (!account || !verifyPassword(parsed.data.password, account.password_hash)) {
    return c.json(err('invalid_credentials', 'Invalid email or password'), 401);
  }

  account.updated_at = new Date().toISOString();
  await saveMerchantAccounts(accounts);

  return c.json({
    token: issueMerchantToken(account, getJwtSecret()),
    account: sanitizeMerchantAccount(account),
  });
});

authRouter.post('/merchant/refresh', async (c) => {
  const authHeader = c.req.header('Authorization');
  const token = extractBearerToken(authHeader);
  if (!token) {
    return c.json(err('unauthorized', 'Missing Bearer token'), 401);
  }

  const payload = verifyJwt(token, getJwtSecret());
  if (!payload || payload.typ !== 'merchant_auth') {
    return c.json(err('unauthorized', 'Invalid or expired token'), 401);
  }

  const subject = typeof payload.sub === 'string' ? payload.sub : null;
  const email = typeof payload.email === 'string' ? payload.email.toLowerCase() : null;
  if (!subject && !email) {
    return c.json(err('unauthorized', 'Token payload is missing subject'), 401);
  }

  const accounts = await loadMerchantAccounts();
  const account = accounts.find((candidate) =>
    subject ? candidate.id === subject : candidate.email.toLowerCase() === email
  );
  if (!account) {
    return c.json(err('unauthorized', 'Account not found for token'), 401);
  }

  const newToken = issueMerchantToken(account, getJwtSecret());
  return c.json({
    token: newToken,
    account: sanitizeMerchantAccount(account),
  });
});

authRouter.get('/merchant/me', async (c) => {
  const token = extractBearerToken(c.req.header('Authorization'));
  if (!token) {
    return c.json(err('unauthorized', 'Missing Bearer token'), 401);
  }

  const payload = verifyJwt(token, getJwtSecret());
  if (!payload || payload.typ !== 'merchant_auth') {
    return c.json(err('unauthorized', 'Invalid or expired token'), 401);
  }

  const subject = typeof payload.sub === 'string' ? payload.sub : null;
  const email = typeof payload.email === 'string' ? payload.email.toLowerCase() : null;
  if (!subject && !email) {
    return c.json(err('unauthorized', 'Token payload is missing subject'), 401);
  }

  const accounts = await loadMerchantAccounts();
  const account = accounts.find((candidate) =>
    subject ? candidate.id === subject : candidate.email.toLowerCase() === email
  );
  if (!account) {
    return c.json(err('unauthorized', 'Account not found for token'), 401);
  }

  return c.json({ account: sanitizeMerchantAccount(account) });
});

authRouter.post('/merchant/forgot-password', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (body === null || body === undefined) {
    return c.json(err('invalid_json', 'Request body must be valid JSON'), 400);
  }

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(err('invalid_request', 'Invalid forgot-password payload', parsed.error.flatten()), 400);
  }

  const email = parsed.data.email.toLowerCase();
  const accounts = await loadMerchantAccounts();
  const account = accounts.find((candidate) => candidate.email.toLowerCase() === email);
  if (!account) {
    return c.json({ ok: true, message: 'If the account exists, a reset token has been generated.' });
  }

  const resetToken = crypto.randomBytes(24).toString('hex');
  account.reset_token = resetToken;
  account.reset_expires_at = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  account.updated_at = new Date().toISOString();
  await saveMerchantAccounts(accounts);

  return c.json({
    ok: true,
    message: 'Reset token generated.',
    reset_token: resetToken,
  });
});

authRouter.get('/google', async (c) => {
  const portalBaseUrl = inferPortalBaseUrl(c);
  const config = getGoogleOAuthConfig();
  if (!config) {
    return c.json(
      {
        ok: false,
        error: 'Google OAuth not configured. Missing GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, or GOOGLE_REDIRECT_URI.',
        missing: {
          GOOGLE_CLIENT_ID: !process.env.GOOGLE_CLIENT_ID,
          GOOGLE_CLIENT_SECRET: !process.env.GOOGLE_CLIENT_SECRET,
          GOOGLE_REDIRECT_URI: !process.env.GOOGLE_REDIRECT_URI,
        },
      },
      500
    );
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
    state: buildGoogleState(portalBaseUrl),
  });

  return c.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

authRouter.get('/google/callback', async (c) => {
  const rid = crypto.randomUUID();
  let portalBaseUrl = authPortalBaseUrl;

  const redirectLogin = (errorCode: string) =>
    c.redirect(buildPortalUrlSafe('/merchant/login', { error: errorCode, rid }, portalBaseUrl, rid));

  try {
    const parsedState = parseGoogleState(c.req.query('state') ?? null);
    const stateReturnTo =
      parsedState && typeof parsedState.return_to === 'string' ? parsedState.return_to : undefined;
    portalBaseUrl = sanitizeOAuthPortalOrigin(stateReturnTo, rid);

    const errorCode = c.req.query('error');
    if (errorCode) {
      const mapped = errorCode === 'access_denied' ? 'google_cancelled' : 'google_token_failed';
      return redirectLogin(mapped);
    }

    if (!parsedState) {
      logger.warn('oauth_invalid_state', { rid });
      return redirectLogin('google_token_failed');
    }

    const code = c.req.query('code');
    if (!code) {
      return redirectLogin('google_token_failed');
    }

    const config = getGoogleOAuthConfig();
    if (!config) {
      return redirectLogin('google_not_configured');
    }

    const tokenResponse = await exchangeGoogleCode(code, config);
    const accessToken = tokenResponse?.access_token;
    if (!accessToken) {
      logger.error('oauth_no_access_token', { rid });
      return redirectLogin('google_token_failed');
    }

    const profile = await fetchGoogleProfile(accessToken);
    const profileEmail = profile?.email?.toLowerCase();
    if (!profileEmail) {
      return redirectLogin('google_no_email');
    }

    const now = new Date().toISOString();

    let existing: MerchantAccount | null;
    try {
      existing = await findMerchantAccountByEmail(profileEmail);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      logError({ path: c.req.path, method: c.req.method, flow: 'google_oauth_callback', rid, phase: 'db_read' }, msg);
      logger.error('oauth_db_read_failed', { rid, err: msg });
      return redirectLogin('oauth_db_read');
    }

    const isNew = !existing;
    const merchantAccount: MerchantAccount = existing
      ? { ...existing, auth_provider: 'google', updated_at: now }
      : {
          id: crypto.randomUUID(),
          business_name: profile?.name?.trim() || profileEmail.split('@')[0],
          email: profileEmail,
          auth_provider: 'google',
          kyc_status: 'not_started',
          commission_rate: 0.03,
          payout_frequency: 'weekly',
          payout_minimum: 50000,
          total_earnings: 0,
          pending_payout: 0,
          created_at: now,
          updated_at: now,
        };

    try {
      await persistMerchantAccountForOAuth(merchantAccount, isNew);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      logError({ path: c.req.path, method: c.req.method, flow: 'google_oauth_callback', rid, phase: 'db_write' }, msg);
      logger.error('oauth_db_write_failed', { rid, err: msg });
      return redirectLogin('oauth_db_write');
    }

    let merchantToken: string;
    try {
      merchantToken = issueMerchantToken(merchantAccount, getJwtSecret());
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      logger.error('oauth_issue_token_failed', { rid, err: msg });
      return redirectLogin('oauth_session_failed');
    }

    try {
      const cookie = merchantOAuthCookieHeader(merchantToken);
      if (cookie) {
        c.header('Set-Cookie', cookie);
        return c.redirect(buildPortalUrlSafe('/dashboard/merchant', undefined, portalBaseUrl, rid));
      }
      return c.redirect(
        buildPortalUrlSafe('/dashboard/merchant', { token: merchantToken }, portalBaseUrl, rid)
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      logger.error('oauth_redirect_failed', { rid, err: msg });
      return redirectLogin('oauth_redirect_failed');
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    logError({ path: c.req.path, method: c.req.method, flow: 'google_oauth_callback', rid }, msg, stack);
    logger.error('oauth_unhandled', { rid, err: msg });
    return redirectLogin('oauth_failed');
  }
});
