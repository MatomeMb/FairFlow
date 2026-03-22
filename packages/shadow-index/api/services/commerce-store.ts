import crypto from 'node:crypto';
import { db } from '../db.js';
import { logger } from '../../lib/logger.js';
export type DeliveryAddress = {
  name?: string;
  line1?: string;
  line2?: string;
  suburb?: string;
  city?: string;
  postal_code?: string;
  phone?: string;
};

export type MerchantOrder = {
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
  customer?: { email: string; delivery_address?: DeliveryAddress; billing_address?: Record<string, unknown> | null };
  customer_email?: string;
  delivery_address?: DeliveryAddress;
  status?: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_status?: 'held' | 'shipped' | 'confirmed' | 'released' | 'disputed';
  fulfillment_status?: 'pending' | 'shipped' | 'fulfilled' | 'delivered' | 'cancelled';
  estimated_delivery_date?: string | null;
  checkin_email_count?: number;
  last_checkin_sent_at?: string | null;
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

export type MerchantNotification = {
  id: string;
  merchant_id?: string;
  type?: 'order' | 'payout' | 'kyc' | 'system' | 'order_received' | 'low_stock' | 'payout_processed' | 'kyc_approved' | 'kyc_rejected' | 'high_value_order';
  title?: string;
  message?: string;
  read?: boolean;
  created_at?: string;
  [key: string]: unknown;
};

export type PayoutLog = {
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

export interface MerchantOrderBackend extends MerchantOrder {}

export interface PayoutLogBackend extends PayoutLog {}

export interface MoRStatusResponse {
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

export const loadOrders = async (): Promise<MerchantOrder[]> => {
  const { data, error } = await db
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to load orders: ${error.message}`);
  }

  return ((data ?? []) as Array<Record<string, unknown>>).map((row) => {
    const customer = (row.customer as Record<string, unknown> | null) ?? {};
    const payment = (row.payment as Record<string, unknown> | null) ?? {};
    const deliveryAddress =
      (customer.delivery_address as DeliveryAddress | undefined)
      ?? (payment.delivery_address as DeliveryAddress | undefined)
      ?? undefined;
    const billingAddress =
      (customer.billing_address as Record<string, unknown> | undefined)
      ?? undefined;

    return {
      id: String(row.id ?? ''),
      session_id: typeof row.session_id === 'string' ? row.session_id : undefined,
      product_id: typeof row.product_id === 'string' ? row.product_id : undefined,
      merchant_id: typeof row.merchant_id === 'string' ? row.merchant_id : undefined,
      customer: {
        email: typeof customer.email === 'string' ? customer.email : '',
        delivery_address: deliveryAddress,
        billing_address: billingAddress ?? null,
      },
      customer_email: typeof customer.email === 'string' ? customer.email : undefined,
      delivery_address: deliveryAddress,
      billing_address: billingAddress ?? null,
      status: (typeof payment.status === 'string' ? payment.status : undefined) as MerchantOrder['status'],
      payment_status: (typeof payment.payment_status === 'string' ? payment.payment_status : undefined) as MerchantOrder['payment_status'],
      amount: typeof payment.amount_cents === 'number' ? payment.amount_cents : undefined,
      merchant_price_cents: typeof payment.merchant_price_cents === 'number' ? payment.merchant_price_cents : undefined,
      consumer_price_cents: typeof payment.consumer_price_cents === 'number' ? payment.consumer_price_cents : undefined,
      platform_revenue_cents: typeof payment.platform_revenue_cents === 'number' ? payment.platform_revenue_cents : undefined,
      currency: typeof payment.currency === 'string' ? payment.currency : undefined,
      paystack_reference: typeof payment.paystack_reference === 'string' ? payment.paystack_reference : undefined,
      fulfillment_status: row.fulfillment_status as MerchantOrder['fulfillment_status'] | undefined,
      estimated_delivery_date: typeof row.estimated_delivery_date === 'string' ? row.estimated_delivery_date : null,
      checkin_email_count: typeof row.checkin_email_count === 'number' ? row.checkin_email_count : 0,
      last_checkin_sent_at: typeof row.last_checkin_sent_at === 'string' ? row.last_checkin_sent_at : null,
      created_at: typeof row.created_at === 'string' ? row.created_at : undefined,
      updated_at: typeof row.updated_at === 'string' ? row.updated_at : undefined,
    } as MerchantOrder;
  });
};

export const saveOrders = async (orders: MerchantOrder[]): Promise<void> => {
  if (orders.length === 0) return;

  const rows = orders.map((order) => ({
    id: order.id,
    session_id: order.session_id ?? order.paystack_reference ?? order.id,
    product_id: order.product_id ?? null,
    merchant_id: order.merchant_id ?? null,
    customer: {
      email: order.customer?.email ?? order.customer_email ?? '',
      billing_address: order.billing_address ?? order.customer?.billing_address ?? null,
      delivery_address: order.delivery_address ?? order.customer?.delivery_address ?? null,
    },
    payment: {
      status: order.status ?? 'pending',
      payment_status: order.payment_status ?? 'held',
      session_id: order.session_id ?? order.paystack_reference ?? order.id,
      amount_cents: order.amount ?? order.consumer_price_cents ?? 0,
      merchant_price_cents: order.merchant_price_cents ?? null,
      consumer_price_cents: order.consumer_price_cents ?? null,
      platform_revenue_cents: order.platform_revenue_cents ?? null,
      currency: order.currency ?? 'ZAR',
      paystack_reference: order.paystack_reference ?? null,
    },
    fulfillment_status: order.fulfillment_status ?? 'pending',
    estimated_delivery_date: order.estimated_delivery_date ?? null,
    checkin_email_count: order.checkin_email_count ?? 0,
    last_checkin_sent_at: order.last_checkin_sent_at ?? null,
    stock_reserved: false,
    updated_at: order.updated_at ?? new Date().toISOString(),
  }));

  const { error } = await db
    .from('orders')
    .upsert(rows, { onConflict: 'id' });

  if (error) {
    throw new Error(`Failed to save orders: ${error.message}`);
  }
};

export const loadNotifications = async (): Promise<MerchantNotification[]> => {
  const { data, error } = await db
    .from('merchant_notifications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to load notifications: ${error.message}`);
  }

  return ((data ?? []) as Array<Record<string, unknown>>).map((row) => ({
    id: String(row.id ?? ''),
    merchant_id: typeof row.merchant_id === 'string' ? row.merchant_id : undefined,
    type: row.type as MerchantNotification['type'],
    title: typeof row.title === 'string' ? row.title : undefined,
    message: typeof row.message === 'string' ? row.message : undefined,
    read: Boolean(row.read),
    created_at: typeof row.created_at === 'string' ? row.created_at : undefined,
    ...(typeof row.data === 'object' && row.data ? (row.data as Record<string, unknown>) : {}),
  }));
};

export const saveNotifications = async (items: MerchantNotification[]): Promise<void> => {
  if (items.length === 0) return;

  const normalizeNotificationType = (type: MerchantNotification['type']) => {
    if (
      type === 'order_received' ||
      type === 'low_stock' ||
      type === 'payout_processed' ||
      type === 'kyc_approved' ||
      type === 'kyc_rejected' ||
      type === 'high_value_order'
    ) {
      return type;
    }
    if (type === 'order') return 'order_received';
    if (type === 'payout') return 'payout_processed';
    if (type === 'kyc') return 'kyc_approved';
    return 'order_received';
  };

  const rows = items.map((item) => {
    const { id, merchant_id, type, title, message, read, created_at, ...data } = item;
    return {
      id,
      merchant_id: merchant_id ?? null,
      type: normalizeNotificationType(type),
      title: title ?? 'Notification',
      message: message ?? '',
      data,
      read: Boolean(read),
      created_at: created_at ?? new Date().toISOString(),
    };
  });

  const { error } = await db
    .from('merchant_notifications')
    .upsert(rows, { onConflict: 'id' });

  if (error) {
    throw new Error(`Failed to save notifications: ${error.message}`);
  }
};

export const loadPayoutLogs = async (): Promise<PayoutLog[]> => {
  const { data, error } = await db
    .from('payout_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to load payout logs: ${error.message}`);
  }

  return ((data ?? []) as Array<Record<string, unknown>>).map((row) => ({
    id: String(row.id ?? ''),
    merchant_id: typeof row.merchant_id === 'string' ? row.merchant_id : undefined,
    orders_included: Array.isArray(row.orders_included) ? (row.orders_included as string[]) : [],
    gross_amount: typeof row.gross_amount === 'number' ? row.gross_amount : 0,
    commission_amount: typeof row.commission_amount === 'number' ? row.commission_amount : 0,
    net_amount: typeof row.net_amount === 'number' ? row.net_amount : 0,
    currency: 'ZAR',
    status: row.status as PayoutLog['status'],
    transfer_reference: typeof row.reference_id === 'string' ? row.reference_id : null,
    failure_reason: null,
    initiated_by: undefined,
    created_at: typeof row.created_at === 'string' ? row.created_at : undefined,
    transferred_at: typeof row.transferred_at === 'string' ? row.transferred_at : null,
  }));
};

export const savePayoutLogs = async (logs: PayoutLog[]): Promise<void> => {
  if (logs.length === 0) return;

  const rows = logs.map((log) => ({
    id: log.id,
    merchant_id: log.merchant_id ?? null,
    orders_included: log.orders_included ?? [],
    gross_amount: log.gross_amount ?? 0,
    commission_amount: log.commission_amount ?? 0,
    net_amount: log.net_amount ?? 0,
    status: log.status ?? 'pending',
    transferred_at: log.transferred_at ?? null,
    reference_id: log.transfer_reference ?? null,
    created_at: log.created_at ?? new Date().toISOString(),
  }));

  const { error } = await db
    .from('payout_logs')
    .upsert(rows, { onConflict: 'id' });

  if (error) {
    throw new Error(`Failed to save payout logs: ${error.message}`);
  }
};

export async function loadAllOrders(): Promise<MerchantOrderBackend[]> {
  return loadOrders();
}

export async function saveAllOrders(orders: MerchantOrderBackend[]): Promise<void> {
  await saveOrders(orders);
}

/**
 * Queue an eligible order for payout exactly once.
 * Idempotency guarantee: if an order is already present in any payout log `orders_included`,
 * this returns the existing payout log and does not create a duplicate.
 */
export async function queueOrderForPayout(orderId: string): Promise<PayoutLog | null> {
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
  const commissionRate = parseFloat(process.env.PLATFORM_COMMISSION_RATE ?? '0.03');
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
export async function releaseToMerchant(order: MerchantOrder): Promise<void> {
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
export async function releasePayoutLog(payoutLogId: string, initiatedBy: string): Promise<PayoutLogBackend> {
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
export async function buildMoRStatus(): Promise<MoRStatusResponse> {
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
