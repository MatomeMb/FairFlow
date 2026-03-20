import { Package, Upload, Truck } from 'lucide-react';
import { EmptyState } from '../../../components/shared/EmptyState';
import type { MerchantOrder } from '../../../types/merchant';
import { DeliveryDatePicker } from './DeliveryDatePicker';

interface MerchantOrdersProps {
  orders: MerchantOrder[];
  ordersLoading: boolean;
  ordersError: string | null;
  fulfillingOrderId: string | null;
  uploadingSlipOrderId: string | null;
  commissionRate: number;
  onDismissOrdersError: () => void;
  onMarkAsFulfilled: (orderId: string) => void;
  onUploadSlip: (orderId: string, file: File) => void;
  onMarkAsShipped: (orderId: string, slipUrl: string) => void;
  onDeliveryDateSaved: (orderId: string, date: string) => void;
  getPayoutStatusLabel: (order: MerchantOrder) => string;
  apiBase: string;
  authToken: string | null;
}

/** Checkout / charge outcome */
function checkoutPaymentBadge(order: MerchantOrder): { label: string; className: string } {
  const s = order.status?.toLowerCase();
  if (s === 'failed' || s === 'refunded') {
    return { label: 'Failed', className: 'bg-[var(--ff-error-subtle)] text-[var(--ff-error)]' };
  }
  if (s === 'paid') {
    return { label: 'Paid', className: 'bg-[var(--ff-success-subtle)] text-[var(--ff-success-bold)]' };
  }
  return { label: 'Pending', className: 'bg-amber-500/20 text-amber-100 ring-1 ring-amber-400/35' };
}

function fulfillmentStateBadge(order: MerchantOrder): { label: string; className: string } {
  const f = order.fulfillment_status;
  if (f === 'fulfilled' || f === 'delivered') {
    return { label: 'Fulfilled', className: 'bg-[var(--ff-success-subtle)] text-[var(--ff-success)]' };
  }
  if (f === 'shipped') {
    return { label: 'Shipped', className: 'bg-[var(--ff-info-subtle)] text-[var(--ff-info)]' };
  }
  return {
    label: 'Pending',
    className: 'bg-sky-500/20 text-sky-100 ring-1 ring-sky-400/30',
  };
}

/** MoR / escrow state (distinct from checkout paid) */
const PAYOUT_STATUS_BADGE: Record<string, { label: string; className: string }> = {
  held: { label: 'Held', className: 'bg-amber-500/20 text-amber-100 ring-1 ring-amber-400/35' },
  shipped: { label: 'Shipped', className: 'bg-[var(--ff-info-subtle)] text-[var(--ff-info)]' },
  confirmed: { label: 'Confirmed', className: 'bg-[var(--ff-success-subtle)] text-[var(--ff-success)]' },
  released: { label: 'Released', className: 'bg-[var(--ff-success-subtle)] text-[var(--ff-success)]' },
  disputed: { label: 'Disputed', className: 'bg-[var(--ff-error-subtle)] text-[var(--ff-error)]' },
};

export function MerchantOrders({
  orders,
  ordersLoading,
  ordersError,
  fulfillingOrderId,
  uploadingSlipOrderId,
  commissionRate: _commissionRate,
  onDismissOrdersError,
  onMarkAsFulfilled,
  onUploadSlip,
  onMarkAsShipped,
  onDeliveryDateSaved,
  getPayoutStatusLabel,
  apiBase: _apiBase,
  authToken,
}: MerchantOrdersProps) {
  return (
    <div className="space-y-4">
      {ordersError && (
        <div className="bg-[var(--ff-error-bold)] border border-[var(--ff-error)] rounded-xl px-4 py-3 text-sm text-white flex items-start justify-between gap-3">
          <p>{ordersError}</p>
          <button
            type="button"
            onClick={onDismissOrdersError}
            className="leading-none min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--ff-ink)] hover:opacity-80"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      {ordersLoading ? (
        <div className="rounded-xl border border-[var(--ff-border)] bg-[var(--ff-surface)] overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {[0, 1, 2].map((index) => (
                <tr key={index} className="border-t border-[var(--ff-border)]">
                  <td colSpan={2} className="py-3 px-4">
                    <div className="h-4 w-full animate-pulse rounded bg-white/10" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : orders.length === 0 ? (
        <EmptyState icon={<Package className="w-10 h-10 text-[var(--ff-ink-muted)]" />} title="No orders yet" description="No orders yet. Share your product links to get started." />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border border-[var(--ff-border)] bg-[var(--ff-surface)] p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-mono text-xs text-[var(--ff-ink-muted)]">Order #{order.id}</p>
                  {order.product_title && (
                    <p className="text-sm font-medium text-[var(--ff-ink)]">
                      {order.product_title}
                    </p>
                  )}
                  {!order.product_title && order.product_hash && (
                    <p className="font-mono text-xs text-[var(--ff-ink-muted)]">
                      {order.product_hash.slice(0, 16)}…
                    </p>
                  )}
                  <p className="text-sm text-[var(--ff-ink-muted)]">Ordered: {new Date(order.created_at).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex flex-wrap justify-end gap-2">
                    {(() => {
                      const pb = checkoutPaymentBadge(order);
                      return (
                        <span className={`text-xs px-2 py-1 rounded font-medium ${pb.className}`} title="Checkout charge">
                          Payment: {pb.label}
                        </span>
                      );
                    })()}
                    {(() => {
                      const fb = fulfillmentStateBadge(order);
                      return (
                        <span className={`text-xs px-2 py-1 rounded font-medium ${fb.className}`} title="Delivery / fulfilment">
                          Fulfilment: {fb.label}
                        </span>
                      );
                    })()}
                    {order.payment_status && PAYOUT_STATUS_BADGE[order.payment_status] && (
                      <span
                        className={`text-xs px-2 py-1 rounded ${PAYOUT_STATUS_BADGE[order.payment_status].className}`}
                        title="Payout / escrow"
                      >
                        Payout: {PAYOUT_STATUS_BADGE[order.payment_status].label}
                      </span>
                    )}
                  </div>

                  {(() => {
                    const paymentFailed =
                      order.status === 'failed' || order.status === 'refunded';
                    const checkoutPaid =
                      order.status === 'paid' || order.payment_status === 'held';
                    const fulfillmentPending =
                      order.fulfillment_status === 'pending' || !order.fulfillment_status;
                    const shippedOrDone =
                      order.fulfillment_status === 'shipped' ||
                      order.fulfillment_status === 'fulfilled' ||
                      order.fulfillment_status === 'delivered';
                    const showFulfilmentActions =
                      checkoutPaid && !paymentFailed && fulfillmentPending && !shippedOrDone;

                    if (paymentFailed) {
                      return (
                        <p className="text-xs text-[var(--ff-error)] max-w-xs text-right">
                          Payment did not complete — no fulfilment actions.
                        </p>
                      );
                    }

                    if (shippedOrDone) {
                      return (
                        <span className="text-xs text-[var(--ff-success)]">
                          {order.fulfillment_status === 'fulfilled' || order.fulfillment_status === 'delivered'
                            ? 'Order marked fulfilled'
                            : 'Shipped — awaiting customer confirmation'}
                        </span>
                      );
                    }

                    if (!showFulfilmentActions) {
                      return (
                        <span className="text-xs text-[var(--ff-ink-muted)]">
                          Awaiting successful payment before you can fulfil.
                        </span>
                      );
                    }

                    return (
                      <div className="flex flex-col items-end gap-2">
                        {/* Proof-of-delivery: upload slip, then Mark as Shipped (MoR / payout flow). */}
                        <div className="flex flex-wrap justify-end gap-2">
                          <label className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border border-[var(--ff-border)] bg-[var(--ff-surface)] px-4 py-3 text-xs font-medium text-[var(--ff-ink)] hover:brightness-95">
                            <Upload className="w-4 h-4" />
                            {order.shipment_slip_url ? 'Slip uploaded' : 'Upload slip'}
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="hidden"
                              disabled={uploadingSlipOrderId === order.id}
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) onUploadSlip(order.id, f);
                                e.target.value = '';
                              }}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => order.shipment_slip_url && onMarkAsShipped(order.id, order.shipment_slip_url)}
                            disabled={!order.shipment_slip_url || fulfillingOrderId === order.id}
                            title={!order.shipment_slip_url ? 'Upload shipment slip first' : ''}
                            className="flex min-h-[44px] items-center gap-2 rounded-lg bg-[var(--ff-cta)] px-4 py-3 text-xs font-semibold text-[var(--ff-on-accent)] transition hover:bg-[var(--ff-cta-hover)] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-[var(--ff-ink-muted)] disabled:ring-1 disabled:ring-white/15"
                          >
                            <Truck className="w-4 h-4" />
                            {fulfillingOrderId === order.id ? 'Updating...' : 'Mark as Shipped'}
                          </button>
                          <button
                            type="button"
                            onClick={() => onMarkAsFulfilled(order.id)}
                            disabled={fulfillingOrderId === order.id}
                            className="flex min-h-[44px] items-center gap-2 rounded-lg border border-[var(--ff-border)] bg-white/5 px-4 py-3 text-xs font-semibold text-[var(--ff-ink)] transition hover:bg-white/10 disabled:opacity-50"
                          >
                            {fulfillingOrderId === order.id ? 'Updating...' : 'Mark as Fulfilled'}
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <p className="text-[var(--ff-ink)]"><span className="text-[var(--ff-ink-muted)]">Customer:</span> {order.customer_email}</p>
                <p className="text-[var(--ff-ink)]">
                  <span className="text-[var(--ff-ink-muted)]">Your payout:</span> R {((order.merchant_price_cents ?? order.amount ?? 0) / 100).toFixed(2)}
                </p>
                <p className="text-[var(--ff-ink)] md:col-span-2">
                  <span className="text-[var(--ff-ink-muted)]">Fulfillment:</span>{' '}
                  {order.fulfillment_status === 'pending' || !order.fulfillment_status
                    ? 'Pending'
                    : `Shipped ✓${order.shipped_at ? ` — ${new Date(order.shipped_at).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' })}` : ''}`}
                </p>
                <p className="text-[var(--ff-ink)] md:col-span-2">
                  <span className="text-[var(--ff-ink-muted)]">Delivery:</span>{' '}
                  {order.customer_confirmed_at || order.consumer_confirmed_at
                    ? `Confirmed ✓ — ${(order.customer_confirmed_at || order.consumer_confirmed_at) ? new Date(order.customer_confirmed_at || order.consumer_confirmed_at!).toLocaleDateString('en-ZA', { dateStyle: 'medium' }) : ''}`
                    : order.fulfillment_status === 'shipped' || order.fulfillment_status === 'fulfilled' || order.fulfillment_status === 'delivered'
                      ? 'Awaiting customer confirmation'
                      : 'Upload slip and mark shipped'}
                </p>
                <p className="text-[var(--ff-ink)] md:col-span-2">
                  <span className="text-[var(--ff-ink-muted)]">Payout:</span>{' '}
                  {order.payment_status === 'released'
                    ? `Released — R ${((order.merchant_price_cents ?? order.amount ?? 0) / 100).toFixed(2)}`
                    : getPayoutStatusLabel(order)}
                </p>
              </div>

              <DeliveryDatePicker
                orderId={order.id}
                token={authToken ?? ''}
                currentDate={order.estimated_delivery_date ?? null}
                onSaved={(date) => onDeliveryDateSaved(order.id, date)}
              />

              {order.delivery_address && (
                <div className="mt-4 rounded-lg border border-[var(--ff-border)] bg-[var(--ff-surface)] p-3 text-sm text-[var(--ff-ink)]">
                  <p className="mb-1 text-[var(--ff-ink-muted)]">Delivery Address</p>
                  <p>{order.delivery_address.name}</p>
                  <p>{order.delivery_address.line1}</p>
                  {order.delivery_address.line2 && <p>{order.delivery_address.line2}</p>}
                  <p>
                    {[order.delivery_address.suburb, order.delivery_address.city, order.delivery_address.postal_code]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                  {order.delivery_address.phone && <p>{order.delivery_address.phone}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
