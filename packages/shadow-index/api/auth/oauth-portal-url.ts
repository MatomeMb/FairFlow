/**
 * OAuth redirect safety: reject open redirects and avoid `new URL()` throws from bad `return_to`.
 */
import { logger } from '../../lib/logger.js';
import { authPortalBaseUrl } from '../shared/runtime-config.js';
import { buildPortalUrl } from './portal-oauth.js';

function defaultAllowedOrigins(): Set<string> {
  try {
    const u = new URL(authPortalBaseUrl);
    const origins = new Set<string>([u.origin]);
    const host = u.hostname;
    if (host.startsWith('www.')) {
      origins.add(`${u.protocol}//${host.slice(4)}`);
    } else if (host !== 'localhost' && host !== '127.0.0.1') {
      origins.add(`${u.protocol}//www.${host}`);
    }
    return origins;
  } catch {
    return new Set(['http://localhost:5178']);
  }
}

function allowedReturnOrigins(): Set<string> {
  const raw = process.env.OAUTH_ALLOWED_RETURN_ORIGINS?.split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (raw && raw.length > 0) {
    return new Set(raw);
  }
  return defaultAllowedOrigins();
}

function primaryPortalOrigin(): string {
  try {
    return new URL(authPortalBaseUrl).origin;
  } catch {
    return 'http://localhost:5178';
  }
}

/** Resolve JWT `return_to` to a safe origin (allowlist). */
export function sanitizeOAuthPortalOrigin(returnTo: unknown, rid: string): string {
  const allow = allowedReturnOrigins();
  const fallback = primaryPortalOrigin();

  if (typeof returnTo !== 'string' || !returnTo.trim()) {
    return fallback;
  }
  try {
    const u = new URL(returnTo.trim());
    if (u.protocol !== 'http:' && u.protocol !== 'https:') {
      logger.warn('oauth_return_to_bad_protocol', { rid, protocol: u.protocol });
      return fallback;
    }
    if (!allow.has(u.origin)) {
      logger.warn('oauth_return_to_rejected', { rid, origin: u.origin, allowed: [...allow] });
      return fallback;
    }
    return u.origin;
  } catch (e) {
    logger.warn('oauth_return_to_invalid', { rid, err: String(e) });
    return fallback;
  }
}

export function buildPortalUrlSafe(
  pathName: string,
  params: Record<string, string> | undefined,
  portalBaseUrl: string,
  rid: string,
): string {
  try {
    return buildPortalUrl(pathName, params, portalBaseUrl);
  } catch (e) {
    logger.error('oauth_build_portal_url_failed', { rid, err: String(e), pathName });
    return buildPortalUrl(pathName, params, authPortalBaseUrl);
  }
}
