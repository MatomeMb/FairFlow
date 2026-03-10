/**
 * Shadow Index API
 * 
 * Fast hash-to-artifact resolution service
 * Deployed on Vercel Edge Functions
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import crypto from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
// @ts-expect-error - Paystack SDK has no types
import Paystack from '@paystack/paystack-sdk';
import { isR2Configured, uploadThing, getThing } from '../lib/storage.js';
import { getReport, validateDateRange } from '../lib/analytics-report.js';
import { recordQuery, startQuery, endQuery } from '../lib/dashboard-metrics.js';
import { getCached, setCached, invalidateCache, buildCacheKey } from '../lib/query-cache.js';
import { logError } from '../lib/error-logger.js';
import { logger } from '../lib/logger.js';
import { dashboardHandler } from './dashboard.js';
import { RetentionPolicy } from '../lib/retention-policy.js';
import { isApiKeyValid } from '../lib/api-key-registry.js';
import {
  merchantProductsRouter,
  readProducts,
  writeProducts,
  type MerchantProduct,
} from './merchant-products.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const loadEnvFromFile = async (filePath: string) => {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (!match) continue;
      const [, key, rawValue] = match;
      const cleaned = rawValue.replace(/^['"]|['"]$/g, '').trim();
      if (process.env[key] === undefined) {
        process.env[key] = cleaned;
      }
    }
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code !== 'ENOENT') throw error;
  }
};

const loadEnvForShadowIndex = async () => {
  const packageRoot = path.join(__dirname, '..');
  await loadEnvFromFile(path.join(packageRoot, '.env'));
  await loadEnvFromFile(path.join(packageRoot, '.env.local'));
};

await loadEnvForShadowIndex();

if (process.env.NODE_ENV === 'test') {
  delete process.env.SHADOW_INDEX_API_KEY;
  delete process.env.SHADOW_INDEX_API_KEYS;
}

// Initialize Paystack
const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY || '');

/** Paystack routing stub — ready for Peach Payments later when selectRail() chooses provider. */
export function selectRail(): 'paystack' {
  return 'paystack';
}

const app = new Hono();

// Allow extension/page on different origin (e.g. localhost:5177) to call API
app.use('*', cors());

/** Optional API key (MVP-09). If set, require x-api-key or Authorization: Bearer <key>. Supports revocation via SHADOW_INDEX_REVOKED_KEYS. */
app.use('*', async (c, next) => {
  const requestPath = c.req.path;
  const isPublicAuthRoute = requestPath === '/v1/auth/google'
    || requestPath === '/v1/auth/google/callback'
    || requestPath === '/v1/auth/merchant/register'
    || requestPath === '/v1/auth/merchant/login'
    || requestPath === '/v1/auth/merchant/forgot-password'
    || requestPath === '/v1/auth/merchant/me';
  if (isPublicAuthRoute) {
    return next();
  }

  if (requestPath === '/catalog/public') {
    return next();
  }

  if (requestPath === '/health' || requestPath === '/v1/analytics/dashboard') {
    return next();
  }

  if (requestPath === '/v1/admin/payouts/release' 
    || requestPath === '/v1/admin/mor-status' 
    || requestPath === '/v1/admin/payouts/backfill'
    || requestPath === '/v1/admin/cron/release-escrow'
    || requestPath === '/v1/admin/kyc/pending'
    || requestPath.startsWith('/v1/admin/kyc/approve/')
    || requestPath.startsWith('/v1/admin/kyc/reject/')) {
    return next();
  }

  if (requestPath === '/webhooks/stripe' || requestPath === '/webhooks/paystack') {
    return next();
  }

  // Allow public access to product detail pages (/thing/:hash.json)
  if (requestPath.match(/^\/thing\/.+\.json$/)) {
    return next();
  }

  // Allow public access to product resolution endpoint used by consumer product pages
  if (requestPath.startsWith('/resolve/')) {
    return next();
  }

  // Allow public access to checkout endpoints
  if (requestPath.startsWith('/checkout/')) {
    return next();
  }

  // Allow public access to order confirmation
  if (requestPath.startsWith('/orders/')) {
    return next();
  }

  // Allow public access to uploaded product images
  if (requestPath.startsWith('/uploads/')) {
    return next();
  }

  if (requestPath.startsWith('/v1/slips/')) {
    return next();
  }

  if (requestPath.match(/^\/v1\/orders\/[^/]+\/confirm-receipt$/) && c.req.method === 'POST') {
    return next();
  }

  const isMerchantRoute = requestPath.startsWith('/v1/merchant/');
  const isMerchantAnalyticsRoute = requestPath.startsWith('/v1/analytics/report');
  
  // Development mode: allow merchant routes without auth when in dev OAuth mode
  const isDev = process.env.GOOGLE_OAUTH_MODE === 'dev';
  if ((isMerchantRoute || isMerchantAnalyticsRoute) && isDev) {
    console.log('[DEV MODE] Allowing merchant route without token:', requestPath);
    return next();
  }
  
  if (isMerchantRoute || isMerchantAnalyticsRoute) {
    const auth = c.req.header('Authorization');
    const bearer = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
    if (bearer) {
      const payload = verifyJwt(bearer, jwtSecret);
      if (payload?.typ === 'merchant_auth') {
        return next();
      }
    }
  }

  const hasKeys = process.env.SHADOW_INDEX_API_KEY || process.env.SHADOW_INDEX_API_KEYS;
  if (!hasKeys) {
    return next();
  }
  const headerKey = c.req.header('x-api-key');
  const auth = c.req.header('Authorization');
  const bearer = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  const key = headerKey ?? bearer;
  if (!isApiKeyValid(key)) {
    return c.json(err('unauthorized', 'Invalid or missing API key'), 401);
  }
  return next();
});

/** Rate limit (MVP-09). Configurable via RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX. Default 100 req/min per IP. */
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '60000', 10) || 60_000;
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX ?? '100', 10) || 100;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function getClientId(c: { req: { header: (n: string) => string | undefined } }): string {
  const forwarded = c.req.header('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return c.req.header('x-real-ip') ?? 'unknown';
}
app.use('*', async (c, next) => {
  const id = getClientId(c);
  const now = Date.now();
  let entry = rateLimitMap.get(id);
  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
    rateLimitMap.set(id, entry);
  }
  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX) {
    return c.json(err('rate_limit_exceeded', 'Too many requests; try again later'), 429);
  }
  return next();
});

const dataRoot = process.env.VERCEL
  ? path.join('/tmp', 'data')
  : path.join(__dirname, '..', 'data');
const thingsDir = path.join(dataRoot, 'things');
const indexFile = path.join(dataRoot, 'index.json');
const uploadsDir = path.join(dataRoot, 'uploads');

/** Events dir: override via ANALYTICS_EVENTS_DIR for tests */
function getEventsDir(): string {
  return process.env.ANALYTICS_EVENTS_DIR || path.join(dataRoot, 'events');
}

const storageMode = process.env.STORAGE_MODE || 'local';
const useR2 = storageMode === 'r2' && isR2Configured();

const productSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  price: z.number().int().nonnegative(),
  currency: z.string().min(3).max(3),
  image_url: z.string().url().optional(),
  checkout_url: z.string().url().optional(),
});

type ProductInput = z.infer<typeof productSchema>;

const viewEventSchema = z.object({
  event: z.literal('view'),
  hash: z.string().regex(/^[a-f0-9]{64}$/),
  timestamp: z.string().datetime().optional(),
  source_url: z.string().url(),
  anon_id: z.string().optional(),
});

const clickEventSchema = z.object({
  event: z.literal('click'),
  hash: z.string().regex(/^[a-f0-9]{64}$/),
  timestamp: z.string().datetime().optional(),
  source_url: z.string().url(),
  target_action: z.enum(['checkout_initiated', 'image_expanded', 'external_link']),
  anon_id: z.string().optional(),
});

const analyticsEventSchema = z.discriminatedUnion('event', [viewEventSchema, clickEventSchema]);

type StoredThing = {
  hash: string;
  matter_uri: string;
  thing_url: string;
  thing_path: string;
  thing_file?: { hash: string; [key: string]: unknown };
  image_url?: string;
  checkout_url?: string;
  gist: {
    title: string;
    price: number;
    currency: string;
    image_url?: string;
  };
  created_at: string;
};

type IndexStore = Record<string, StoredThing>;

const ensureDataDirs = async () => {
  await fs.mkdir(thingsDir, { recursive: true });
  await fs.mkdir(uploadsDir, { recursive: true });
};

const loadIndex = async (): Promise<IndexStore> => {
  try {
    const raw = await fs.readFile(indexFile, 'utf8');
    return JSON.parse(raw) as IndexStore;
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === 'ENOENT') return {};
    if (error instanceof SyntaxError) {
      logger.warn('data/index.json is malformed — resetting to empty store');
      await fs.writeFile(indexFile, '{}', 'utf8').catch(() => {});
      return {};
    }
    throw error;
  }
};

const saveIndex = async (index: IndexStore) => {
  await fs.mkdir(dataRoot, { recursive: true });
  await fs.writeFile(indexFile, JSON.stringify(index, null, 2), 'utf8');
};

const stableStringify = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
      a.localeCompare(b)
    );
    return `{${entries
      .map(([key, val]) => `${JSON.stringify(key)}:${stableStringify(val)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
};

const hashProduct = (product: Record<string, unknown>): string => {
  const payload = stableStringify(product);
  return crypto.createHash('sha256').update(payload).digest('hex');
};

const buildMatterUri = (hash: string) => `matter://${hash}`;

/** Configurable batch size cap (Sprint 4 — MVP-11). Default 100. */
const BATCH_MAX_SIZE = Math.min(
  Math.max(1, parseInt(process.env.BATCH_MAX_SIZE ?? '100', 10) || 100),
  500
);

/** Consistent error response shape for MVP flows (MVP-10) */
type ErrorPayload = { code: string; message: string; details?: unknown };
const err = (code: string, message: string, details?: unknown): ErrorPayload =>
  details !== undefined ? { code, message, details } : { code, message };

type MerchantAccount = {
  id: string;
  business_name: string;
  email: string;
  password_hash?: string;
  auth_provider?: 'password' | 'google';
  kyc_status?: 'not_started' | 'pending' | 'approved' | 'rejected';
  commission_rate?: number;
  payout_frequency?: 'weekly' | 'monthly';
  payout_minimum?: number;
  total_earnings?: number;
  pending_payout?: number;
  kyc_data?: {
    id_number: string;
    date_of_birth: string;
    address: string;
    phone: string;
  };
  bank_account?: {
    account_holder_name: string;
    bank_name: string;
    branch_code: string;
    account_type: 'cheque' | 'savings' | 'transmission';
    account_number: string;
  };
  reset_token?: string;
  reset_expires_at?: string;
  created_at?: string;
  updated_at?: string;
};

const merchantAccountsFile = path.join(dataRoot, 'merchant_accounts.json');
const ordersFile = path.join(dataRoot, 'orders.json');
const notificationsFile = path.join(dataRoot, 'notifications.json');
const payoutLogsFile = path.join(dataRoot, 'payout_logs.json');
const slipsDir = path.join(dataRoot, 'slips');
const authPortalBaseUrl = process.env.AUTH_PORTAL_BASE_URL ?? 'http://localhost:5178';
const publicApiBase = process.env.PUBLIC_API_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
const jwtSecret = process.env.JWT_SECRET ?? process.env.SHADOW_INDEX_API_KEY ?? 'dev-jwt-secret-change-me';

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

const base64UrlEncode = (input: Buffer | string): string => {
  const source = typeof input === 'string' ? Buffer.from(input, 'utf8') : input;
  return source.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
};

const base64UrlDecode = (input: string): Buffer => {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + padding, 'base64');
};

const hmacSha256 = (value: string, secret: string): string =>
  base64UrlEncode(crypto.createHmac('sha256', secret).update(value).digest());

const signJwt = (payload: Record<string, unknown>, secret: string): string => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${headerB64}.${payloadB64}`;
  const signature = hmacSha256(signingInput, secret);
  return `${signingInput}.${signature}`;
};

const verifyJwt = (token: string, secret: string): Record<string, unknown> | null => {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, signatureB64] = parts;
  const signingInput = `${headerB64}.${payloadB64}`;
  const expected = hmacSha256(signingInput, secret);

  const providedBuf = Buffer.from(signatureB64, 'utf8');
  const expectedBuf = Buffer.from(expected, 'utf8');
  if (providedBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(providedBuf, expectedBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(payloadB64).toString('utf8')) as Record<string, unknown>;
    const exp = payload.exp;
    if (typeof exp === 'number' && Date.now() >= exp * 1000) return null;
    return payload;
  } catch {
    return null;
  }
};

const hashPassword = (password: string): string => {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.pbkdf2Sync(password, salt, 100_000, 32, 'sha256').toString('hex');
  return `${salt}:${derived}`;
};

const verifyPassword = (password: string, storedHash?: string): boolean => {
  if (!storedHash) return false;
  const [salt, expected] = storedHash.split(':');
  if (!salt || !expected) return false;
  const derived = crypto.pbkdf2Sync(password, salt, 100_000, 32, 'sha256').toString('hex');
  const providedBuf = Buffer.from(derived, 'utf8');
  const expectedBuf = Buffer.from(expected, 'utf8');
  return providedBuf.length === expectedBuf.length && crypto.timingSafeEqual(providedBuf, expectedBuf);
};

const normalizeMerchantAccounts = (value: unknown): MerchantAccount[] => {
  if (Array.isArray(value)) return value as MerchantAccount[];
  if (value && typeof value === 'object') return [value as MerchantAccount];
  return [];
};

const loadMerchantAccounts = async (): Promise<MerchantAccount[]> => {
  try {
    const raw = await fs.readFile(merchantAccountsFile, 'utf8');
    const parsed = JSON.parse(raw) as unknown;
    return normalizeMerchantAccounts(parsed);
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === 'ENOENT') return [];
    throw error;
  }
};

const saveMerchantAccounts = async (accounts: MerchantAccount[]) => {
  await fs.mkdir(dataRoot, { recursive: true });
  await fs.writeFile(merchantAccountsFile, JSON.stringify(accounts, null, 2), 'utf8');
};

const readJsonFile = async <T>(filePath: string, fallback: T): Promise<T> => {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === 'ENOENT') return fallback;
    throw error;
  }
};

const writeJsonFile = async (filePath: string, value: unknown): Promise<void> => {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), 'utf8');
};

type DeliveryAddress = {
  name?: string;
  line1?: string;
  line2?: string;
  suburb?: string;
  city?: string;
  postal_code?: string;
  phone?: string;
};

type MerchantOrder = {
  id: string;
  paystack_reference?: string;
  session_id?: string;
  product_id?: string;
  product_hash?: string;
  product_title?: string;
  merchant_id?: string;
  merchant_price_cents?: number;
  consumer_price_cents?: number;
  platform_revenue_cents?: number;
  amount?: number;
  currency?: string;
  customer?: { email: string; delivery_address?: DeliveryAddress };
  customer_email?: string;
  delivery_address?: DeliveryAddress;
  status?: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_status?: 'held' | 'shipped' | 'confirmed' | 'released' | 'disputed';
  fulfillment_status?: 'pending' | 'shipped' | 'fulfilled' | 'delivered';
  shipment_slip_url?: string | null;
  confirm_token?: string;
  held_at?: string;
  shipped_at?: string | null;
  customer_confirmed_at?: string | null;
  released_at?: string | null;
  rail_used?: 'paystack';
  billing_address?: Record<string, unknown> | null;
  created_at?: string;
  paid_at?: string | null;
  fulfilled_at?: string | null;
  updated_at?: string;
  payout_log_id?: string;
  [key: string]: unknown;
};

type MerchantNotification = {
  id: string;
  merchant_id?: string;
  type?: 'order' | 'payout' | 'kyc' | 'system';
  title?: string;
  message?: string;
  read?: boolean;
  created_at?: string;
  [key: string]: unknown;
};

type PayoutLog = {
  id: string;
  merchant_id?: string;
  orders_included?: string[];
  gross_amount?: number;
  commission_amount?: number;
  net_amount?: number;
  currency?: string;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  transfer_reference?: string | null;
  failure_reason?: string | null;
  initiated_by?: string;
  created_at?: string;
  transferred_at?: string | null;
  [key: string]: unknown;
};

interface MerchantOrderBackend extends MerchantOrder {}

interface PayoutLogBackend extends PayoutLog {}

interface MoRStatusResponse {
  platform_intake: {
    total_orders: number;
    paid_orders: number;
    fulfilled_orders: number;
    paid_and_fulfilled: number;
    unqueued_paid_fulfilled: number;
  };
  payout_routing: {
    total_payout_logs: number;
    pending_payouts: number;
    completed_payouts: number;
    failed_payouts: number;
    total_net_pending_cents: number;
    total_net_released_cents: number;
  };
  routing_health: 'healthy' | 'gap_detected' | 'no_data';
  gap_order_ids: string[];
  generated_at: string;
}

const loadOrders = async (): Promise<MerchantOrder[]> => {
  const parsed = await readJsonFile<Record<string, MerchantOrder> | MerchantOrder[]>(ordersFile, {});
  if (Array.isArray(parsed)) return parsed;
  return Object.values(parsed ?? {});
};

const saveOrders = async (orders: MerchantOrder[]): Promise<void> => {
  const keyed: Record<string, MerchantOrder> = {};
  for (const order of orders) {
    if (order.id) keyed[order.id] = order;
  }
  await writeJsonFile(ordersFile, keyed);
};

const loadNotifications = async (): Promise<MerchantNotification[]> =>
  readJsonFile<MerchantNotification[]>(notificationsFile, []);

const saveNotifications = async (items: MerchantNotification[]): Promise<void> => {
  await writeJsonFile(notificationsFile, items);
};

const loadPayoutLogs = async (): Promise<PayoutLog[]> =>
  readJsonFile<PayoutLog[]>(payoutLogsFile, []);

const savePayoutLogs = async (logs: PayoutLog[]): Promise<void> => {
  await writeJsonFile(payoutLogsFile, logs);
};

async function loadAllOrders(): Promise<MerchantOrderBackend[]> {
  return loadOrders();
}

async function saveAllOrders(orders: MerchantOrderBackend[]): Promise<void> {
  await saveOrders(orders);
}

/**
 * Queue an eligible order for payout exactly once.
 * Idempotency guarantee: if an order is already present in any payout log `orders_included`,
 * this returns the existing payout log and does not create a duplicate.
 */
async function queueOrderForPayout(orderId: string): Promise<PayoutLog | null> {
  const orders = await loadOrders();
  const order = orders.find((candidate) => candidate.id === orderId);
  if (!order) {
    throw new Error(`Order not found: ${orderId}`);
  }

  const orderStatus = order.status ?? 'unknown';
  const fulfillmentStatus = order.fulfillment_status ?? 'unknown';
  if (orderStatus !== 'paid' || fulfillmentStatus !== 'fulfilled') {
    logger.info('Order not eligible for payout', { orderId, orderStatus, fulfillmentStatus });
    return null;
  }

  const existingLogs = await loadPayoutLogs();
  const existing = existingLogs.find((log) => Array.isArray(log.orders_included) && log.orders_included.includes(orderId));
  if (existing) {
    logger.info('Order already queued — skipping', { orderId, payoutId: existing.id });
    return existing;
  }

  const grossAmount = typeof order.amount === 'number' ? order.amount : 0;
  const commissionRate = parseFloat(process.env.PLATFORM_COMMISSION_RATE ?? '0.06');
  const commissionAmount = Math.round(grossAmount * commissionRate);
  const netAmount = grossAmount - commissionAmount;

  const payoutLog: PayoutLog = {
    id: crypto.randomUUID(),
    merchant_id: order.merchant_id,
    orders_included: [orderId],
    gross_amount: grossAmount,
    commission_amount: commissionAmount,
    net_amount: netAmount,
    currency: order.currency ?? 'ZAR',
    status: 'pending',
    transfer_reference: null,
    failure_reason: null,
    initiated_by: 'auto_fulfillment_trigger',
    created_at: new Date().toISOString(),
    transferred_at: null,
  };

  const updatedLogs = [...existingLogs, payoutLog];
  await savePayoutLogs(updatedLogs);

  order.payout_status = 'pending_release';
  order.payout_log_id = payoutLog.id;
  order.updated_at = new Date().toISOString();
  await saveOrders(orders);

  logger.info('Payout queued', {
    orderId,
    payoutLogId: payoutLog.id,
    amount: payoutLog.net_amount,
    merchant_id: payoutLog.merchant_id,
  });

  return payoutLog;
}

/**
 * Release held funds to merchant (escrow release). Called when customer confirms receipt.
 * TODO: Paystack subaccount creation not built yet — merchants don't have KYC. Payouts processed manually.
 */
async function releaseToMerchant(order: MerchantOrder): Promise<void> {
  const merchantPriceCents = order.merchant_price_cents ?? order.amount ?? 0;
  const consumerPriceCents = order.consumer_price_cents ?? order.amount ?? 0;
  const platformRevenueCents = order.platform_revenue_cents ?? (consumerPriceCents - merchantPriceCents);

  const now = new Date().toISOString();

  const payoutLog: PayoutLog = {
    id: crypto.randomUUID(),
    merchant_id: order.merchant_id,
    orders_included: [order.id],
    gross_amount: consumerPriceCents,
    commission_amount: platformRevenueCents,
    net_amount: merchantPriceCents,
    currency: order.currency ?? 'ZAR',
    status: 'pending',
    transfer_reference: null,
    failure_reason: null,
    initiated_by: 'customer_confirm_receipt',
    created_at: now,
    transferred_at: null,
  };

  const logs = await loadPayoutLogs();
  logs.push(payoutLog);
  await savePayoutLogs(logs);

  order.payment_status = 'released';
  order.released_at = now;
  order.payout_log_id = payoutLog.id;
  order.updated_at = now;

  const orders = await loadOrders();
  const idx = orders.findIndex((o) => o.id === order.id);
  if (idx >= 0) orders[idx] = order;
  await saveOrders(orders);

  const notifs = await loadNotifications();
  notifs.push({
    id: crypto.randomUUID(),
    merchant_id: order.merchant_id,
    type: 'payout',
    title: 'Payment released',
    message: `Payment of R${(merchantPriceCents / 100).toFixed(2)} released for order #${order.id.slice(0, 8)}`,
    read: false,
    created_at: now,
  });
  await saveNotifications(notifs);

  // TODO: Call Paystack Transfer API when subaccounts are set up
  logger.info('Released to merchant', { orderId: order.id, merchantPriceCents, merchant_id: order.merchant_id });
}

/**
 * Move one pending payout log to completed and mark linked orders as released.
 * Idempotency guarantee: refuses non-pending payout logs and does not mutate twice.
 */
async function releasePayoutLog(payoutLogId: string, initiatedBy: string): Promise<PayoutLogBackend> {
  const payoutLogs = await loadPayoutLogs();
  const target = payoutLogs.find((item) => item.id === payoutLogId);
  if (!target) {
    throw new Error(`releasePayoutLog: Payout log not found: ${payoutLogId}`);
  }

  if (target.status !== 'pending') {
    const error = Object.assign(
      new Error(`releasePayoutLog: Payout already processed (status: ${target.status})`),
      { currentStatus: target.status }
    );
    throw error;
  }

  const transferReference = `MANUAL-${Date.now()}-${payoutLogId.slice(0, 8).toUpperCase()}`;
  target.status = 'completed';
  target.transfer_reference = transferReference;
  target.transferred_at = new Date().toISOString();
  target.initiated_by = initiatedBy;
  await savePayoutLogs(payoutLogs);

  const includedOrderIds = Array.isArray(target.orders_included) ? target.orders_included : [];
  const orders = await loadAllOrders();
  const updatedOrders = orders.map((order) => {
    if (!includedOrderIds.includes(order.id)) return order;
    return {
      ...order,
      payout_status: 'released' as const,
      payout_log_id: target.id,
      updated_at: new Date().toISOString(),
    };
  });
  await saveAllOrders(updatedOrders);

  logger.info('Payout released', {
    payoutLogId,
    merchant_id: target.merchant_id,
    amount: target.net_amount,
    initiated_by: initiatedBy,
  });

  return target;
}

/**
 * Compute Merchant-of-Record routing health snapshot.
 * Idempotency guarantee: read-only function with no side effects.
 */
async function buildMoRStatus(): Promise<MoRStatusResponse> {
  const [orders, payoutLogs] = await Promise.all([loadAllOrders(), loadPayoutLogs()]);

  const paidOrders = orders.filter((order) => order.status === 'paid');
  const fulfilledOrders = orders.filter((order) => order.fulfillment_status === 'fulfilled');
  const paidAndFulfilled = orders.filter((order) => order.status === 'paid' && order.fulfillment_status === 'fulfilled');

  const queuedOrderIds = new Set<string>();
  for (const log of payoutLogs) {
    if (Array.isArray(log.orders_included)) {
      for (const orderId of log.orders_included) {
        queuedOrderIds.add(orderId);
      }
    }
  }

  const gapOrders = paidAndFulfilled.filter((order) => !queuedOrderIds.has(order.id));
  const pendingPayouts = payoutLogs.filter((log) => log.status === 'pending');
  const completedPayouts = payoutLogs.filter((log) => log.status === 'completed');
  const failedPayouts = payoutLogs.filter((log) => log.status === 'failed');

  const totalNetPending = pendingPayouts.reduce((sum, log) => sum + (typeof log.net_amount === 'number' ? log.net_amount : 0), 0);
  const totalNetReleased = completedPayouts.reduce((sum, log) => sum + (typeof log.net_amount === 'number' ? log.net_amount : 0), 0);

  const routingHealth: MoRStatusResponse['routing_health'] =
    orders.length === 0 && payoutLogs.length === 0
      ? 'no_data'
      : gapOrders.length > 0
        ? 'gap_detected'
        : 'healthy';

  return {
    platform_intake: {
      total_orders: orders.length,
      paid_orders: paidOrders.length,
      fulfilled_orders: fulfilledOrders.length,
      paid_and_fulfilled: paidAndFulfilled.length,
      unqueued_paid_fulfilled: gapOrders.length,
    },
    payout_routing: {
      total_payout_logs: payoutLogs.length,
      pending_payouts: pendingPayouts.length,
      completed_payouts: completedPayouts.length,
      failed_payouts: failedPayouts.length,
      total_net_pending_cents: totalNetPending,
      total_net_released_cents: totalNetReleased,
    },
    routing_health: routingHealth,
    gap_order_ids: gapOrders.map((order) => order.id),
    generated_at: new Date().toISOString(),
  };
}

function validateAdminAuth(authHeader: string | undefined): boolean {
  const configuredSecret = process.env.ADMIN_SECRET_KEY;
  if (!configuredSecret || !authHeader) return false;
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  return token === configuredSecret;
}

const sanitizeMerchantAccount = (account: MerchantAccount) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password_hash: _ph, reset_token: _rt, reset_expires_at: _re, ...safe } = account;
  // Mask bank account number
  if (safe.bank_account?.account_number) {
    const masked = safe.bank_account.account_number.slice(-4).padStart(safe.bank_account.account_number.length, '*');
    safe.bank_account = { ...safe.bank_account, account_number: masked };
  }
  return safe;
};

const issueMerchantToken = (account: MerchantAccount): string => {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const payload = {
    sub: account.id,
    email: account.email,
    role: 'merchant',
    typ: 'merchant_auth',
    iat: nowSeconds,
    exp: nowSeconds + 60 * 60 * 24 * 7,
  };
  return signJwt(payload, jwtSecret);
};

const normalizePortalBaseUrl = (baseUrl: string): string =>
  baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

const inferPortalBaseUrl = (c: { req: { header: (name: string) => string | undefined } }): string => {
  const explicit = c.req.header('x-auth-portal-base-url');
  if (explicit) {
    try {
      const parsed = new URL(explicit);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.origin;
      }
    } catch {
      // ignore invalid override
    }
  }

  const referer = c.req.header('referer');
  if (referer) {
    try {
      const parsed = new URL(referer);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.origin;
      }
    } catch {
      // ignore invalid referer
    }
  }

  return authPortalBaseUrl;
};

const buildPortalUrl = (pathName: string, params?: Record<string, string>, portalBaseUrl?: string): string => {
  const baseUrl = normalizePortalBaseUrl(portalBaseUrl ?? authPortalBaseUrl);
  const target = new URL(pathName, baseUrl);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      target.searchParams.set(key, value);
    }
  }
  return target.toString();
};

const extractBearerToken = (authHeader: string | undefined): string | null => {
  if (!authHeader) return null;
  if (!authHeader.startsWith('Bearer ')) return null;
  return authHeader.slice(7).trim() || null;
};

const getGoogleOAuthConfig = () => {
  const mode = process.env.GOOGLE_OAUTH_MODE;
  
  // Development mode: allow testing without real Google credentials
  if (mode === 'dev') {
    return {
      clientId: 'dev-client-id',
      clientSecret: 'dev-client-secret',
      redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/v1/auth/google/callback',
      isDev: true,
    };
  }
  
  // Production mode: require real credentials
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) return null;
  return { clientId, clientSecret, redirectUri, isDev: false };
};

const exchangeGoogleCode = async (
  code: string,
  config: { clientId: string; clientSecret: string; redirectUri: string }
): Promise<{ access_token?: string } | null> => {
  const body = new URLSearchParams({
    code,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.redirectUri,
    grant_type: 'authorization_code',
  });

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!response.ok) return null;
  return (await response.json()) as { access_token?: string };
};

const fetchGoogleProfile = async (accessToken: string): Promise<{ email?: string; name?: string } | null> => {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) return null;
  return (await response.json()) as { email?: string; name?: string };
};

const buildGoogleState = (portalBaseUrl: string): string => {
  const nowSeconds = Math.floor(Date.now() / 1000);
  return signJwt(
    {
      typ: 'google_oauth_state',
      nonce: crypto.randomUUID(),
      return_to: portalBaseUrl,
      iat: nowSeconds,
      exp: nowSeconds + 60 * 10,
    },
    jwtSecret
  );
};

const parseGoogleState = (state: string | null): Record<string, unknown> | null => {
  if (!state) return null;
  const payload = verifyJwt(state, jwtSecret);
  if (payload?.typ !== 'google_oauth_state') return null;
  return payload;
};

const getMerchantIdentity = async (c: { req: { header: (name: string) => string | undefined } }): Promise<{
  account: MerchantAccount | null;
  merchantIds: string[];
}> => {
  const token = extractBearerToken(c.req.header('Authorization'));
  if (!token) {
    return { account: null, merchantIds: ['dev-merchant-001', 'default'] };
  }

  const payload = verifyJwt(token, jwtSecret);
  if (!payload || payload.typ !== 'merchant_auth') {
    return { account: null, merchantIds: ['dev-merchant-001', 'default'] };
  }

  const subject = typeof payload.sub === 'string' ? payload.sub : null;
  const email = typeof payload.email === 'string' ? payload.email.toLowerCase() : null;
  const accounts = await loadMerchantAccounts();
  const account = accounts.find((candidate) =>
    (subject && candidate.id === subject) || (email && candidate.email.toLowerCase() === email)
  ) ?? null;

  const merchantIds = ['dev-merchant-001', 'default'];
  if (account?.id) merchantIds.unshift(account.id);
  return { account, merchantIds };
};

/** Parse CSV body to array of product-like objects. Header: title,price,currency,image_url,checkout_url (order flexible). */
function parseCsvToProducts(csvBody: string): {
  products: Array<Record<string, unknown>>;
  rowErrors: Array<{ row: number; message: string }>;
} {
  const rowErrors: Array<{ row: number; message: string }> = [];
  const lines = csvBody.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) {
    return { products: [], rowErrors: lines.length === 0 ? [{ row: 0, message: 'Empty file' }] : [{ row: 1, message: 'No data rows' }] };
  }
  const headerLine = lines[0].toLowerCase();
  const headers = headerLine.split(',').map((h) => h.trim().toLowerCase());
  const titleIdx = headers.indexOf('title');
  const priceIdx = headers.indexOf('price');
  const currencyIdx = headers.indexOf('currency');
  const imageUrlIdx = headers.indexOf('image_url');
  const checkoutUrlIdx = headers.indexOf('checkout_url');
  if (titleIdx === -1 || priceIdx === -1 || currencyIdx === -1) {
    return { products: [], rowErrors: [{ row: 0, message: 'CSV must have header: title, price, currency' }] };
  }
  const products: Array<Record<string, unknown>> = [];
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i];
    const values = row.split(',').map((v) => v.trim());
    const title = values[titleIdx] ?? '';
    const priceRaw = values[priceIdx] ?? '';
    const price = parseInt(priceRaw, 10);
    const currency = (values[currencyIdx] ?? '').toUpperCase().slice(0, 3);
    const image_url = imageUrlIdx >= 0 ? (values[imageUrlIdx] ?? undefined) : undefined;
    const checkout_url = checkoutUrlIdx >= 0 ? (values[checkoutUrlIdx] ?? undefined) : undefined;
    if (!title) {
      rowErrors.push({ row: i + 1, message: 'Missing title' });
      continue;
    }
    if (Number.isNaN(price) || price < 0) {
      rowErrors.push({ row: i + 1, message: `Invalid price: ${priceRaw}` });
      continue;
    }
    if (!currency || currency.length !== 3) {
      rowErrors.push({ row: i + 1, message: `Invalid currency: ${values[currencyIdx] ?? ''}` });
      continue;
    }
    const obj: Record<string, unknown> = { title, price, currency };
    if (image_url) obj.image_url = image_url;
    if (checkout_url) obj.checkout_url = checkout_url;
    products.push(obj);
  }
  return { products, rowErrors };
}

/** Single-product compile and persist. Shared by POST /compile and POST /batch (Sprint 4). */
async function compileAndPersistProduct(product: ProductInput): Promise<{
  hash: string;
  matter_uri: string;
  thing_url: string;
  gist: StoredThing['gist'];
}> {
  await ensureDataDirs();
  const createdAt = new Date().toISOString();
  const hash = hashProduct(product);
  const matterUri = buildMatterUri(hash);
  const thingPayload = { hash, ...product, created_at: createdAt };
  const thingPath = path.join(thingsDir, `${hash}.thing`);

  let thingUrl: string;
  if (useR2) {
    const buffer = Buffer.from(JSON.stringify(thingPayload, null, 2), 'utf8');
    thingUrl = await uploadThing(hash, buffer);
  } else {
    await fs.writeFile(thingPath, JSON.stringify(thingPayload, null, 2), 'utf8');
    const baseUrl = process.env.PUBLIC_API_BASE_URL
      || `http://localhost:${Number(process.env.PORT) || 3000}`;
    thingUrl = `${baseUrl.replace(/\/$/, '')}/thing/${hash}`;
  }

  const index = await loadIndex();
  index[hash] = {
    hash,
    matter_uri: matterUri,
    thing_url: thingUrl,
    thing_path: useR2 ? thingUrl : thingPath,
    image_url: product.image_url,
    checkout_url: product.checkout_url,
    gist: {
      title: product.title,
      price: product.price,
      currency: product.currency,
      image_url: product.image_url,
    },
    created_at: createdAt,
  };
  await saveIndex(index);

  return {
    hash,
    matter_uri: matterUri,
    thing_url: thingUrl,
    gist: index[hash].gist,
  };
}

// Health check endpoint
app.get('/health', async (c) => {
  const checks: Record<string, string> = {};

  try {
    await fs.access(dataRoot);
    checks.storage = 'ok';
  } catch {
    checks.storage = 'unavailable';
  }

  checks.r2 = useR2 ? 'enabled' : 'disabled';
  checks.paystack = process.env.PAYSTACK_SECRET_KEY ? 'configured' : 'not_configured';

  const allOk = checks.storage === 'ok';

  return c.json({
    status: allOk ? 'ok' : 'degraded',
    service: 'shadow-index',
    company: 'fairflow',
    version: '0.6.0',
    timestamp: new Date().toISOString(),
    checks,
  });
});

// Merchant self-serve auth endpoints
app.post('/v1/auth/merchant/register', async (c) => {
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
      token: issueMerchantToken(account),
      account: sanitizeMerchantAccount(account),
    },
    201
  );
});

app.post('/v1/auth/merchant/login', async (c) => {
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
    token: issueMerchantToken(account),
    account: sanitizeMerchantAccount(account),
  });
});

app.get('/v1/auth/merchant/me', async (c) => {
  const token = extractBearerToken(c.req.header('Authorization'));
  if (!token) {
    return c.json(err('unauthorized', 'Missing Bearer token'), 401);
  }

  const payload = verifyJwt(token, jwtSecret);
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

app.post('/v1/auth/merchant/forgot-password', async (c) => {
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

app.get('/v1/auth/google', async (c) => {
  const portalBaseUrl = inferPortalBaseUrl(c);
  const config = getGoogleOAuthConfig();
  if (!config) {
    return c.redirect(buildPortalUrl('/merchant/login', { error: 'google_not_configured' }, portalBaseUrl));
  }

  // Development mode: skip real Google OAuth and create a dev account
  if (config.isDev) {
    const now = new Date().toISOString();
    const devEmail = 'dev-merchant@fairflow.dev';
    const accounts = await loadMerchantAccounts();
    
    let account = accounts.find((candidate) => candidate.email.toLowerCase() === devEmail);
    if (!account) {
      account = {
        id: crypto.randomUUID(),
        business_name: 'Dev Merchant Test',
        email: devEmail,
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
      accounts.push(account);
      await saveMerchantAccounts(accounts);
    } else {
      account.auth_provider = 'google';
      account.updated_at = now;
      await saveMerchantAccounts(accounts);
    }

    const merchantToken = issueMerchantToken(account);
    return c.redirect(buildPortalUrl('/dashboard/merchant', { token: merchantToken }, portalBaseUrl));
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    include_granted_scopes: 'true',
    prompt: 'select_account',
    state: buildGoogleState(portalBaseUrl),
  });

  return c.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

app.get('/v1/auth/google/callback', async (c) => {
  const parsedState = parseGoogleState(c.req.query('state') ?? null);
  const stateReturnTo = parsedState && typeof parsedState.return_to === 'string' ? parsedState.return_to : undefined;
  const portalBaseUrl = stateReturnTo ?? authPortalBaseUrl;

  const errorCode = c.req.query('error');
  if (errorCode) {
    const mapped = errorCode === 'access_denied' ? 'google_cancelled' : 'google_token_failed';
    return c.redirect(buildPortalUrl('/merchant/login', { error: mapped }, portalBaseUrl));
  }

  if (!parsedState) {
    return c.redirect(buildPortalUrl('/merchant/login', { error: 'google_token_failed' }, portalBaseUrl));
  }

  const code = c.req.query('code');
  if (!code) {
    return c.redirect(buildPortalUrl('/merchant/login', { error: 'google_token_failed' }, portalBaseUrl));
  }

  const config = getGoogleOAuthConfig();
  if (!config) {
    return c.redirect(buildPortalUrl('/merchant/login', { error: 'google_not_configured' }, portalBaseUrl));
  }

  const tokenResponse = await exchangeGoogleCode(code, config);
  const accessToken = tokenResponse?.access_token;
  if (!accessToken) {
    return c.redirect(buildPortalUrl('/merchant/login', { error: 'google_token_failed' }, portalBaseUrl));
  }

  const profile = await fetchGoogleProfile(accessToken);
  const profileEmail = profile?.email?.toLowerCase();
  if (!profileEmail) {
    return c.redirect(buildPortalUrl('/merchant/login', { error: 'google_no_email' }, portalBaseUrl));
  }

  const now = new Date().toISOString();
  const accounts = await loadMerchantAccounts();
  let account = accounts.find((candidate) => candidate.email.toLowerCase() === profileEmail);

  if (!account) {
    account = {
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
    accounts.push(account);
  } else {
    account.auth_provider = 'google';
    account.updated_at = now;
  }

  await saveMerchantAccounts(accounts);

  const merchantToken = issueMerchantToken(account);
  return c.redirect(buildPortalUrl('/merchant', { token: merchantToken }, portalBaseUrl));
});

type UploadedImageFile = {
  name: string;
  type: string;
  size: number;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

const isUploadedImageFile = (value: unknown): value is UploadedImageFile => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.name === 'string'
    && typeof candidate.type === 'string'
    && typeof candidate.size === 'number'
    && typeof candidate.arrayBuffer === 'function';
};

const imageMimeByExtension: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
};

const imageExtensionByMime: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
  'image/svg+xml': '.svg',
};

app.post('/v1/merchant/uploads/image', async (c) => {
  const parsedBody = await c.req.parseBody().catch(() => null);
  if (!parsedBody || typeof parsedBody !== 'object') {
    return c.json(err('invalid_upload', 'Expected multipart form data'), 400);
  }

  const body = parsedBody as Record<string, unknown>;
  const rawFile = body.image ?? body.file ?? body.upload;
  const firstRaw = Array.isArray(rawFile) ? rawFile[0] : rawFile;
  if (!isUploadedImageFile(firstRaw)) {
    return c.json(err('invalid_upload', 'Image file is required'), 400);
  }

  const file = firstRaw;
  const mimeType = file.type.toLowerCase();
  if (!mimeType.startsWith('image/')) {
    return c.json(err('invalid_upload', 'Only image files are allowed'), 400);
  }

  const maxBytes = 8 * 1024 * 1024;
  if (file.size <= 0 || file.size > maxBytes) {
    return c.json(err('invalid_upload', 'Image file must be between 1 byte and 8MB'), 400);
  }

  const extFromMime = imageExtensionByMime[mimeType];
  const extFromName = path.extname(file.name || '').toLowerCase();
  const extension = extFromMime || (imageMimeByExtension[extFromName] ? extFromName : '.png');
  const imageBuffer = Buffer.from(await file.arrayBuffer());

  await fs.mkdir(uploadsDir, { recursive: true });
  const fileName = `${Date.now()}-${crypto.randomUUID()}${extension}`;
  const filePath = path.join(uploadsDir, fileName);
  await fs.writeFile(filePath, imageBuffer);

  const baseUrl = process.env.PUBLIC_API_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
  return c.json(
    {
      image_url: `${baseUrl.replace(/\/$/, '')}/uploads/${fileName}`,
      bytes: imageBuffer.length,
    },
    201,
  );
});

app.get('/uploads/:filename', async (c) => {
  const requested = c.req.param('filename');
  if (!/^[A-Za-z0-9._-]+$/.test(requested)) {
    return c.json(err('invalid_request', 'Invalid file name'), 400);
  }

  const safeName = path.basename(requested);
  const filePath = path.join(uploadsDir, safeName);

  try {
    const imageBuffer = await fs.readFile(filePath);
    const ext = path.extname(safeName).toLowerCase();
    c.header('Content-Type', imageMimeByExtension[ext] || 'application/octet-stream');
    c.header('Cache-Control', 'public, max-age=31536000, immutable');
    return c.body(imageBuffer);
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === 'ENOENT') {
      return c.json(err('not_found', 'Uploaded image not found'), 404);
    }
    return c.json(err('internal_error', 'Failed to load uploaded image'), 500);
  }
});

// Merchant dashboard endpoints
app.route('/v1/merchant/products', merchantProductsRouter);

app.post('/v1/merchant/products/:productId/restock', async (c) => {
  const productId = c.req.param('productId');
  const body = await c.req.json().catch(() => ({}));
  const quantityRaw = typeof body === 'object' && body ? (body as { quantity?: unknown }).quantity : undefined;
  const quantity = typeof quantityRaw === 'number' && Number.isFinite(quantityRaw) ? Math.max(1, Math.floor(quantityRaw)) : 10;

  const products = readProducts();
  const target = products.find((product: MerchantProduct) => product.id === productId);
  if (!target) {
    return c.json(err('not_found', 'Product not found'), 404);
  }

  target.stock_count = Math.max(0, (target.stock_count ?? 0) + quantity);
  target.updated_at = new Date().toISOString();
  writeProducts(products);

  return c.json({
    id: target.id,
    stock_count: target.stock_count,
    updated_at: target.updated_at,
  });
});

app.get('/v1/merchant/orders', async (c) => {
  const { merchantIds } = await getMerchantIdentity(c);
  const orders = await loadOrders();
  const products = readProducts();
  const filtered = orders
    .filter((order) => !order.merchant_id || merchantIds.includes(order.merchant_id))
    .map((o) => {
      const product = products.find((p) => p.id === o.product_id || p.thing_file?.hash === o.product_hash);
      return { ...o, product_title: o.product_title ?? product?.title };
    });
  filtered.sort((a, b) => {
    const aCreated = typeof a.created_at === 'string' ? a.created_at : '';
    const bCreated = typeof b.created_at === 'string' ? b.created_at : '';
    return bCreated.localeCompare(aCreated);
  });
  return c.json({ orders: filtered });
});

app.patch('/v1/merchant/orders/:orderId/fulfill', async (c) => {
  const orderId = c.req.param('orderId');
  const orders = await loadOrders();
  const order = orders.find((candidate) => candidate.id === orderId);
  if (!order) {
    return c.json(err('not_found', 'Order not found'), 404);
  }

  const now = new Date().toISOString();
  order.fulfillment_status = 'fulfilled';
  order.fulfilled_at = now;
  order.updated_at = now;
  await saveOrders(orders);

  if (order.status === 'paid') {
    const payoutLog = await queueOrderForPayout(order.id);
    if (payoutLog) {
      logger.info('Order queued for payout', {
        orderId: order.id,
        payoutLogId: payoutLog.id,
        amount: payoutLog.net_amount,
        merchant_id: payoutLog.merchant_id,
      });
    }
  }

  return c.json({ ok: true, order });
});

// POST /v1/merchant/orders/:id/upload-slip - Upload shipment slip (PDF, JPG, PNG, max 5MB)
const SLIP_MAX_BYTES = 5 * 1024 * 1024;
const SLIP_ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
app.post('/v1/merchant/orders/:orderId/upload-slip', async (c) => {
  const orderId = c.req.param('orderId');
  const orders = await loadOrders();
  const order = orders.find((o) => o.id === orderId);
  if (!order) return c.json(err('not_found', 'Order not found'), 404);

  const body = await c.req.parseBody();
  const file = body['file'] ?? body['slip'];
  if (!file || typeof file === 'string') {
    return c.json(err('invalid_request', 'Missing file in multipart form (field: file or slip)'), 400);
  }

  const f = file as File;
  if (f.size > SLIP_MAX_BYTES) {
    return c.json(err('invalid_request', 'File too large (max 5MB)'), 400);
  }
  if (!SLIP_ALLOWED_TYPES.includes(f.type) && !f.name.match(/\.(pdf|jpg|jpeg|png)$/i)) {
    return c.json(err('invalid_request', 'Only PDF, JPG, PNG allowed'), 400);
  }

  const ext = f.name.match(/\.(pdf|jpg|jpeg|png)$/i)?.[1] ?? 'pdf';
  const filename = `${orderId}-${Date.now()}.${ext}`;
  await fs.mkdir(slipsDir, { recursive: true });
  const filePath = path.join(slipsDir, filename);
  const buf = Buffer.from(await f.arrayBuffer());
  await fs.writeFile(filePath, buf);

  const slipUrl = `${publicApiBase.replace(/\/$/, '')}/v1/slips/${filename}`;
  return c.json({ ok: true, slip_url: slipUrl, filename }, 201);
});

// PATCH /v1/merchant/orders/:id/ship - Mark order as shipped (requires shipment_slip_url)
app.patch('/v1/merchant/orders/:orderId/ship', async (c) => {
  const orderId = c.req.param('orderId');
  const body = await c.req.json().catch(() => null) as { shipment_slip_url?: string } | null;
  const slipUrl = body?.shipment_slip_url?.trim();

  if (!slipUrl) {
    return c.json(err('invalid_request', 'shipment_slip_url is required'), 400);
  }
  try {
    new URL(slipUrl);
  } catch {
    return c.json(err('invalid_request', 'shipment_slip_url must be a valid URL'), 400);
  }

  const orders = await loadOrders();
  const order = orders.find((o) => o.id === orderId);
  if (!order) return c.json(err('not_found', 'Order not found'), 404);

  const confirmToken = crypto.randomBytes(24).toString('hex');
  const now = new Date().toISOString();
  order.fulfillment_status = 'shipped';
  order.shipped_at = now;
  order.shipment_slip_url = slipUrl;
  order.confirm_token = confirmToken;
  order.payment_status = order.payment_status === 'held' ? 'held' : order.payment_status;
  order.updated_at = now;
  await saveOrders(orders);

  // TODO: Send customer email "Your order has been shipped. Click here to confirm when it arrives: [link]"
  const confirmUrl = `${authPortalBaseUrl}/order/${orderId}/confirm?token=${confirmToken}`;
  logger.info('Order marked shipped', { orderId, confirmUrl });

  return c.json({ ok: true, order });
});

// POST /v1/orders/:id/confirm-receipt - Customer confirms receipt (releases funds to merchant)
app.post('/v1/orders/:orderId/confirm-receipt', async (c) => {
  const orderId = c.req.param('orderId');
  const orders = await loadOrders();
  const order = orders.find((o) => o.id === orderId);
  if (!order) return c.json(err('not_found', 'Order not found'), 404);

  if (order.fulfillment_status !== 'shipped' && order.fulfillment_status !== 'fulfilled') {
    return c.json(err('invalid_request', 'Order has not been shipped yet'), 400);
  }
  if (!order.shipment_slip_url) {
    return c.json(err('invalid_request', 'Merchant has not confirmed shipment yet'), 400);
  }
  if (order.payment_status === 'released') {
    return c.json({ ok: true, message: 'Already confirmed' }, 200);
  }

  const now = new Date().toISOString();
  order.payment_status = 'confirmed';
  order.customer_confirmed_at = now;
  order.updated_at = now;

  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx >= 0) orders[idx] = order;
  await saveOrders(orders);

  await releaseToMerchant(order);

  return c.json({ ok: true, message: 'Thank you! Payment has been released to the merchant.' }, 200);
});

// GET /v1/slips/:filename - Serve uploaded slip (public for now)
app.get('/v1/slips/:filename', async (c) => {
  const filename = c.req.param('filename');
  if (!filename || filename.includes('..')) {
    return c.json(err('invalid_request', 'Invalid filename'), 400);
  }
  const filePath = path.join(slipsDir, filename);
  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filename).toLowerCase();
    const ct = ext === '.pdf' ? 'application/pdf' : ext === '.png' ? 'image/png' : 'image/jpeg';
    return c.body(new Uint8Array(data), 200, { 'Content-Type': ct });
  } catch (e) {
    const nodeErr = e as NodeJS.ErrnoException;
    if (nodeErr.code === 'ENOENT') return c.json(err('not_found', 'Slip not found'), 404);
    throw e;
  }
});

app.post('/v1/admin/payouts/release', async (c) => {
  if (!validateAdminAuth(c.req.header('authorization'))) {
    return c.json({ ok: false, error: 'Forbidden' }, 403);
  }

  const body = await c.req.json().catch(() => null) as { payout_log_id?: string } | null;
  const payoutLogId = body?.payout_log_id;
  if (!payoutLogId) {
    return c.json({ ok: false, error: 'Missing payout_log_id' }, 400);
  }

  try {
    const released = await releasePayoutLog(payoutLogId, 'admin_manual');
    return c.json({ ok: true, payout_log: released });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const currentStatus = (error as { currentStatus?: string }).currentStatus;
    if (message.includes('not found')) {
      return c.json({ ok: false, error: 'Payout log not found' }, 404);
    }
    if (currentStatus) {
      return c.json({ ok: false, error: 'Payout already processed', current_status: currentStatus }, 400);
    }
    logger.error('Payout release failed', { payout_log_id: payoutLogId, error: message });
    return c.json({ ok: false, error: 'Release failed', detail: message }, 500);
  }
});

// POST /v1/admin/payouts/release-to-merchant - Release payout to a specific merchant's bank account
app.post('/v1/admin/payouts/release-to-merchant', async (c) => {
  if (!validateAdminAuth(c.req.header('authorization'))) {
    return c.json({ ok: false, error: 'Forbidden' }, 403);
  }

  const body = await c.req.json().catch(() => null) as { merchant_id?: string; amount_cents?: number } | null;
  if (!body?.merchant_id) {
    return c.json(err('invalid_request', 'Missing merchant_id'), 400);
  }

  try {
    const merchants = await loadMerchantAccounts();
    const merchant = merchants.find((m) => m.id === body.merchant_id);
    
    if (!merchant) {
      return c.json(err('not_found', `Merchant not found: ${body.merchant_id}`), 404);
    }

    if (!merchant.bank_account?.account_number) {
      return c.json(
        err('invalid_request', 'Merchant has no bank account configured'),
        400
      );
    }

    // Calculate pending payout or use provided amount
    const payoutAmount = body.amount_cents ?? (merchant.pending_payout ?? 0);
    
    if (payoutAmount <= 0) {
      return c.json(
        err('invalid_request', 'No pending payout amount to release'),
        400
      );
    }

    // Find pending payouts for this merchant
    const payoutLogs = await loadPayoutLogs();
    const pendingPayouts = payoutLogs.filter(
      (log) => log.merchant_id === body.merchant_id && log.status === 'pending'
    );

    if (pendingPayouts.length === 0) {
      return c.json(
        err('not_found', 'No pending payouts found for merchant'),
        404
      );
    }

    // Release all pending payouts for this merchant
    const released = [];
    for (const payout of pendingPayouts) {
      const updated = await releasePayoutLog(payout.id, 'admin_manual_batch');
      released.push(updated);
    }

    // Update merchant pending_payout balance
    merchant.pending_payout = Math.max(0, (merchant.pending_payout ?? 0) - payoutAmount);
    merchant.updated_at = new Date().toISOString();
    await saveMerchantAccounts(merchants);

    logger.info('Merchant payouts released', {
      merchant_id: body.merchant_id,
      amount: payoutAmount,
      count: released.length,
      bank_name: merchant.bank_account.bank_name,
    });

    return c.json({
      ok: true,
      message: `Released ${released.length} payout(s) to merchant's bank account`,
      merchant: {
        id: merchant.id,
        business_name: merchant.business_name,
        bank_account: {
          account_name: merchant.bank_account.account_holder_name,
          bank_name: merchant.bank_account.bank_name,
          account_number: merchant.bank_account.account_number.slice(-4).padStart(merchant.bank_account.account_number.length, '*'),
        },
      },
      payouts_released: released,
      total_amount: payoutAmount,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Merchant payout release failed', { merchant_id: body?.merchant_id, error: message });
    return c.json(err('release_failed', `Release failed: ${message}`), 500);
  }
});

app.get('/v1/admin/mor-status', async (c) => {
  if (!validateAdminAuth(c.req.header('authorization'))) {
    return c.json({ ok: false, error: 'Forbidden' }, 403);
  }

  try {
    const status = await buildMoRStatus();
    return c.json({ ok: true, ...status });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('MoR status check failed', { error: message });
    return c.json({ ok: false, error: 'Status check failed', detail: message }, 500);
  }
});

app.post('/v1/admin/payouts/backfill', async (c) => {
  if (!validateAdminAuth(c.req.header('authorization'))) {
    return c.json({ ok: false, error: 'Forbidden' }, 403);
  }

  try {
    const status = await buildMoRStatus();
    const results: Array<{ orderId: string; result: string; payoutLogId?: string }> = [];

    for (const orderId of status.gap_order_ids) {
      try {
        const payoutLog = await queueOrderForPayout(orderId);
        results.push({ orderId, result: 'queued', payoutLogId: payoutLog?.id });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        results.push({ orderId, result: `error: ${message}` });
      }
    }

    const queued = results.filter((item) => item.result === 'queued').length;
    const errors = results.filter((item) => item.result.startsWith('error:')).length;
    logger.info('Backfill complete', { queued, errors, total: status.gap_order_ids.length });
    return c.json({ ok: true, queued, errors, results });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return c.json({ ok: false, error: 'Backfill failed', detail: message }, 500);
  }
});

app.get('/v1/merchant/account', async (c) => {
  const { account } = await getMerchantIdentity(c);
  if (account) {
    return c.json(sanitizeMerchantAccount(account));
  }

  const accounts = await loadMerchantAccounts();
  const fallback = accounts[0] ?? null;
  if (!fallback) {
    return c.json(err('not_found', 'Merchant account not found'), 404);
  }
  return c.json(sanitizeMerchantAccount(fallback));
});

app.get('/v1/merchant/payouts', async (c) => {
  const { merchantIds } = await getMerchantIdentity(c);
  const payouts = await loadPayoutLogs();
  const filtered = payouts.filter((item) => !item.merchant_id || merchantIds.includes(item.merchant_id));
  filtered.sort((a, b) => {
    const aCreated = typeof a.created_at === 'string' ? a.created_at : '';
    const bCreated = typeof b.created_at === 'string' ? b.created_at : '';
    return bCreated.localeCompare(aCreated);
  });
  return c.json(filtered);
});

app.post('/v1/merchant/kyc/submit', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (body === null || body === undefined || typeof body !== 'object') {
    return c.json(err('invalid_json', 'Request body must be valid JSON'), 400);
  }

  const { account } = await getMerchantIdentity(c);
  const accounts = await loadMerchantAccounts();
  const target = account ?? accounts[0];
  if (!target) {
    return c.json(err('not_found', 'Merchant account not found'), 404);
  }

  const payload = body as {
    business_name?: string;
    id_number?: string;
    date_of_birth?: string;
    residential_address?: string;
    phone?: string;
    bank_account?: {
      account_holder_name?: string;
      bank_name?: string;
      branch_code?: string;
      account_type?: string;
      account_number?: string;
    };
  };

  target.business_name = payload.business_name?.trim() || target.business_name;
  target.kyc_status = 'pending';
  target.kyc_data = {
    id_number: payload.id_number ?? '',
    date_of_birth: payload.date_of_birth ?? '',
    address: payload.residential_address ?? '',
    phone: payload.phone ?? '',
  };
  target.bank_account = {
    account_holder_name: payload.bank_account?.account_holder_name ?? '',
    bank_name: payload.bank_account?.bank_name ?? '',
    branch_code: payload.bank_account?.branch_code ?? '',
    account_type: (payload.bank_account?.account_type as 'cheque' | 'savings' | 'transmission' | undefined) ?? 'cheque',
    account_number: payload.bank_account?.account_number ?? '',
  };
  target.updated_at = new Date().toISOString();

  await saveMerchantAccounts(accounts);
  return c.json({ ok: true, account: sanitizeMerchantAccount(target) });
});

// PATCH /v1/merchant/account/bank - Update bank account details for payouts
app.patch('/v1/merchant/account/bank', async (c) => {
  const { account } = await getMerchantIdentity(c);
  const accounts = await loadMerchantAccounts();
  const target = account ?? accounts[0];
  
  if (!target) {
    return c.json(err('not_found', 'Merchant account not found'), 404);
  }

  const body = await c.req.json().catch(() => null);
  if (body === null || body === undefined || typeof body !== 'object') {
    return c.json(err('invalid_json', 'Request body must be valid JSON'), 400);
  }

  const payload = body as {
    account_name?: string;
    account_number?: string;
    branch_code?: string;
    bank_name?: string;
  };

  // Validate required fields
  if (!payload.account_name || !payload.account_number || !payload.branch_code || !payload.bank_name) {
    return c.json(
      err('invalid_request', 'All bank fields required: account_name, account_number, branch_code, bank_name'),
      400
    );
  }

  // Update bank account
  target.bank_account = {
    account_holder_name: payload.account_name,
    account_number: payload.account_number,
    branch_code: payload.branch_code,
    bank_name: payload.bank_name,
    account_type: 'cheque', // Default  to cheque account
  };
  target.updated_at = new Date().toISOString();

  await saveMerchantAccounts(accounts);
  
  logger.info('Merchant bank account updated', { merchant_id: target.id, bank_name: payload.bank_name });
  
  return c.json({ 
    ok: true, 
    message: 'Bank account updated successfully',
    account: sanitizeMerchantAccount(target) 
  });
});

// ==================== ADMIN KYC MANAGEMENT ====================

// GET /v1/admin/kyc/pending - List all pending KYC submissions
app.get('/v1/admin/kyc/pending', async (c) => {
  if (!validateAdminAuth(c.req.header('authorization'))) {
    return c.json({ ok: false, error: 'Forbidden' }, 403);
  }

  const accounts = await loadMerchantAccounts();
  const pending = accounts
    .filter((account) => account.kyc_status === 'pending')
    .map((account) => ({
      id: account.id,
      business_name: account.business_name,
      email: account.email,
      kyc_status: account.kyc_status,
      submitted_at: account.updated_at,
      kyc_data: account.kyc_data,
      bank_account: account.bank_account ? {
        account_holder_name: account.bank_account.account_holder_name,
        bank_name: account.bank_account.bank_name,
        account_number: account.bank_account.account_number.slice(-4).padStart(account.bank_account.account_number.length, '*'),
        branch_code: account.bank_account.branch_code,
        account_type: account.bank_account.account_type,
      } : null,
    }))
    .sort((a, b) => {
      const aTime = typeof a.submitted_at === 'string' ? new Date(a.submitted_at).getTime() : 0;
      const bTime = typeof b.submitted_at === 'string' ? new Date(b.submitted_at).getTime() : 0;
      return aTime - bTime; // Oldest first
    });

  return c.json({ ok: true, pending, count: pending.length });
});

// PATCH /v1/admin/kyc/approve/:merchantId - Approve KYC submission
app.patch('/v1/admin/kyc/approve/:merchantId', async (c) => {
  if (!validateAdminAuth(c.req.header('authorization'))) {
    return c.json({ ok: false, error: 'Forbidden' }, 403);
  }

  const merchantId = c.req.param('merchantId');
  const body = await c.req.json().catch(() => null) as { notes?: string } | null;
  const approvalNotes = (body?.notes || '').trim();

  if (!merchantId) {
    return c.json(err('invalid_request', 'Missing merchantId'), 400);
  }

  const accounts = await loadMerchantAccounts();
  const merchant = accounts.find((m) => m.id === merchantId);

  if (!merchant) {
    return c.json(err('not_found', `Merchant ${merchantId} not found`), 404);
  }

  if (merchant.kyc_status === 'approved') {
    return c.json(err('invalid_request', 'KYC already approved'), 400);
  }

  if (merchant.kyc_status !== 'pending') {
    return c.json(err('invalid_request', `KYC status is ${merchant.kyc_status}, expected pending`), 400);
  }

  // Validate required KYC data before approval
  if (!merchant.kyc_data?.id_number || !merchant.kyc_data?.date_of_birth || !merchant.kyc_data?.phone) {
    return c.json(err('invalid_request', 'Incomplete KYC data - missing required fields'), 400);
  }

  if (!merchant.bank_account?.account_number || !merchant.bank_account?.account_holder_name) {
    return c.json(err('invalid_request', 'Incomplete bank account - missing required fields'), 400);
  }

  // Approve merchant
  merchant.kyc_status = 'approved';
  merchant.updated_at = new Date().toISOString();
  
  // Store approval metadata
  if (!merchant.kyc_data) {
    merchant.kyc_data = { id_number: '', date_of_birth: '', address: '', phone: '' };
  }

  await saveMerchantAccounts(accounts);
  
  logger.info('Merchant KYC approved', {
    merchant_id: merchantId,
    business_name: merchant.business_name,
    approval_notes: approvalNotes,
  });

  return c.json({
    ok: true,
    message: 'KYC approved successfully',
    merchant: sanitizeMerchantAccount(merchant),
  });
});

// PATCH /v1/admin/kyc/reject/:merchantId - Reject KYC submission
app.patch('/v1/admin/kyc/reject/:merchantId', async (c) => {
  if (!validateAdminAuth(c.req.header('authorization'))) {
    return c.json({ ok: false, error: 'Forbidden' }, 403);
  }

  const merchantId = c.req.param('merchantId');
  const body = await c.req.json().catch(() => null) as { reason?: string } | null;
  const rejectionReason = (body?.reason || '').trim();

  if (!merchantId) {
    return c.json(err('invalid_request', 'Missing merchantId'), 400);
  }

  if (!rejectionReason) {
    return c.json(err('invalid_request', 'Rejection reason is required'), 400);
  }

  const accounts = await loadMerchantAccounts();
  const merchant = accounts.find((m) => m.id === merchantId);

  if (!merchant) {
    return c.json(err('not_found', `Merchant ${merchantId} not found`), 404);
  }

  if (merchant.kyc_status === 'rejected') {
    return c.json(err('invalid_request', 'KYC already rejected'), 400);
  }

  if (merchant.kyc_status !== 'pending') {
    return c.json(err('invalid_request', `KYC status is ${merchant.kyc_status}, expected pending`), 400);
  }

  // Reject merchant
  merchant.kyc_status = 'rejected';
  merchant.updated_at = new Date().toISOString();

  await saveMerchantAccounts(accounts);

  // Notify merchant of rejection
  const notification = {
    id: crypto.randomUUID(),
    merchant_id: merchant.id,
    type: 'kyc' as const,
    title: 'KYC Verification Rejected',
    message: `Your KYC verification was rejected. Reason: ${rejectionReason}. Please resubmit with corrected information.`,
    read: false,
    created_at: new Date().toISOString(),
  };
  const notifications = await loadNotifications();
  notifications.push(notification);
  await saveNotifications(notifications);

  logger.info('Merchant KYC rejected', {
    merchant_id: merchantId,
    business_name: merchant.business_name,
    rejection_reason: rejectionReason,
  });

  return c.json({
    ok: true,
    message: 'KYC rejected. Merchant has been notified.',
    merchant: sanitizeMerchantAccount(merchant),
  });
});

// ==================== END ADMIN KYC MANAGEMENT ====================

app.get('/v1/merchant/notifications', async (c) => {
  const { merchantIds } = await getMerchantIdentity(c);
  const items = await loadNotifications();
  const filtered = items.filter((item) => !item.merchant_id || merchantIds.includes(item.merchant_id));
  filtered.sort((a, b) => {
    const aCreated = typeof a.created_at === 'string' ? a.created_at : '';
    const bCreated = typeof b.created_at === 'string' ? b.created_at : '';
    return bCreated.localeCompare(aCreated);
  });
  return c.json(filtered);
});

app.patch('/v1/merchant/notifications/:notificationId', async (c) => {
  const notificationId = c.req.param('notificationId');
  const notifications = await loadNotifications();
  const target = notifications.find((item) => item.id === notificationId);
  if (!target) {
    return c.json(err('not_found', 'Notification not found'), 404);
  }
  target.read = true;
  await saveNotifications(notifications);
  return c.json({ ok: true, notification: target });
});

// Compile endpoint - transforms product data into .thing file (uses shared compileAndPersistProduct)
app.post('/compile', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (body === null || body === undefined) {
    return c.json(err('invalid_json', 'Request body must be valid JSON'), 400);
  }
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      err('invalid_product', 'Invalid product payload', parsed.error.flatten()),
      400
    );
  }

  const result = await compileAndPersistProduct(parsed.data);
  return c.json({
    ...result,
    image_url: parsed.data.image_url,
    checkout_url: parsed.data.checkout_url,
  });
});

// Resolve hash to artifact URL
app.get('/resolve/:hash', async (c) => {
  const hash = c.req.param('hash');
  const index = await loadIndex();
  const entry = index[hash];
  if (!entry) {
    return c.json(err('not_found', `No artifact found for hash: ${hash}`, { hash }), 404);
  }
  return c.json({
    hash: entry.hash,
    matter_uri: entry.matter_uri,
    thing_url: entry.thing_url,
    image_url: entry.image_url,
    gist: entry.gist,
    checkout_url: entry.checkout_url,
    created_at: entry.created_at,
  });
});

// Get gist (minimal product data) by hash
app.get('/gist/:hash', async (c) => {
  const hash = c.req.param('hash');
  const index = await loadIndex();
  const entry = index[hash];
  if (!entry) {
    return c.json(err('not_found', `No gist found for hash: ${hash}`, { hash }), 404);
  }
  return c.json({
    hash: entry.hash,
    gist: entry.gist,
    checkout_url: entry.checkout_url,
  });
});

// Get full thing file (product detail) by hash
app.get('/thing/:hash', async (c) => {
  let hash = c.req.param('hash');
  // Remove trailing .json if present
  if (hash.endsWith('.json')) {
    hash = hash.slice(0, -5);
  }
  const thingPath = path.join(thingsDir, `${hash}.json`);
  try {
    const content = await fs.readFile(thingPath, 'utf8');
    const thing = JSON.parse(content);
    c.header('Content-Type', 'application/json');
    return c.json(thing);
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === 'ENOENT') {
      return c.json(err('not_found', `Thing file not found for hash: ${hash}`, { hash }), 404);
    }
    return c.json(
      err('internal_error', 'Failed to load thing file', { hash, error: nodeError.message }),
      500
    );
  }
});

// Batch compilation endpoint (Sprint 4 — MVP-11)
const batchBodySchema = z.object({ products: z.array(z.unknown()) });
app.post('/batch', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (body === null || body === undefined) {
    return c.json(err('invalid_json', 'Request body must be valid JSON'), 400);
  }
  const parsed = batchBodySchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      err('invalid_batch', 'Request body must be { products: Product[] }', parsed.error.flatten()),
      400
    );
  }

  const products = parsed.data.products as Array<Record<string, unknown>>;
  if (products.length > BATCH_MAX_SIZE) {
    return c.json(
      err('batch_too_large', `Maximum batch size is ${BATCH_MAX_SIZE}`, {
        max: BATCH_MAX_SIZE,
        received: products.length,
      }),
      400
    );
  }
  if (products.length === 0) {
    return c.json(
      err('empty_batch', 'products array must not be empty'),
      400
    );
  }

  const results: Array<{ hash: string; matter_uri: string; thing_url: string; gist: StoredThing['gist'] }> = [];
  const errors: Array<{ index: number; code: string; message: string }> = [];

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const validated = productSchema.safeParse(product);
    if (!validated.success) {
      const msg = validated.error.errors.map((e) => e.message).join('; ');
      errors.push({ index: i, code: 'invalid_product', message: msg });
      continue;
    }
    try {
      const result = await compileAndPersistProduct(validated.data);
      results.push(result);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      errors.push({ index: i, code: 'compile_failed', message });
    }
  }

  const status = errors.length > 0 && results.length > 0 ? 207 : errors.length > 0 ? 400 : 200;
  return c.json({ results, errors }, status);
});

// Catalog import (Sprint 4 — MVP-12): JSON array or CSV
app.post('/catalog/import', async (c) => {
  const contentType = c.req.header('Content-Type') ?? '';
  let products: Array<Record<string, unknown>>;
  const importErrors: Array<{ index: number; code: string; message: string }> = [];

  if (contentType.includes('text/csv')) {
    const raw = await c.req.text();
    const { products: parsed, rowErrors } = parseCsvToProducts(raw);
    products = parsed;
    rowErrors.forEach((e) => importErrors.push({ index: e.row, code: 'invalid_row', message: e.message }));
  } else if (contentType.includes('application/json')) {
    const body = await c.req.json().catch(() => null);
    if (body === null || body === undefined) {
      return c.json(err('invalid_json', 'Request body must be valid JSON'), 400);
    }
    const parsed = z.object({ products: z.array(z.unknown()) }).safeParse(body);
    if (!parsed.success) {
      return c.json(
        err('invalid_body', 'Body must be { products: Product[] }', parsed.error.flatten()),
        400
      );
    }
    products = parsed.data.products as Array<Record<string, unknown>>;
  } else {
    return c.json(
      err('unsupported_media', 'Content-Type must be application/json or text/csv'),
      400
    );
  }

  if (products.length > BATCH_MAX_SIZE) {
    return c.json(
      err('batch_too_large', `Maximum batch size is ${BATCH_MAX_SIZE}`, {
        max: BATCH_MAX_SIZE,
        received: products.length,
      }),
      400
    );
  }
  if (products.length === 0 && importErrors.length === 0) {
    return c.json(err('empty_import', 'No valid products to import'), 400);
  }

  const results: Array<{ hash: string; matter_uri: string; thing_url: string; gist: StoredThing['gist'] }> = [];
  const errors: Array<{ index: number; code: string; message: string }> = [...importErrors];

  for (let i = 0; i < products.length; i++) {
    const validated = productSchema.safeParse(products[i]);
    if (!validated.success) {
      const msg = validated.error.errors.map((e) => e.message).join('; ');
      errors.push({ index: i, code: 'invalid_product', message: msg });
      continue;
    }
    try {
      const result = await compileAndPersistProduct(validated.data);
      results.push(result);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      errors.push({ index: i, code: 'compile_failed', message });
    }
  }

  const status = errors.length > 0 && results.length > 0 ? 207 : errors.length > 0 ? 400 : 200;
  return c.json(
    {
      results,
      errors,
      imported: results.length,
      failed: errors.length,
    },
    status
  );
});

// Public catalog endpoint for consumer storefront
app.get('/catalog/public', (c) => {
  const products = readProducts()
    .filter((product: MerchantProduct) => product.status === 'published' && (product.stock_count ?? 0) > 0 && !!product.thing_file?.hash)
    .map((product: MerchantProduct) => ({
      hash: product.thing_file!.hash,
      title: product.title,
      price: getConsumerPriceCents(product),
      currency: product.currency,
      category: product.category,
      merchant_id: product.merchant_id,
    }));

  return c.json({ products }, 200);
});

// Analytics Event Ingestion (MVP-14)
app.post('/v1/analytics/event', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (body === null) {
    return c.json(err('invalid_json', 'Request body must be valid JSON'), 400);
  }

  const parsed = analyticsEventSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(err('invalid_event', 'Invalid event payload', parsed.error.flatten()), 400);
  }

  const event = {
    ...parsed.data,
    timestamp: parsed.data.timestamp ?? new Date().toISOString(),
  };
  const date = new Date().toISOString().split('T')[0];
  const eventsDir = getEventsDir();
  const logFile = path.join(eventsDir, `${date}.jsonl`);

  try {
    await fs.mkdir(eventsDir, { recursive: true });
    await fs.appendFile(logFile, JSON.stringify(event) + '\n', 'utf8');
    invalidateCache();
    return c.json({ ok: true }, 201);
  } catch (error) {
    logger.error('Analytics event storage failed', { error: String(error) });
    return c.json(err('storage_error', 'Failed to persist analytics event'), 500);
  }
});

/** MVP-14: Report query params */
const ReportQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  groupBy: z.enum(['day', 'hash', 'both']).optional().default('day'),
  sortBy: z.enum(['date', 'views', 'clicks']).optional().default('date'),
  limit: z.coerce.number().int().min(1).max(1000).optional().default(100),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

// MVP-14: Analytics report (GET /v1/analytics/report)
app.get('/v1/analytics/report', async (c) => {
  const raw = Object.fromEntries(c.req.url ? new URL(c.req.url).searchParams : []);
  const parsed = ReportQuerySchema.safeParse(raw);
  if (!parsed.success) {
    return c.json(
      err('invalid_params', 'Invalid query parameters', parsed.error.flatten()),
      400
    );
  }
  const { from, to, groupBy, sortBy, limit, offset } = parsed.data;
  const rangeErr = validateDateRange(from, to);
  if (rangeErr) {
    return c.json(
      err('invalid_params', rangeErr === 'from > to' ? 'from must be ≤ to' : rangeErr),
      400
    );
  }
  const params = { from, to, groupBy, sortBy, limit, offset };
  const cacheKey = buildCacheKey({ from, to, groupBy, sortBy, limit, offset });

  startQuery();
  const t0 = performance.now();
  try {
    let result = getCached(cacheKey);
    if (result) {
      const durationMs = Math.round(performance.now() - t0);
      recordQuery(params, durationMs, result.rows.length);
      endQuery();
      return c.json(result, 200);
    }

    result = await getReport(getEventsDir(), from, to, groupBy, sortBy, limit, offset);
    const durationMs = Math.round(performance.now() - t0);
    const resultCount = result.ok ? result.rows.length : 0;
    if (!result.ok) {
      logError(params, result.error ?? 'Invalid parameters');
      recordQuery(params, durationMs, 0, result.error ?? '');
      endQuery();
      return c.json(err('invalid_params', result.error ?? 'Invalid parameters'), 400);
    }
    setCached(cacheKey, result);
    recordQuery(params, durationMs, resultCount);
    endQuery();
    return c.json(result, 200);
  } catch (e) {
    const durationMs = Math.round(performance.now() - t0);
    const message = e instanceof Error ? e.message : String(e);
    const stack = e instanceof Error ? e.stack : undefined;
    logError(params, message, stack);
    recordQuery(params, durationMs, 0, message);
    endQuery();
    return c.json(err('report_failed', message), 500);
  }
});

// Sprint 4: Analytics dashboard (GET /v1/analytics/dashboard)
const STORAGE_QUOTA_BYTES = parseInt(process.env.STORAGE_QUOTA_BYTES ?? String(5 * 1024 * 1024 * 1024), 10) || 5 * 1024 * 1024 * 1024;
app.get('/v1/analytics/dashboard', (c) => dashboardHandler(c, {
  eventsDir: getEventsDir(),
  dataRoot,
  quotaBytes: STORAGE_QUOTA_BYTES,
}));

// Sprint 4 Week 2: Retention policy — manual trigger (POST /v1/admin/retention/run)
app.post('/v1/admin/retention/run', async (c) => {
  const eventsDir = getEventsDir();
  const archiveDir = path.join(dataRoot, 'archive');
  const retentionDays = parseInt(process.env.RETENTION_DAYS ?? '90', 10) || 90;

  const policy = new RetentionPolicy({
    eventsDir,
    archiveDir,
    retentionDays,
  });

  try {
    const result = await policy.execute();
    const accept = c.req.header('Accept') ?? '';
    const isForm = c.req.header('Content-Type')?.includes('application/x-www-form-urlencoded');

    if (accept.includes('text/html') || isForm) {
      return c.redirect(`/v1/analytics/dashboard?retention_processed=${result.processed}&retention_archived=${result.archived}`);
    }
    return c.json({
      ok: true,
      processed: result.processed,
      archived: result.archived,
      errors: result.errors,
    }, 200);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return c.json(err('retention_failed', message), 500);
  }
});

// POST /v1/admin/cron/release-escrow - Run 10-day auto-release (call daily via cron)
app.post('/v1/admin/cron/release-escrow', async (c) => {
  if (!validateAdminAuth(c.req.header('authorization'))) {
    return c.json({ ok: false, error: 'Forbidden' }, 403);
  }

  const now = Date.now();
  const tenDaysAgo = new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

  const orders = await loadOrders();
  let released = 0;
  let reminders = 0;

  for (const order of orders) {
    const heldAt = order.held_at;
    if (!heldAt) continue;
    if (order.payment_status !== 'held') continue;
    if (order.fulfillment_status !== 'shipped' && order.fulfillment_status !== 'fulfilled') continue;

    if (heldAt < tenDaysAgo) {
      try {
        await releaseToMerchant(order);
        released++;
      } catch (e) {
        logger.error('Auto-release failed', { orderId: order.id, error: String(e) });
      }
    } else if (heldAt < sevenDaysAgo && !order.customer_confirmed_at) {
      // Day 7 reminder - TODO: send email with confirm link
      reminders++;
      logger.info('Day 7 reminder due', { orderId: order.id, customer: order.customer?.email });
    }
  }

  return c.json({ ok: true, released, reminders }, 200);
});

// Sprint 4 Week 3: Cache invalidation (POST /v1/admin/cache/clear)
app.post('/v1/admin/cache/clear', (c) => {
  invalidateCache();
  const accept = c.req.header('Accept') ?? '';
  const isForm = c.req.header('Content-Type')?.includes('application/x-www-form-urlencoded');
  if (accept.includes('text/html') || isForm) {
    return c.redirect('/v1/analytics/dashboard?cache_cleared=1');
  }
  return c.json({ ok: true, message: 'Cache cleared' }, 200);
});

// Serve binary .thing payloads using explicit route (from R2 or local)
app.get('/thing-bin/:hash', async (c) => {
  const hash = c.req.param('hash');
  if (useR2) {
    const data = await getThing(hash);
    if (data !== null) {
      c.header('X-Thing-Source', 'r2-binary');
      return c.body(new Uint8Array(data), 200, {
        'Content-Type': 'application/octet-stream',
      });
    }

    const jsonPath = path.join(thingsDir, `${hash}.json`);
    try {
      const jsonData = await fs.readFile(jsonPath, 'utf8');
      c.header('X-Thing-Source', 'json-fallback');
      return c.body(new TextEncoder().encode(jsonData), 200, {
        'Content-Type': 'application/octet-stream',
      });
    } catch {
      return c.json(err('not_found', `No .thing payload found for hash: ${hash}`, { hash }), 404);
    }
  }

  const filePath = path.join(thingsDir, `${hash}.thing`);
  try {
    const data = await fs.readFile(filePath);
    c.header('X-Thing-Source', 'local-binary');
    return c.body(new Uint8Array(data), 200, {
      'Content-Type': 'application/octet-stream',
    });
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === 'ENOENT') {
      const jsonPath = path.join(thingsDir, `${hash}.json`);
      try {
        const jsonData = await fs.readFile(jsonPath, 'utf8');
        c.header('X-Thing-Source', 'json-fallback');
        return c.body(new TextEncoder().encode(jsonData), 200, {
          'Content-Type': 'application/octet-stream',
        });
      } catch {
        return c.json(err('not_found', `No .thing payload found for hash: ${hash}`, { hash }), 404);
      }
    }
    throw error;
  }
});

// POST /checkout/create-session - Create Paystack transaction and return authorization URL
app.post('/checkout/create-session', async (c) => {
  try {
    const body = await c.req.json();
    const { product_hash, product_id, customer_email, delivery_address } = body;

    if (!customer_email) {
      return c.json(err('invalid_request', 'Missing customer_email'), 400);
    }
    const hash = product_hash || product_id;
    if (!hash) {
      return c.json(err('invalid_request', 'Missing product_hash or product_id'), 400);
    }

    const products = readProducts();
    const product = products.find((p: MerchantProduct) => p.thing_file?.hash === hash || p.id === hash);

    if (!product) {
      return c.json(err('product_not_found', `Product not found: ${hash}`), 404);
    }

    if ((product.stock_count ?? 0) <= 0) {
      return c.json(err('out_of_stock', 'This product is out of stock'), 400);
    }

    const consumerPriceCents = getConsumerPriceCents(product);
    const merchantPriceCents = getMerchantPriceCents(product);
    const platformRevenueCents = consumerPriceCents - merchantPriceCents;

    const callbackUrl = process.env.PAYSTACK_CALLBACK_URL
      || `${process.env.AUTH_PORTAL_BASE_URL || authPortalBaseUrl}/order/confirmation`;

    const metadata: Record<string, string> = {
      product_hash: product.thing_file?.hash ?? hash,
      product_id: product.id,
      merchant_id: product.merchant_id ?? '',
      merchant_price_cents: String(merchantPriceCents),
      consumer_price_cents: String(consumerPriceCents),
      platform_revenue_cents: String(platformRevenueCents),
      delivery_address: JSON.stringify(delivery_address || {}),
    };

    const init = await paystack.transaction.initialize({
      email: customer_email,
      amount: consumerPriceCents, // Paystack expects amount in subunit (ZAR cents)
      currency: (product.currency || 'ZAR').toUpperCase().slice(0, 3),
      callback_url: callbackUrl,
      metadata,
    });

    const data = init.data as { authorization_url?: string; reference?: string } | undefined;
    if (!data?.authorization_url) {
      logger.error('Paystack init missing authorization_url', { init });
      return c.json(err('checkout_failed', 'Failed to create payment session'), 500);
    }

    return c.json({
      ok: true,
      authorization_url: data.authorization_url,
      url: data.authorization_url,
      reference: data.reference,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Checkout session creation failed', { error: message });
    return c.json(err('checkout_failed', 'Failed to create checkout session'), 500);
  }
});

// POST /webhooks/paystack - Paystack webhook (charge.success, transfer.success, transfer.failed)
app.post('/webhooks/paystack', async (c) => {
  const signature = c.req.header('x-paystack-signature');
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!signature || !secret) {
    return c.json(err('webhook_config_error', 'Missing Paystack signature or secret'), 400);
  }

  const rawBody = await c.req.text();
  const expectedHash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
  let sigValid = false;
  if (expectedHash.length === signature.length) {
    try {
      sigValid = crypto.timingSafeEqual(Buffer.from(expectedHash, 'hex'), Buffer.from(signature, 'hex'));
    } catch {
      // ignore
    }
  }
  if (!sigValid) {
    return c.json(err('webhook_signature_invalid', 'Invalid Paystack signature'), 400);
  }

  let event: { event?: string; data?: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody) as { event?: string; data?: Record<string, unknown> };
  } catch {
    return c.json(err('webhook_invalid_json', 'Invalid webhook payload'), 400);
  }

  try {
    if (event.event === 'charge.success') {
      const data = event.data as { reference?: string; metadata?: Record<string, string>; customer?: { email?: string } } | undefined;
      if (!data?.reference) {
        logger.warn('Paystack charge.success missing reference', { event });
        return c.json({ ok: true }, 200);
      }

      let meta: Record<string, string> = {};
      const rawMeta = data.metadata;
      if (typeof rawMeta === 'string') {
        try {
          meta = JSON.parse(rawMeta) as Record<string, string>;
        } catch {
          // ignore
        }
      } else if (rawMeta && typeof rawMeta === 'object') {
        meta = rawMeta as Record<string, string>;
      }
      const productId = meta.product_id;
      const productHash = meta.product_hash;
      const merchantId = meta.merchant_id;
      const merchantPriceCents = parseInt(meta.merchant_price_cents ?? '0', 10);
      const consumerPriceCents = parseInt(meta.consumer_price_cents ?? '0', 10);
      const platformRevenueCents = parseInt(meta.platform_revenue_cents ?? '0', 10) || (consumerPriceCents - merchantPriceCents);

      let deliveryAddress: DeliveryAddress = {};
      try {
        const da = meta.delivery_address;
        if (typeof da === 'string') deliveryAddress = JSON.parse(da) as DeliveryAddress;
      } catch {
        // ignore
      }

      const customerEmail = data.customer?.email ?? '';

      const orders = await loadOrders();
      const existing = orders.find((o) => o.paystack_reference === data.reference || o.id === data.reference);
      if (existing) {
        logger.info('Paystack charge.success order already exists', { reference: data.reference });
        return c.json({ ok: true }, 200);
      }

      const now = new Date().toISOString();
      const orderId = crypto.randomUUID();
      const order: MerchantOrder = {
        id: orderId,
        paystack_reference: data.reference,
        session_id: data.reference,
        product_id: productId,
        product_hash: productHash,
        merchant_id: merchantId,
        merchant_price_cents: merchantPriceCents,
        consumer_price_cents: consumerPriceCents,
        platform_revenue_cents: platformRevenueCents,
        amount: consumerPriceCents,
        currency: 'ZAR',
        customer: { email: customerEmail, delivery_address: deliveryAddress },
        customer_email: customerEmail,
        delivery_address: deliveryAddress,
        status: 'paid',
        payment_status: 'held',
        fulfillment_status: 'pending',
        held_at: now,
        rail_used: 'paystack',
        created_at: now,
        updated_at: now,
      };

      const products = readProducts();
      const product = products.find((p) => p.id === productId || p.thing_file?.hash === productHash);
      if (product) {
        product.stock_count = Math.max(0, (product.stock_count ?? 1) - 1);
        product.updated_at = now;
        writeProducts(products);
      }

      const allOrders = await loadOrders();
      allOrders.push(order);
      await saveOrders(allOrders);

      const notifs = await loadNotifications();
      notifs.push({
        id: crypto.randomUUID(),
        merchant_id: merchantId,
        type: 'order',
        title: 'New order received',
        message: `Order #${orderId.slice(0, 8)} for ${consumerPriceCents / 100} ZAR. Delivery: ${deliveryAddress.name ?? ''} - ${deliveryAddress.line1 ?? ''}`,
        read: false,
        created_at: now,
      });
      await saveNotifications(notifs);

      logger.info('Order created from Paystack charge.success', {
        orderId,
        reference: data.reference,
        merchant_id: merchantId,
        consumer_price_cents: consumerPriceCents,
      });
    } else if (event.event === 'transfer.success' || event.event === 'transfer.failed') {
      const data = event.data as { reference?: string; status?: string } | undefined;
      if (data?.reference) {
        const logs = await loadPayoutLogs();
        const log = logs.find((l) => l.transfer_reference === data.reference);
        if (log) {
          log.status = event.event === 'transfer.success' ? 'completed' : 'failed';
          if (event.event === 'transfer.failed') log.failure_reason = (data as { reason?: string }).reason ?? 'Transfer failed';
          log.transferred_at = event.event === 'transfer.success' ? new Date().toISOString() : null;
          await savePayoutLogs(logs);
        }
      }
    }

    return c.json({ ok: true }, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Paystack webhook processing failed', { error: message });
    return c.json(err('webhook_processing_failed', message), 500);
  }
});

// GET /orders/:idOrReference - Fetch order by ID or Paystack reference
app.get('/orders/:idOrReference', async (c) => {
  try {
    const idOrRef = c.req.param('idOrReference');
    const refFromQuery = c.req.query('reference');
    const lookup = idOrRef || refFromQuery;

    if (!lookup) {
      return c.json(err('invalid_request', 'Missing order ID or reference'), 400);
    }

    const orders = await loadOrders();
    const order = orders.find((o) => o.id === lookup || o.session_id === lookup || o.paystack_reference === lookup);

    if (!order) {
      return c.json(err('not_found', `Order not found: ${lookup}`), 404);
    }

    return c.json({
      ok: true,
      order,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Failed to fetch order', { error: message });
    return c.json(err('order_fetch_failed', 'Failed to fetch order details'), 500);
  }
});

app.onError((error, c) => {
  const msg = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  logError({ path: c.req.path, method: c.req.method }, msg, stack);
  logger.error('Unhandled error', { error: msg });
  return c.json(err('internal_error', 'An unexpected error occurred'), 500);
});

// Rate limiter cleanup — prevent unbounded growth of stale entries
const RATE_LIMIT_CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let rateLimitCleanupTimer: ReturnType<typeof setInterval> | null = null;

function startRateLimitCleanup() {
  rateLimitCleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap) {
      if (now >= entry.resetAt) rateLimitMap.delete(key);
    }
  }, RATE_LIMIT_CLEANUP_INTERVAL_MS);
}

// Development server — skip when NODE_ENV=test so tests can import app without starting server
const port = Number(process.env.PORT) || 3000;
// Also skip when running on Vercel (serverless — port binding is not supported)
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
    if (rateLimitCleanupTimer) clearInterval(rateLimitCleanupTimer);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 5000);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

// Export for Vercel Edge Functions and tests
export default app;
export {
  queueOrderForPayout,
  releasePayoutLog,
  buildMoRStatus,
  validateAdminAuth,
};
export type { PayoutLogBackend, MerchantOrderBackend, MoRStatusResponse };