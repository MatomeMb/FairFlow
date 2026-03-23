import { Hono } from 'hono';
import { err } from '../shared/errors.js';
import { authPortalBaseUrl } from '../shared/runtime-config.js';
import { logger } from '../../lib/logger.js';
import { getPaystack } from '../services/paystack-client.js';
import { tryReconcileOrderWithPaystackVerify } from '../services/paystack-order-flow.js';
import { loadOrders, saveOrders, releaseToMerchant } from '../services/commerce-store.js';
import {
  readProducts,
  findMerchantProductByThingHash,
  findMerchantProductByThingHashAnyStatus,
  getConsumerPriceCents,
  getMerchantPriceCents,
  type MerchantProduct,
} from '../merchant-products.js';

export const checkoutRouter = new Hono();
// POST /checkout/create-session - Create Paystack transaction and return authorization URL
checkoutRouter.post('/create-session', async (c) => {
  try {
    const body = await c.req.json();
    const { product_hash, product_id, customer_email, delivery_address, billing_address } = body;

    if (!customer_email) {
      return c.json(err('invalid_request', 'Missing customer_email'), 400);
    }
    const hash = product_hash || product_id;
    if (!hash) {
      return c.json(err('invalid_request', 'Missing product_hash or product_id'), 400);
    }

    const rowAny = await findMerchantProductByThingHashAnyStatus(hash);
    if (rowAny?.status === 'archived') {
      return c.json(err('product_archived', 'This product is no longer available for purchase'), 409);
    }

    let product: MerchantProduct | null = await findMerchantProductByThingHash(hash);
    if (!product) {
      const products = await readProducts();
      product = products.find((p: MerchantProduct) => p.id === hash && p.status !== 'archived') ?? null;
    }

    if (!product) {
      return c.json(err('product_not_found', `Product not found: ${hash}`), 404);
    }

    if ((product.stock_count ?? 0) <= 0) {
      return c.json(err('out_of_stock', 'This product is out of stock'), 409);
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
      billing_address: JSON.stringify(billing_address || {}),
    };

    const paystack = await getPaystack();
    // fairflow ZA: portal omitted currency for a period → API stored USD; Paystack ZA rejects USD.
    const rawCurrency = (product.currency || 'ZAR').toUpperCase().slice(0, 3);
    const checkoutCurrency =
      rawCurrency === 'USD' && process.env.PAYSTACK_LEGACY_USD_AS_ZAR !== '0'
        ? 'ZAR'
        : rawCurrency || 'ZAR';

    const init = await paystack.transaction.initialize({
      email: customer_email,
      amount: consumerPriceCents, // smallest currency unit (ZAR cents, NGN kobo, etc.)
      currency: checkoutCurrency,
      callback_url: callbackUrl,
      metadata: JSON.stringify(metadata),
    });

    if (init.status === false) {
      logger.warn('Paystack initialize rejected', { message: init.message, init });
      return c.json(
        err('checkout_failed', init.message || 'Payment provider rejected the transaction'),
        400,
      );
    }

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

export const checkoutPublicRouter = new Hono();
checkoutPublicRouter.get('/v1/orders/:id/status', async (c) => {
  const orderId = c.req.param('id');
  const orders = await loadOrders();
  const order = orders.find((candidate) => candidate.id === orderId);

  if (!order) {
    return c.json({ ok: false, error: 'Order not found' }, 404);
  }

  const products = await readProducts();
  const product = products.find((p) => p.id === order.product_id || p.thing_file?.hash === order.product_hash);

  return c.json({
    ok: true,
    data: {
      id: order.id,
      product_title: order.product_title ?? product?.title ?? 'Order item',
      fulfillment_status: order.fulfillment_status ?? 'pending',
      estimated_delivery_date: order.estimated_delivery_date ?? null,
      created_at: order.created_at,
      amount_cents: order.amount ?? order.consumer_price_cents ?? 0,
      currency: order.currency ?? 'ZAR',
    },
  });
});

checkoutPublicRouter.post('/v1/orders/:orderId/confirm-receipt', async (c) => {
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

// GET /orders/:idOrReference - Fetch order by ID or Paystack reference
checkoutPublicRouter.get('/orders/:idOrReference', async (c) => {
  try {
    const idOrRef = c.req.param('idOrReference');
    const refFromQuery = c.req.query('reference');
    const lookup = idOrRef || refFromQuery;

    if (!lookup) {
      return c.json(err('invalid_request', 'Missing order ID or reference'), 400);
    }

    let orders = await loadOrders();
    let order = orders.find((o) => o.id === lookup || o.session_id === lookup || o.paystack_reference === lookup);

    if (!order) {
      const reconciled = await tryReconcileOrderWithPaystackVerify(lookup);
      if (reconciled) {
        order = reconciled;
      } else {
        orders = await loadOrders();
        order = orders.find((o) => o.id === lookup || o.session_id === lookup || o.paystack_reference === lookup);
      }
    }

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