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

const PAYMENT_BADGE: Record<string, { label: string; className: string }> = {
  held: { label: 'Held', className: 'bg-amber-100 text-amber-800' },
  shipped: { label: 'Shipped', className: 'bg-blue-100 text-blue-800' },
  confirmed: { label: 'Confirmed', className: 'bg-emerald-100 text-emerald-800' },
  released: { label: 'Released', className: 'bg-emerald-100 text-emerald-800' },
  disputed: { label: 'Disputed', className: 'bg-red-100 text-red-800' },
};

export function MerchantOrders({
  orders,
  ordersLoading,
  ordersError,
  fulfillingOrderId,
  uploadingSlipOrderId,
  commissionRate: _commissionRate,
  onDismissOrdersError,
  onMarkAsFulfilled: _onMarkAsFulfilled,
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
        <div className="bg-red-700 border border-red-500 rounded-xl px-4 py-3 text-sm text-white flex items-start justify-between gap-3">
          <p>{ordersError}</p>
          <button
            type="button"
            onClick={onDismissOrdersError}
            className="text-white/90 hover:text-white leading-none min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      {ordersLoading ? (
        <div className="rounded-xl border border-[var(--ff-border)] bg-white/85 overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {[0, 1, 2].map((index) => (
                <tr key={index} className="border-t border-[var(--ff-border)]">
                  <td colSpan={2} className="py-3 px-4">
                    <div className="h-4 w-full animate-pulse rounded bg-[var(--ff-surface)]" />
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
              className="rounded-xl border border-[var(--ff-border)] bg-white/85 p-5"
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

                <div className="flex items-center gap-2">
                  {order.payment_status && PAYMENT_BADGE[order.payment_status] && (
                    <span className={`text-xs px-2 py-1 rounded ${PAYMENT_BADGE[order.payment_status].className}`}>
                      {PAYMENT_BADGE[order.payment_status].label}
                    </span>
                  )}
                  {(order.fulfillment_status === 'shipped' || order.fulfillment_status === 'fulfilled' || order.fulfillment_status === 'delivered') ? (
                    <span className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-800">Shipped ✓</span>
                  ) : (
                    <div className="flex gap-2">
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
                        onClick={() => order.shipment_slip_url && onMarkAsShipped(order.id, order.shipment_slip_url)}
                        disabled={!order.shipment_slip_url || fulfillingOrderId === order.id}
                        title={!order.shipment_slip_url ? 'Upload shipment slip first' : ''}
                        className="flex min-h-[44px] items-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-xs font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-800/60"
                      >
                        <Truck className="w-4 h-4" />
                        {fulfillingOrderId === order.id ? 'Updating...' : 'Mark as Shipped'}
                      </button>
                    </div>
                  )}
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
