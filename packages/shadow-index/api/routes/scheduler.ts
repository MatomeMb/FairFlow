/**
 * Scheduler routes — triggered by Vercel Cron or external job runner.
 * Cron endpoints use `CRON_SECRET` (header `x-cron-secret` or `Authorization: Bearer`).
 * See docs/adr/ADR-006-rate-limiting.md for ops patterns.
 */
import { Hono } from 'hono';
import { authPortalBaseUrl } from '../shared/runtime-config.js';
import { loadOrders } from '../services/commerce-store.js';
import { readProducts } from '../merchant-products.js';
import { loadMerchantAccounts } from '../repos/merchant-accounts.js';
import { sendOrderCheckinEmail } from '../email.js';
import { db } from '../db.js';
import { logger } from '../../lib/logger.js';

export const schedulerRouter = new Hono();

schedulerRouter.post('/order-checkins', async (c) => {
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

  logger.info('Cron order check-ins completed', { sent, eligible: eligible.length });
  return c.json({ ok: true, data: { processed: eligible.length, sent } });
});
