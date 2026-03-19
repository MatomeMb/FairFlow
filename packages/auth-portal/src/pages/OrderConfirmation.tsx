import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, Package, Mail } from 'lucide-react';
import { FairflowLogo } from '../components/FairflowLogo';
import { apiBase } from '../lib/config';
import { formatPrice } from '../lib/format';

interface Order {
  id: string;
  paystack_reference?: string;
  session_id?: string;
  product_hash?: string;
  product_id?: string;
  merchant_id?: string;
  amount?: number;
  consumer_price_cents?: number;
  currency: string;
  customer_email?: string;
  customer?: { email: string; delivery_address?: Record<string, string> };
  status?: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_status?: 'held' | 'shipped' | 'confirmed' | 'released' | 'disputed';
  fulfillment_status?: string;
  billing_address?: Record<string, string> | null;
  delivery_address?: Record<string, string>;
  created_at: string;
  paid_at?: string | null;
}

interface ThingFile {
  product: {
    title: string;
  };
}

const formatDateTime = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleString('en-ZA', {
    dateStyle: 'long',
    timeStyle: 'short',
  });
};

export function OrderConfirmation() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('reference') || searchParams.get('session_id');
  
  const [order, setOrder] = useState<Order | null>(null);
  const [productTitle, setProductTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setRetryCount] = useState(0);

  useEffect(() => {
    document.title = 'fairflow — Order Confirmation';

    if (!sessionId) {
      setError('Invalid or missing session ID');
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(`${apiBase}/orders/${sessionId}`);
        if (!res.ok) throw new Error('Order not found');
        const data: { ok: boolean; order: Order } = await res.json();
        const orderData = data.order;
        setOrder(orderData);
        const hash = orderData.product_hash || orderData.product_id;
        if (hash) {
          try {
            const thingRes = await fetch(`${apiBase}/thing/${hash}.json`);
            if (thingRes.ok) {
              const thing: ThingFile = await thingRes.json();
              if (thing?.product?.title) setProductTitle(thing.product.title);
            }
          } catch {
            // ignore
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    const interval = setInterval(() => {
      setRetryCount((c) => {
        if (c < 10) {
          fetchOrder();
          return c + 1;
        }
        return c;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D1B2A]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[var(--ff-info)] mx-auto mb-4" />
          <p className="text-[#8A99AA]">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D1B2A]">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-[var(--ff-error-subtle)] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[var(--ff-error)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Order Not Found</h1>
          <p className="text-[#8A99AA]">
            {error || 'We could not find your order. Please check your email for confirmation.'}
          </p>
        </div>
      </div>
    );
  }

  const isPending = order.status === 'pending';
  const amount = order.consumer_price_cents ?? order.amount ?? 0;
  const email = order.customer?.email ?? order.customer_email ?? '';

  return (
    <div className="min-h-screen bg-[#0D1B2A]">
      {/* Header */}
      <div className="bg-[#1A2D42] border-b border-[rgba(255,255,255,0.07)]">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <FairflowLogo markHeight={32} />
        </div>
      </div>

      {/* Confirmation Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        {isPending ? (
          // Processing State
          <div className="bg-[#1A2D42] rounded-2xl shadow-lg p-8 md:p-12 text-center">
            <div className="w-16 h-16 bg-[var(--ff-warning-subtle)] rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-[var(--ff-warning)] animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-stone-900 mb-3">Processing Payment...</h2>
            <p className="text-stone-600 mb-6">
              We're confirming your payment. This usually takes just a few seconds.
            </p>
            <div className="text-sm text-stone-500">
              Order ID: <span className="font-mono">{order.id}</span>
            </div>
          </div>
        ) : (
          // Success State
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            {/* Success Icon */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-[var(--ff-success-subtle)] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-12 h-12 text-[var(--ff-success)]" />
              </div>
              <h2 className="text-3xl font-bold text-stone-900 mb-2">Payment Successful!</h2>
              <p className="text-stone-600">
                Thank you for your purchase. A confirmation email has been sent to{' '}
                <span className="font-medium text-stone-900">{email}</span>.
              </p>
            </div>

            {/* Order Details */}
            <div className="bg-[var(--ff-surface)] rounded-xl p-6 mb-6">
              <h3 className="text-sm font-semibold text-stone-700 uppercase tracking-wide mb-4">
                Order Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-stone-600">Order ID</span>
                  <span className="font-mono text-sm text-stone-900">{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Product</span>
                  <span className="font-medium text-stone-900">{productTitle || (order.product_hash ?? '').slice(0, 12) + '...'}</span>
                </div>
                <div className="flex justify-between border-t border-stone-200 pt-3">
                  <span className="text-stone-900 font-semibold">Amount Paid</span>
                  <span className="text-xl font-bold text-[var(--ff-success)]">
                    {formatPrice(amount, order.currency)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[var(--ff-warning-subtle)] border border-[var(--ff-warning-border)] rounded-xl p-4 mb-6">
              <p className="text-sm text-[var(--ff-warning-bold)]">
                <strong>Your payment is held securely.</strong> It releases to the merchant once you confirm receipt.
              </p>
              <p className="text-sm text-[var(--ff-warning)] mt-1">Expected delivery within 10 days.</p>
            </div>

            {order.billing_address && (
              <div className="bg-[var(--ff-surface)] rounded-xl p-6 mb-6">
                <h3 className="text-sm font-semibold text-stone-700 uppercase tracking-wide mb-4">
                  Billing Address
                </h3>
                <div className="text-sm text-stone-600 space-y-1">
                  {order.billing_address.name && <p>{order.billing_address.name}</p>}
                  {order.billing_address.line1 && <p>{order.billing_address.line1}</p>}
                  {order.billing_address.line2 && <p>{order.billing_address.line2}</p>}
                  <p>
                    {[order.billing_address.suburb, order.billing_address.city, order.billing_address.postal_code]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                  {order.billing_address.phone && <p>{order.billing_address.phone}</p>}
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="border-t border-stone-200 pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <Package className="w-5 h-5 text-stone-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-stone-900 mb-1">Order Date</div>
                  <div className="text-sm text-stone-600">
                    {formatDateTime(order.paid_at || order.created_at)}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-stone-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-stone-900 mb-1">Email Confirmation</div>
                  <div className="text-sm text-stone-600">
                    Check {email} for your receipt and order details
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-8 pt-6 border-t border-stone-200">
              <p className="text-sm text-stone-500">
                © 2026 fairflow
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
