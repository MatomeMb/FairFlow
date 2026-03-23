import type { MiddlewareHandler } from 'hono';
import { isApiKeyValid } from '../../lib/api-key-registry.js';
import { err } from '../shared/errors.js';
import { isValidMerchantAuthBearer } from './merchantAuth.js';

/**
 * Routes that skip API-key / merchant-JWT gate (public or carry their own auth).
 * Keep in sync with security reviews when adding endpoints.
 */
function isPublicPath(requestPath: string, method: string): boolean {
  if (requestPath.startsWith('/v1/auth/')) return true;
  if (requestPath === '/catalog/public') return true;
  if (requestPath === '/health' || requestPath === '/v1/analytics/dashboard') return true;
  if (
    requestPath === '/v1/admin/payouts/release' ||
    requestPath === '/v1/admin/mor-status' ||
    requestPath === '/v1/admin/payouts/backfill' ||
    requestPath === '/v1/admin/cron/release-escrow' ||
    requestPath === '/v1/admin/kyc/pending' ||
    requestPath.startsWith('/v1/admin/kyc/approve/') ||
    requestPath.startsWith('/v1/admin/kyc/reject/')
  ) {
    return true;
  }
  if (requestPath === '/webhooks/stripe' || requestPath === '/webhooks/paystack') return true;
  /** Staff admin UI uses Supabase session + CEO/CTO role; validated in routes/admin-proxy.ts */
  if (requestPath.startsWith('/v1/admin-proxy')) return true;
  if (requestPath === '/v1/merchant/kyc/callback' && method === 'POST') return true;
  if (requestPath.match(/^\/thing\/.+\.json$/)) return true;
  if (requestPath.startsWith('/resolve/')) return true;
  if (requestPath.startsWith('/checkout/')) return true;
  if (requestPath.startsWith('/orders/')) return true;
  if (requestPath.startsWith('/uploads/')) return true;
  if (requestPath.startsWith('/v1/slips/')) return true;
  if (requestPath.match(/^\/v1\/orders\/[^/]+\/confirm-receipt$/) && method === 'POST') return true;
  if (requestPath.match(/^\/v1\/orders\/[^/]+\/status$/) && method === 'GET') return true;
  if (requestPath === '/v1/cron/order-checkins' && method === 'POST') return true;
  return false;
}

export const apiKeyMiddleware: MiddlewareHandler = async (c, next) => {
  // FINAL-POLISH: never challenge CORS preflight with API-key/JWT requirements.
  if (c.req.method === 'OPTIONS') {
    return next();
  }

  const requestPath = c.req.path;
  if (isPublicPath(requestPath, c.req.method)) {
    return next();
  }

  const isMerchantRoute = requestPath.startsWith('/v1/merchant/');
  const isMerchantAnalyticsRoute = requestPath.startsWith('/v1/analytics/report');

  if (isMerchantRoute || isMerchantAnalyticsRoute) {
    const auth = c.req.header('Authorization');
    if (isValidMerchantAuthBearer(auth)) {
      return next();
    }
  }

  const headerKey = c.req.header('x-api-key');
  const auth = c.req.header('Authorization');
  const bearer = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  const key = headerKey ?? bearer;
  if (!isApiKeyValid(key)) {
    return c.json(err('unauthorized', 'Invalid or missing API key'), 401);
  }
  return next();
};
