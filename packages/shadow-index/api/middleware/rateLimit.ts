import type { MiddlewareHandler } from 'hono';
import { err } from '../shared/errors.js';
import { apiLogger, emitMetric, withRequestContext } from '../shared/logger.js';

/**
 * ARCHITECTURE NOTE (ADR-006):
 * This rate limiter is per-instance (acceptable for beta single-instance deployment).
 * For multi-instance production, replace rateLimitMap with Upstash Redis:
 * https://upstash.com/docs/redis/sdks/ts/ratelimit
 * Decision recorded in docs/adr/ADR-006-rate-limiting.md
 */
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '60000', 10) || 60_000;
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX ?? '100', 10) || 100;

const requestCounts = new Map<string, { count: number; windowStart: number }>();
let rateLimitHits = 0;
let rateLimitPasses = 0;

function getClientId(c: { req: { header: (n: string) => string | undefined } }): string {
  const forwarded = c.req.header('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return c.req.header('x-real-ip') ?? 'unknown';
}

export const rateLimitMiddleware: MiddlewareHandler = async (c, next) => {
  // FINAL-POLISH: allow browser CORS preflight to pass through without throttling.
  if (c.req.method === 'OPTIONS') {
    return next();
  }
  if (c.req.path === '/v1/merchant/kyc/callback') {
    return next();
  }
  const logger = withRequestContext(c);
  const ip = getClientId(c);
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now - record.windowStart > RATE_LIMIT_WINDOW_MS) {
    requestCounts.set(ip, { count: 1, windowStart: now });
    rateLimitPasses += 1;
    return next();
  }

  if (record.count >= RATE_LIMIT_MAX) {
    rateLimitHits += 1;
    emitMetric(logger, 'ratelimit.hit', 1, { path: c.req.path, method: c.req.method });
    logger.warn({ ip }, 'ratelimit_block');
    return c.json(err('rate_limit_exceeded', 'Too many requests; try again later'), 429);
  }

  record.count += 1;
  rateLimitPasses += 1;
  return next();
};

const RATE_LIMIT_CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let rateLimitCleanupTimer: ReturnType<typeof setInterval> | null = null;

export function startRateLimitCleanup(): void {
  if (rateLimitCleanupTimer) return;
  rateLimitCleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of requestCounts) {
      if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
        requestCounts.delete(key);
      }
    }
    const total = rateLimitHits + rateLimitPasses;
    const hitRatio = total > 0 ? rateLimitHits / total : 0;
    // FINAL-POLISH: codify operational alert thresholds with greppable markers.
    // ALERT_THRESHOLD: ratelimit_hit_ratio > 0.20 over 5 min
    emitMetric(apiLogger, 'ratelimit.hit_ratio', Number(hitRatio.toFixed(4)), {
      windowMs: RATE_LIMIT_WINDOW_MS,
      entries: requestCounts.size,
    });
    rateLimitHits = 0;
    rateLimitPasses = 0;
  }, RATE_LIMIT_CLEANUP_INTERVAL_MS);
}

export function stopRateLimitCleanup(): void {
  if (rateLimitCleanupTimer) {
    clearInterval(rateLimitCleanupTimer);
    rateLimitCleanupTimer = null;
  }
}
