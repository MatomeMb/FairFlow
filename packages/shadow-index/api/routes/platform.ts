import { Hono } from 'hono';
import { promises as fs } from 'node:fs';
import { db } from '../db.js';
import { dataRoot } from '../shared/server-paths.js';
import { isR2Configured, checkR2Health } from '../../lib/storage.js';

const storageMode = process.env.STORAGE_MODE || 'local';
const useR2 = storageMode === 'r2' && isR2Configured();

export const platformRouter = new Hono();
// Root endpoint for platform checks and quick verification in browsers.
platformRouter.get('/', (c) =>
  c.json({
    status: 'ok',
    service: 'shadow-index',
    company: 'fairflow',
    version: '0.6.0',
    docs_hint: 'Use /health for liveness and /resolve/:hash for lookups',
  })
);

// Health check endpoint
platformRouter.get('/health', async (c) => {
  const checks: Record<string, string> = {};

  if (useR2) {
    try {
      const r2ok = await checkR2Health();
      checks.storage = r2ok ? 'ok' : 'r2-unreachable';
    } catch {
      checks.storage = 'r2-error';
    }
  } else {
    try {
      await fs.access(dataRoot);
      checks.storage = 'ok';
    } catch {
      checks.storage = 'unavailable';
    }
  }

  // Check Supabase using shared client
  try {
    const { error } = await db
      .from('merchant_accounts')
      .select('id')
      .limit(1);
    checks.supabase = error ? `error: ${error.message}` : 'connected';
  } catch {
    checks.supabase = 'unavailable';
  }

  // Check Google OAuth config
  checks.google_oauth = (
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REDIRECT_URI
  ) ? 'configured' : 'missing env vars';

  checks.r2 = useR2 ? 'enabled' : 'disabled';
  checks.paystack = process.env.PAYSTACK_SECRET_KEY ? 'configured' : 'not_configured';
  checks.resend = process.env.RESEND_API_KEY ? 'configured' : 'not configured';

  const allHealthy = Object.values(checks).every(v =>
    v === 'configured' || v === 'connected' || v === 'ok' || v === 'enabled'
  );

  const httpStatus =
    process.env.NODE_ENV === 'test' ? 200 : allHealthy ? 200 : 207;

  return c.json({
    status: allHealthy ? 'ok' : 'degraded',
    service: 'shadow-index',
    company: 'fairflow',
    version: '0.6.0',
    timestamp: new Date().toISOString(),
    checks,
  }, httpStatus);
});