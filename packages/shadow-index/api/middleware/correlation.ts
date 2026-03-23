import crypto from 'node:crypto';
import type { MiddlewareHandler } from 'hono';
import { emitMetric, withRequestContext } from '../shared/logger.js';
import { getJwtSecret } from '../shared/runtime-config.js';
import { verifyJwt } from '../shared/jwt.js';

declare module 'hono' {
  interface ContextVariableMap {
    requestId: string;
    correlationId: string;
    merchantId?: string;
  }
}

const extractBearer = (header: string | undefined): string | null => {
  if (!header || !header.startsWith('Bearer ')) return null;
  const token = header.slice(7).trim();
  return token.length > 0 ? token : null;
};

export const correlationMiddleware: MiddlewareHandler = async (c, next) => {
  const requestId = c.req.header('x-request-id')?.trim() || crypto.randomUUID();
  const inboundCorrelation = c.req.header('x-correlation-id')?.trim();
  const bearer = extractBearer(c.req.header('authorization') ?? c.req.header('Authorization'));
  let merchantId: string | undefined;
  let jwtCorrelation: string | undefined;

  if (bearer) {
    const payload = verifyJwt(bearer, getJwtSecret());
    if (payload) {
      merchantId = typeof payload.sub === 'string' ? payload.sub : undefined;
      jwtCorrelation =
        typeof payload.rid === 'string'
          ? payload.rid
          : typeof payload.jti === 'string'
            ? payload.jti
            : undefined;
    }
  }

  const correlationId = inboundCorrelation || jwtCorrelation || requestId;
  c.set('requestId', requestId);
  c.set('correlationId', correlationId);
  if (merchantId) c.set('merchantId', merchantId);

  c.header('x-request-id', requestId);
  c.header('x-correlation-id', correlationId);
  await next();
};

export const requestLoggingMiddleware: MiddlewareHandler = async (c, next) => {
  const startedAt = performance.now();
  const logger = withRequestContext(c);
  logger.info('request_start');
  await next();
  const durationMs = Math.round((performance.now() - startedAt) * 100) / 100;
  // FINAL-POLISH: emit normalized request timing fields for every handler via shared middleware.
  emitMetric(logger, 'http.request.duration_ms', durationMs, {
    status: c.res.status,
    path: c.req.path,
    method: c.req.method,
  });
  logger.info(
    {
      reqId: c.get('requestId'),
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      durationMs,
      merchantId: c.get('merchantId') ?? null,
    },
    'request completed'
  );
};

