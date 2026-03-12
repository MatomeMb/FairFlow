import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Package, CheckCircle2, Clock, Truck } from 'lucide-react';
import { apiBase } from '../lib/config';

interface OrderStatus {
  id: string;
  product_title: string;
  fulfillment_status: 'pending' | 'fulfilled' | 'cancelled' | 'shipped' | 'delivered';
  estimated_delivery_date: string | null;
  created_at: string;
  amount_cents: number;
  currency: string;
}

const STATUS_CONFIG: Record<string, {
  icon: typeof Clock;
  label: string;
  description: string;
  color: string;
  bg: string;
  border: string;
}> = {
  pending: {
    icon: Clock,
    label: 'Being prepared',
    description: 'The merchant is preparing your order.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  shipped: {
    icon: Truck,
    label: 'Shipped',
    description: 'Your order is on the way.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  fulfilled: {
    icon: CheckCircle2,
    label: 'Fulfilled',
    description: 'Your order has been dispatched.',
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
  },
  delivered: {
    icon: CheckCircle2,
    label: 'Delivered',
    description: 'Your order has been delivered.',
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
  },
  cancelled: {
    icon: Package,
    label: 'Cancelled',
    description: 'This order has been cancelled.',
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
  },
};

export function OrderStatusPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    fetch(`${apiBase}/v1/orders/${orderId}/status`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) setOrder(data.data as OrderStatus);
        else setError('Order not found.');
      })
      .catch(() => setError('Could not load order status.'))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{error ?? 'Order not found.'}</p>
        </div>
      </div>
    );
  }

  const config = STATUS_CONFIG[order.fulfillment_status] ?? STATUS_CONFIG.pending;
  const StatusIcon = config.icon;

  const formattedDate = order.estimated_delivery_date
    ? new Date(order.estimated_delivery_date).toLocaleDateString('en-ZA', {
        dateStyle: 'long',
      })
    : null;

  const formattedAmount = `R${(order.amount_cents / 100).toFixed(2)}`;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-gray-900 rounded" />
            <span className="font-bold text-gray-900 text-lg">fairflow</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Order status</h1>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-900">{order.product_title}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Order {order.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
              <p className="font-bold text-gray-900 shrink-0">{formattedAmount}</p>
            </div>
          </div>

          <div className={`p-5 border-b border-gray-100 ${config.bg}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full bg-white border ${config.border}`}>
                <StatusIcon className={`w-4 h-4 ${config.color}`} />
              </div>
              <div>
                <p className={`font-semibold text-sm ${config.color}`}>{config.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{config.description}</p>
              </div>
            </div>
          </div>

          <div className="p-5">
            <div className="flex items-center gap-2 text-sm">
              <Truck className="w-4 h-4 text-gray-400 shrink-0" />
              {formattedDate ? (
                <p className="text-gray-700">
                  Estimated delivery: <span className="font-semibold text-gray-900">{formattedDate}</span>
                </p>
              ) : (
                <p className="text-gray-400">Delivery date not yet confirmed</p>
              )}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">Powered by Fairflow</p>
      </div>
    </div>
  );
}
