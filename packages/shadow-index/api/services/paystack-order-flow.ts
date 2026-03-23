import crypto from 'node:crypto';
import { db } from '../db.js';
import { emitMetric, apiLogger } from '../shared/logger.js';
import { loadMerchantAccounts } from '../repos/merchant-accounts.js';
import { readProducts, writeProducts } from '../merchant-products.js';
import {
  sendLowStockWarning,
  sendMerchantOrderNotification,
  sendCustomerOrderConfirmation,
} from '../email.js';
import {
  loadOrders,
  saveOrders,
  loadNotifications,
  saveNotifications,
  type MerchantOrder,
  type DeliveryAddress,
} from './commerce-store.js';
import { getPaystack } from './paystack-client.js';
type PaystackChargeSuccessInput = {
  reference: string;
  metadata?: unknown;
  customer?: { email?: string };
  currency?: string;
};

const inflightReferenceOrders = new Map<string, Promise<MerchantOrder | null>>();

/** Idempotent: persist order from Paystack charge (webhook or transaction verify). */
export async function ensureOrderFromPaystackChargePayload(
  data: PaystackChargeSuccessInput,
): Promise<MerchantOrder | null> {
  const reference = typeof data.reference === 'string' ? data.reference.trim() : '';
  if (!reference) return null;

  const existingFlow = inflightReferenceOrders.get(reference);
  if (existingFlow) return existingFlow;

  const flowPromise = (async (): Promise<MerchantOrder | null> => {
    const flowStartedAt = performance.now();
    const orders = await loadOrders();
    const existing = orders.find(
      (o) => o.paystack_reference === reference || o.session_id === reference || o.id === reference,
    );
    if (existing) {
      return existing;
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
    const platformRevenueCents =
      parseInt(meta.platform_revenue_cents ?? '0', 10) || (consumerPriceCents - merchantPriceCents);

    let deliveryAddress: DeliveryAddress = {};
    try {
      const da = meta.delivery_address;
      if (typeof da === 'string') deliveryAddress = JSON.parse(da) as DeliveryAddress;
    } catch {
      // ignore
    }

    let billingAddress: Record<string, unknown> | null = null;
    try {
      const ba = meta.billing_address;
      if (typeof ba === 'string') billingAddress = JSON.parse(ba) as Record<string, unknown>;
    } catch {
      // ignore
    }

    const customerEmail = data.customer?.email ?? '';

    const now = new Date().toISOString();
    const orderId = crypto.randomUUID();
    const orderCurrency = (data.currency ?? 'ZAR').toUpperCase().slice(0, 3);
    const order: MerchantOrder = {
    id: orderId,
    paystack_reference: reference,
    session_id: reference,
    product_id: productId,
    product_hash: productHash,
    merchant_id: merchantId,
    merchant_price_cents: merchantPriceCents,
    consumer_price_cents: consumerPriceCents,
    platform_revenue_cents: platformRevenueCents,
    amount: consumerPriceCents,
    currency: orderCurrency,
    customer: {
      email: customerEmail,
      delivery_address: deliveryAddress,
      billing_address: billingAddress,
    },
    customer_email: customerEmail,
    delivery_address: deliveryAddress,
    billing_address: billingAddress,
    status: 'paid',
    payment_status: 'held',
    fulfillment_status: 'pending',
    held_at: now,
    rail_used: 'paystack',
    created_at: now,
    updated_at: now,
  };

    const products = await readProducts();
    const product = products.find((p) => p.id === productId || p.thing_file?.hash === productHash);
    let stockAfter: number | null = null;
    let stockBefore = 0;

    if (product?.id && product.merchant_id) {
    stockBefore = product.stock_count ?? 0;
    if (stockBefore > 0) {
      const stockStartedAt = performance.now();
      const { data: updatedRow, error: stockErr } = await db
        .from('merchant_products')
        .update({ stock_count: stockBefore - 1, updated_at: now })
        .eq('id', product.id)
        .eq('merchant_id', product.merchant_id)
        .eq('stock_count', stockBefore)
        .select('stock_count')
        .maybeSingle();

      if (
        !stockErr &&
        updatedRow &&
        typeof (updatedRow as { stock_count?: number }).stock_count === 'number'
      ) {
        stockAfter = (updatedRow as { stock_count: number }).stock_count;
        product.stock_count = stockAfter;
        product.updated_at = now;
        await writeProducts(products);
      } else {
        // FINAL-POLISH: emit structured error when atomic stock decrement did not commit successfully.
        // ALERT_THRESHOLD: stock_decrement_failure_rate > 0.001
        apiLogger.error(
          {
            reference,
            productId: product.id,
            merchantId: product.merchant_id,
            stockBefore,
            stockErr: stockErr ? String(stockErr.message ?? stockErr) : null,
          },
          'stock_decrement_conflict'
        );
      }
      const stockDurationMs = Math.round((performance.now() - stockStartedAt) * 100) / 100;
      emitMetric(apiLogger, 'stock.decrement.duration_ms', stockDurationMs, {
        productId: product.id,
        merchantId: product.merchant_id,
        ok: !stockErr,
      });
      // FINAL-POLISH: preserve explicit threshold markers for launch monitoring.
      // ALERT_THRESHOLD: stock_decrement_duration_ms > 120
      if (stockDurationMs > 120) {
        apiLogger.warn({ productId: product.id, stockDurationMs }, 'stock_decrement_slow');
      }
    }
    } else if (product) {
    stockBefore = product.stock_count ?? 0;
    stockAfter = Math.max(0, stockBefore - 1);
    product.stock_count = stockAfter;
    product.updated_at = now;
    await writeProducts(products);
  }

    if (product?.merchant_id && product.id && stockAfter !== null) {
    await db.from('inventory_logs').insert({
      product_id: product.id,
      merchant_id: product.merchant_id,
      transaction_type: 'order',
      quantity_change: -1,
      stock_before: stockBefore,
      stock_after: stockAfter,
      reference_id: orderId,
    });

    if (stockAfter < 5) {
      const notifs = await loadNotifications();
      const lowTitle = stockAfter === 0 ? `Sold out: ${product.title}` : `Low stock: ${product.title}`;
      const lowMsg =
        stockAfter === 0
          ? `${product.title} is now out of stock.`
          : `Only ${stockAfter} unit${stockAfter === 1 ? '' : 's'} remaining.`;
      notifs.push({
        id: crypto.randomUUID(),
        merchant_id: product.merchant_id,
        type: 'low_stock',
        title: lowTitle,
        message: lowMsg,
        read: false,
        created_at: now,
      });
      await saveNotifications(notifs);

      const merchantAccounts = await loadMerchantAccounts();
      const merchant = merchantAccounts.find((account) => account.id === product.merchant_id);
      if (merchant?.email) {
        sendLowStockWarning({
          merchantEmail: merchant.email,
          merchantBusinessName: merchant.business_name,
          productTitle: product.title,
          stockCount: stockAfter,
          productImageUrl: product.image_url,
        }).catch((error) => apiLogger.warn({ error: String(error) }, 'low_stock_email_failed'));
      }
    }
    }

    const ordersBeforeInsert = await loadOrders();
    const raced = ordersBeforeInsert.find(
      (o) => o.paystack_reference === reference || o.session_id === reference,
    );
    if (raced) {
      return raced;
    }

    const allOrders = await loadOrders();
    allOrders.push(order);
    await saveOrders(allOrders);

    const merchantAccounts = await loadMerchantAccounts();
    const merchant = merchantAccounts.find(
      (account) => account.id === (merchantId || product?.merchant_id || ''),
    );
    const merchantBusinessName = merchant?.business_name ?? 'Fairflow Merchant';

    if (merchant?.email) {
    sendMerchantOrderNotification(merchant.email, {
      orderId: order.id,
      productTitle: product?.title ?? 'Product',
      amountCents: consumerPriceCents,
      customerEmail,
      deliveryAddress: order.customer?.delivery_address ?? null,
      merchantBusinessName,
      productImageUrl: product?.image_url,
      currency: order.currency,
      paystackReference: order.paystack_reference,
    }).catch((error) => apiLogger.error({ error: String(error) }, 'merchant_order_email_failed'));
    }

    if (customerEmail) {
    sendCustomerOrderConfirmation({
      orderId: order.id,
      productTitle: product?.title ?? 'Product',
      amountCents: consumerPriceCents,
      customerEmail,
      deliveryAddress: order.customer?.delivery_address ?? null,
      estimatedDeliveryDate: order.estimated_delivery_date ?? null,
      merchantBusinessName,
      productImageUrl: product?.image_url,
      currency: order.currency,
      paystackReference: order.paystack_reference,
    }).catch((error) => apiLogger.error({ error: String(error) }, 'customer_order_email_failed'));
    }

    const notifs = await loadNotifications();
    const productTitle = product?.title ?? 'Product';
    notifs.push({
    id: crypto.randomUUID(),
    merchant_id: merchantId || product?.merchant_id || '',
    type: 'order_received',
    title: `New order: ${productTitle}`,
    message: `Customer ${customerEmail || '—'} · ${productTitle} · ${orderCurrency} ${(consumerPriceCents / 100).toFixed(2)}`,
    read: false,
    created_at: now,
  });
    await saveNotifications(notifs);

    apiLogger.info({
      msg: 'order_created_from_paystack_charge',
      orderId,
      reference,
      merchant_id: merchantId,
      consumer_price_cents: consumerPriceCents,
    });
    const totalDurationMs = Math.round((performance.now() - flowStartedAt) * 100) / 100;
    emitMetric(apiLogger, 'webhook.paystack.order_flow.duration_ms', totalDurationMs, {
      merchantId: merchantId ?? null,
    });

    return order;
  })();

  inflightReferenceOrders.set(reference, flowPromise);
  try {
    return await flowPromise;
  } finally {
    inflightReferenceOrders.delete(reference);
  }
}

/** When the user hits /order/confirmation before the webhook runs, verify with Paystack and create the row. */
export async function tryReconcileOrderWithPaystackVerify(lookup: string): Promise<MerchantOrder | null> {
  if (!process.env.PAYSTACK_SECRET_KEY?.trim()) return null;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(lookup)) {
    return null;
  }

  try {
    const paystack = await getPaystack();
    const res = await paystack.transaction.verify({ reference: lookup });
    if (res.status !== true) return null;
    const d = res.data as Record<string, unknown> | undefined;
    if (!d || String(d.status) !== 'success') return null;

    const reference = typeof d.reference === 'string' && d.reference.trim() ? d.reference : lookup;
    const currency = typeof d.currency === 'string' ? d.currency : undefined;

    return await ensureOrderFromPaystackChargePayload({
      reference,
      metadata: d.metadata,
      customer: d.customer as { email?: string } | undefined,
      currency,
    });
  } catch (error) {
    apiLogger.warn({
      msg: 'paystack_verify_reconcile_failed',
      lookup,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}