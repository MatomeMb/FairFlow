import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { err } from '../shared/errors.js';
import {
  getPendingKycSubmissions,
  approveKycMerchant,
  rejectKycMerchant,
} from '../services/admin-kyc-service.js';
import { listPendingAdminPayouts, releaseAdminPayoutByLogId } from '../services/admin-payout-service.js';
import { AdminHttpError } from '../services/admin-http-error.js';

/**
 * Admin Proxy Router
 *
 * All routes here:
 * 1. Validate the caller has an active Supabase session with role `ceo` or `cto` (user_roles).
 * 2. Run the same business logic as `/v1/admin/*` without exposing ADMIN_SECRET_KEY to the browser.
 *
 * This replaces VITE_ADMIN_SECRET in the frontend bundle.
 * See docs/adr/ADR-005-merchant-auth.md — server proxy upgrade path.
 */

export const adminProxyRouter = new Hono();

const ADMIN_ROLES = ['ceo', 'cto'];
const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

async function validateSupabaseAdminSession(
  authHeader: string | undefined,
): Promise<{ valid: boolean; userId?: string; role?: string }> {
  if (!authHeader?.startsWith('Bearer ')) return { valid: false };
  const token = authHeader.replace('Bearer ', '');

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return { valid: false };
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);
    if (error || !user) return { valid: false };

    const { data: roleRows } = await supabase.from('user_roles').select('role').eq('user_id', user.id);

    const roles = (roleRows ?? [])
      .map((row: { role?: string }) => row.role)
      .filter((r): r is string => Boolean(r));
    const staffRole = roles.find((r) => ADMIN_ROLES.includes(r));
    if (!staffRole) return { valid: false };

    return { valid: true, userId: user.id, role: staffRole };
  } catch {
    return { valid: false };
  }
}

adminProxyRouter.use('*', async (c, next) => {
  const authHeader = c.req.header('Authorization');
  const session = await validateSupabaseAdminSession(authHeader);
  if (!session.valid) {
    return c.json(err('forbidden', 'Valid admin session required'), 403);
  }
  return next();
});

adminProxyRouter.get('/kyc/pending', async (c) => {
  const page = Math.max(1, parseInt(c.req.query('page') ?? '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(c.req.query('limit') ?? '20', 10)));
  const data = await getPendingKycSubmissions(page, limit);
  return c.json(data);
});

adminProxyRouter.patch('/kyc/approve/:merchantId', async (c) => {
  const merchantId = c.req.param('merchantId');
  const body = await c.req.json().catch(() => null) as { notes?: string } | null;
  const approvalNotes = (body?.notes || '').trim();
  try {
    const data = await approveKycMerchant(merchantId, approvalNotes);
    return c.json(data);
  } catch (e) {
    if (e instanceof AdminHttpError) return c.json(e.body, e.status);
    throw e;
  }
});

adminProxyRouter.patch('/kyc/reject/:merchantId', async (c) => {
  const merchantId = c.req.param('merchantId');
  const body = await c.req.json().catch(() => null) as { reason?: string } | null;
  const rejectionReason = (body?.reason || '').trim();
  try {
    const data = await rejectKycMerchant(merchantId, rejectionReason);
    return c.json(data);
  } catch (e) {
    if (e instanceof AdminHttpError) return c.json(e.body, e.status);
    throw e;
  }
});

adminProxyRouter.get('/payouts', async (c) => {
  const page = Math.max(1, parseInt(c.req.query('page') ?? '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(c.req.query('limit') ?? '20', 10)));
  const data = await listPendingAdminPayouts(page, limit);
  return c.json(data);
});

adminProxyRouter.post('/payouts/release', async (c) => {
  const body = await c.req.json().catch(() => null) as { payout_log_id?: string } | null;
  const payoutLogId = body?.payout_log_id ?? '';
  try {
    const data = await releaseAdminPayoutByLogId(payoutLogId);
    return c.json(data);
  } catch (e) {
    if (e instanceof AdminHttpError) return c.json(e.body, e.status);
    throw e;
  }
});
