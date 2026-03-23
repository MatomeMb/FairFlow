import type { MiddlewareHandler } from 'hono';
import { apiLogger } from '../shared/logger.js';

const prodOrigins = [
  'https://fairflow.co.za',
  'https://www.fairflow.co.za',
  'https://portal.fairflow.co.za',
  'https://api.fairflow.co.za',
];
const devOrigins = [
  'http://localhost:3000',
  'http://localhost:5178',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5178',
];
const envOrigins = (process.env.CORS_ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = new Set(
  process.env.NODE_ENV === 'production'
    ? [...prodOrigins, ...envOrigins]
    : [...prodOrigins, ...devOrigins, ...envOrigins]
);

const ALLOW_METHODS = 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS';
const ALLOW_HEADERS = 'Accept,Content-Type,Authorization,x-merchant-id,x-api-key,x-auth-portal-base-url';
const EXPOSE_HEADERS =
  'x-request-id,x-correlation-id,Content-Range,X-RateLimit-Limit,X-RateLimit-Remaining';

const setCorsHeaders = (response: Response, origin: string): void => {
  response.headers.set('Vary', 'Origin');
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Methods', ALLOW_METHODS);
  response.headers.set('Access-Control-Allow-Headers', ALLOW_HEADERS);
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Expose-Headers', EXPOSE_HEADERS);
  response.headers.set('Access-Control-Max-Age', '86400');
};

export const corsMiddleware: MiddlewareHandler = async (c, next) => {
  const origin = c.req.header('Origin');
  const allowedOrigin = origin && allowedOrigins.has(origin) ? origin : null;

  // FINAL-POLISH: short-circuit preflight before auth/rate-limit to avoid CORS false-negatives.
  if (c.req.method === 'OPTIONS') {
    if (!allowedOrigin) {
      // FINAL-POLISH: log rejected preflight origins to aid production CORS diagnostics.
      apiLogger.warn(
        {
          origin: origin ?? null,
          path: c.req.path,
          method: c.req.method,
        },
        'cors_preflight_rejected'
      );
      return new Response(null, { status: 403 });
    }
    const response = new Response(null, { status: 204 });
    setCorsHeaders(response, allowedOrigin);
    return response;
  }

  await next();
  if (allowedOrigin) {
    setCorsHeaders(c.res, allowedOrigin);
  }
  return;
};
