/**
 * LEGACY ROUTES
 * These routes have not yet been assigned to a focused domain module.
 * Each should be reviewed and moved in the next architecture sprint.
 * Do not add new routes here.
 */
import { Hono } from 'hono';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { err } from '../shared/errors.js';
import { authPortalBaseUrl } from '../shared/runtime-config.js';
import { uploadsDir, slipsDir } from '../shared/server-paths.js';
import { loadOrders, saveOrders, releaseToMerchant } from '../services/commerce-store.js';
import { db } from '../db.js';
import { readProducts } from '../merchant-products.js';
import { loadMerchantAccounts } from '../repos/merchant-accounts.js';
import { sendOrderCheckinEmail } from '../email.js';

const imageMimeByExtension: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
};

export const legacyRouter = new Hono();
legacyRouter.get('/uploads/:filename', async (c) => {
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
legacyRouter.post('/v1/orders/:orderId/confirm-receipt', async (c) => {
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
legacyRouter.get('/v1/slips/:filename', async (c) => {
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
legacyRouter.post('/v1/cron/order-checkins', async (c) => {
  const headerSecret = c.req.header('x-cron-secret');
  const authHeader = c.req.header('Authorization');
  const bearerSecret = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : undefined;
  const providedSecret = headerSecret || bearerSecret;
  if (!process.env.CRON_SECRET || providedSecret !== process.env.CRON_SECRET) {
    return c.json({ ok: false, error: 'Unauthorized' }, 401);
  }

  const now = Date.now();
  const fiveDaysMs = 5 * 24 * 60 * 60 * 1000;
  const orders = await loadOrders();
  const products = await readProducts();
  const accounts = await loadMerchantAccounts();
  const accountMap = new Map(accounts.map((account) => [account.id, account]));

  const eligible = orders.filter((order) => {
    if (order.fulfillment_status === 'fulfilled' || order.fulfillment_status === 'cancelled') {
      return false;
    }

    const createdAt = order.created_at ? new Date(order.created_at).getTime() : null;
    const lastCheckin = order.last_checkin_sent_at ? new Date(order.last_checkin_sent_at).getTime() : null;
    if (lastCheckin !== null) {
      return now - lastCheckin >= fiveDaysMs;
    }
    if (createdAt === null) return false;
    return now - createdAt >= fiveDaysMs;
  });

  if (eligible.length === 0) {
    return c.json({ ok: true, data: { processed: 0, sent: 0 } });
  }

  let sent = 0;

  for (const order of eligible) {
    const customerEmail = order.customer?.email ?? order.customer_email;
    if (!customerEmail) continue;

    const product = products.find((p) => p.id === order.product_id || p.thing_file?.hash === order.product_hash);
    const merchant = order.merchant_id ? accountMap.get(order.merchant_id) : undefined;

    try {
      await sendOrderCheckinEmail({
        customerEmail,
        orderId: order.id,
        productTitle: order.product_title ?? product?.title ?? 'your order',
        estimatedDeliveryDate: order.estimated_delivery_date ?? null,
        merchantBusinessName: merchant?.business_name ?? 'the merchant',
        checkinNumber: (order.checkin_email_count ?? 0) + 1,
        orderStatusUrl: `${authPortalBaseUrl}/order/${order.id}`,
      });

      await db
        .from('orders')
        .update({
          checkin_email_count: (order.checkin_email_count ?? 0) + 1,
          last_checkin_sent_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      sent += 1;
    } catch (error) {
      console.error(`[Cron] Failed check-in for order ${order.id}:`, error);
    }
  }

  console.log(`[Cron] Check-in emails sent: ${sent}/${eligible.length}`);
  return c.json({ ok: true, data: { processed: eligible.length, sent } });
});