import { useCallback, useState } from 'react';
import { apiBase } from '../../../lib/config';
import type { MerchantProductApi } from '../../../types/merchant';

export interface MerchantPortalProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  status: 'Active' | 'Pending' | 'Inactive';
  stock: number;
  sales: number;
  ethicalScore: number;
  matterUri?: string;
  thingUrl?: string;
  hash?: string;
}

function mapProduct(product: MerchantProductApi): MerchantPortalProduct {
  const statusMap: Record<MerchantProductApi['status'], MerchantPortalProduct['status']> = {
    published: 'Active',
    draft: 'Pending',
    archived: 'Inactive',
  };

  return {
    id: product.id,
    name: product.title,
    category: product.category ?? 'Uncategorized',
    price: product.price_cents / 100,
    stock: product.stock_count,
    status: statusMap[product.status],
    sales: 0,
    ethicalScore: 0,
    matterUri: product.thing_file?.matter_uri,
    thingUrl: product.thing_file?.thing_url,
    hash: product.thing_file?.hash,
  };
}

async function apiError(res: Response, fallback: string): Promise<string> {
  const text = await res.text();
  if (!text) return `${fallback} (${res.status})`;
  try {
    const json = JSON.parse(text) as { error?: string; message?: string };
    return `${json.error || json.message || fallback} (${res.status})`;
  } catch {
    return `${text.slice(0, 120)} (${res.status})`;
  }
}

type Pagination = { page: number; limit: number; total: number; pages: number };

export function useMerchantProducts(
  token: string | null,
  merchantFetch: (url: string, options?: RequestInit) => Promise<Response>
) {
  const [products, setProducts] = useState<MerchantPortalProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productsPagination, setProductsPagination] = useState<Pagination | null>(null);

  const loadProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    try {
      const res = await merchantFetch(`${apiBase}/v1/merchant/products?page=1&limit=20`, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(await apiError(res, 'Failed to load products'));
      const data = await res.json() as { products?: unknown[]; pagination?: Pagination };
      const list = Array.isArray(data) ? data : (data.products || []);
      setProducts(list.map((p) => mapProduct(p as MerchantProductApi)));
      setProductsPagination(data.pagination ?? null);
    } finally {
      setIsLoadingProducts(false);
    }
  }, [merchantFetch, token]);

  const loadMoreProducts = useCallback(async () => {
    if (!productsPagination || productsPagination.page >= productsPagination.pages) return;
    const nextPage = productsPagination.page + 1;
    setIsLoadingProducts(true);
    try {
      const res = await merchantFetch(`${apiBase}/v1/merchant/products?page=${nextPage}&limit=20`, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(await apiError(res, 'Failed to load products'));
      const data = await res.json() as { products?: unknown[]; pagination?: Pagination };
      const list = data.products || [];
      setProducts((prev) => [...prev, ...list.map((p) => mapProduct(p as MerchantProductApi))]);
      setProductsPagination(data.pagination ?? null);
    } finally {
      setIsLoadingProducts(false);
    }
  }, [merchantFetch, token, productsPagination]);

  const handleDeleteProduct = useCallback(async (productId: string) => {
    const res = await merchantFetch(`${apiBase}/v1/merchant/products/${productId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(await apiError(res, 'Failed to remove product'));
    setProducts((prev) => prev.filter((product) => product.id !== productId));
  }, [merchantFetch, token]);

  const handleRestockProduct = useCallback(async (productId: string) => {
    const res = await merchantFetch(`${apiBase}/v1/merchant/products/${productId}/restock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ quantity: 10 }),
    });
    if (!res.ok) throw new Error('Failed to restock product');
    const data = await res.json();
    const nextStock = typeof data.stock_count === 'number' ? data.stock_count : null;
    if (nextStock === null) return;
    setProducts((prev) => prev.map((product) => (product.id === productId ? { ...product, stock: nextStock } : product)));
  }, [merchantFetch, token]);

  return {
    products,
    isLoadingProducts,
    loadProducts,
    loadMoreProducts,
    productsPagination,
    handleDeleteProduct,
    handleRestockProduct,
  };
}
