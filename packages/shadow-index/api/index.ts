/**
 * Shadow Index API — composition root (Phase 1).
 * Domain logic lives in ./routes/* and ./services/*.
 */

import './env-bootstrap.js';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { corsMiddleware } from './middleware/cors.js';
import {
  rateLimitMiddleware,
  startRateLimitCleanup,
  stopRateLimitCleanup,
} from './middleware/rateLimit.js';
import { apiKeyMiddleware } from './middleware/apiKey.js';
import { err } from './shared/errors.js';
import { logError } from '../lib/error-logger.js';
import { logger } from '../lib/logger.js';
import { isR2Configured } from '../lib/storage.js';
import { analyticsRouter } from './routes/analytics.js';
import { authRouter } from './routes/auth.js';
import { webhooksRouter } from './routes/webhooks.js';
import { adminRouter } from './routes/admin.js';
import { checkoutRouter, checkoutPublicRouter } from './routes/checkout.js';
import { merchantRouter } from './routes/merchant.js';
import { merchantProductsRouter } from './merchant-products.js';
import { platformRouter } from './routes/platform.js';
import { compilerRouter } from './routes/compiler.js';
import { legacyRouter } from './routes/legacy.js';

const app = new Hono();

const storageMode = process.env.STORAGE_MODE || 'local';
const useR2 = storageMode === 'r2' && isR2Configured();

app.use('*', corsMiddleware);
app.use('*', rateLimitMiddleware);
app.use('*', apiKeyMiddleware);

app.route('/v1/analytics', analyticsRouter);
app.route('/v1/auth', authRouter);
app.route('/webhooks', webhooksRouter);
app.route('/v1/admin', adminRouter);
app.route('/checkout', checkoutRouter);
app.route('/', checkoutPublicRouter);
app.route('/v1/merchant/products', merchantProductsRouter);
app.route('/v1/merchant', merchantRouter);
app.route('/', platformRouter);
app.route('/', compilerRouter);
app.route('/', legacyRouter);

app.onError((error, c) => {
  const msg = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  logError({ path: c.req.path, method: c.req.method }, msg, stack);
  logger.error('Unhandled error', { error: msg });
  return c.json(err('internal_error', 'An unexpected error occurred'), 500);
});

app.notFound((c) =>
  c.json(
    err('not_found', 'Route not found', {
      path: c.req.path,
      method: c.req.method,
      health: '/health',
    }),
    404
  )
);

const port = Number(process.env.PORT) || 3000;
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  logger.info('Server starting', {
    port,
    storage: useR2 ? 'r2' : 'local',
    url: `http://localhost:${port}`,
  });

  const server = serve({ fetch: app.fetch, port });
  startRateLimitCleanup();

  const shutdown = () => {
    logger.info('Shutting down gracefully');
    stopRateLimitCleanup();
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 5000);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

export default app;
export { selectRail } from './shared/paystack-rail.js';
export { queueOrderForPayout, releasePayoutLog, buildMoRStatus } from './services/commerce-store.js';
export { validateAdminAuth } from './middleware/adminAuth.js';
export type { PayoutLogBackend, MerchantOrderBackend, MoRStatusResponse } from './services/commerce-store.js';
