import { useCallback, useState } from 'react';
import { apiBase } from '../../../lib/config';
import type { MerchantOrder } from '../../../types/merchant';

async function apiError(res: Response, fallback: string): Promise<string> {
  const text = await res.text();
  if (!text) return fallback;
  try {
    const json = JSON.parse(text) as { error?: string; message?: string };
    return json.error || json.message || fallback;
  } catch {
    return text.slice(0, 120) || fallback;
  }
}

export function useMerchantOrders(
  token: string | null,
  merchantFetch: (url: string, options?: RequestInit) => Promise<Response>
) {
  const [orders, setOrders] = useState<MerchantOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [fulfillingOrderId, setFulfillingOrderId] = useState<string | null>(null);
  const [uploadingSlipOrderId, setUploadingSlipOrderId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setIsLoadingOrders(true);
    try {
      const res = await merchantFetch(`${apiBase}/v1/merchant/orders`, { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(await apiError(res, 'Failed to load orders'));
      const data = await res.json();
      setOrders(data.orders || []);
    } finally {
      setIsLoadingOrders(false);
    }
  }, [merchantFetch, token]);

  const fulfillOrder = useCallback(async (orderId: string) => {
    setFulfillingOrderId(orderId);
    try {
      const res = await merchantFetch(`${apiBase}/v1/merchant/orders/${orderId}/fulfill`, {
        method: 'PATCH',
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to mark order as fulfilled');
      const data = await res.json();
      if (data.ok && data.order) setOrders((prev) => prev.map((order) => (order.id === orderId ? data.order : order)));
    } finally {
      setFulfillingOrderId(null);
    }
  }, [merchantFetch, token]);

  const uploadSlip = useCallback(async (orderId: string, file: File) => {
    setUploadingSlipOrderId(orderId);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await merchantFetch(`${apiBase}/v1/merchant/orders/${orderId}/upload-slip`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error(await apiError(res, 'Failed to upload slip'));
      const data = await res.json();
      if (data.slip_url) {
        setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, shipment_slip_url: data.slip_url } : order)));
      }
      return data.slip_url as string | undefined;
    } finally {
      setUploadingSlipOrderId(null);
    }
  }, [merchantFetch, token]);

  const markAsShipped = useCallback(async (orderId: string, slipUrl: string) => {
    setFulfillingOrderId(orderId);
    try {
      const res = await merchantFetch(`${apiBase}/v1/merchant/orders/${orderId}/ship`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ shipment_slip_url: slipUrl }),
      });
      if (!res.ok) throw new Error(await apiError(res, 'Failed to mark as shipped'));
      const data = await res.json();
      if (data.ok && data.order) setOrders((prev) => prev.map((order) => (order.id === orderId ? data.order : order)));
    } finally {
      setFulfillingOrderId(null);
    }
  }, [merchantFetch, token]);

  const updateOrder = useCallback((orderId: string, patch: Partial<MerchantOrder>) => {
    setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, ...patch } : order)));
  }, []);

  return {
    orders,
    isLoadingOrders,
    loadOrders,
    fulfillOrder,
    uploadSlip,
    markAsShipped,
    fulfillingOrderId,
    uploadingSlipOrderId,
    updateOrder,
  };
}
