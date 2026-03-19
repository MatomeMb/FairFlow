import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useMerchantProducts } from '../useMerchantProducts';

// Mock config
vi.mock('../../../../lib/config', () => ({
  apiBase: 'https://api.test.com',
}));

describe('useMerchantProducts', () => {
  const mockToken = 'test-token-123';
  let mockMerchantFetch: ReturnType<typeof vi.fn<(url: string, options?: RequestInit) => Promise<Response>>>;

  beforeEach(() => {
    mockMerchantFetch = vi.fn();
  });

  const mockApiProduct = {
    id: 'prod-1',
    title: 'Test Product',
    category: 'Electronics',
    price_cents: 2999,
    stock_count: 50,
    status: 'published' as const,
    thing_file: {
      matter_uri: 'matter://test',
      thing_url: 'https://thing.url',
      hash: 'abc123',
    },
  };

  describe('initial state', () => {
    it('should return empty products array initially', () => {
      const { result } = renderHook(() =>
        useMerchantProducts(mockToken, mockMerchantFetch)
      );

      expect(result.current.products).toEqual([]);
      expect(result.current.isLoadingProducts).toBe(false);
    });
  });

  describe('loadProducts', () => {
    it('should fetch and map products correctly', async () => {
      mockMerchantFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ products: [mockApiProduct] }),
      } as Response);

      const { result } = renderHook(() =>
        useMerchantProducts(mockToken, mockMerchantFetch)
      );

      await act(async () => {
        await result.current.loadProducts();
      });

      expect(mockMerchantFetch).toHaveBeenCalledWith(
        'https://api.test.com/v1/merchant/products',
        expect.objectContaining({
          headers: { Accept: 'application/json', 'x-merchant-id': 'dev-merchant-001' },
        })
      );

      expect(result.current.products).toHaveLength(1);
      const product = result.current.products[0];
      expect(product.id).toBe('prod-1');
      expect(product.name).toBe('Test Product');
      expect(product.price).toBe(29.99); // cents to dollars
      expect(product.status).toBe('Active'); // mapped from 'published'
    });

    it('should set loading state during fetch', async () => {
      let resolvePromise: (value: Response) => void;
      const pendingPromise = new Promise<Response>((resolve) => {
        resolvePromise = resolve;
      });
      mockMerchantFetch.mockReturnValueOnce(pendingPromise);

      const { result } = renderHook(() =>
        useMerchantProducts(mockToken, mockMerchantFetch)
      );

      // Start loading
      let loadPromise: Promise<void>;
      act(() => {
        loadPromise = result.current.loadProducts();
      });

      await waitFor(() => {
        expect(result.current.isLoadingProducts).toBe(true);
      });

      // Complete loading
      await act(async () => {
        resolvePromise!({
          ok: true,
          json: () => Promise.resolve({ products: [] }),
        } as Response);
        await loadPromise;
      });

      expect(result.current.isLoadingProducts).toBe(false);
    });

    it('should handle array response format', async () => {
      mockMerchantFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockApiProduct]),
      } as Response);

      const { result } = renderHook(() =>
        useMerchantProducts(mockToken, mockMerchantFetch)
      );

      await act(async () => {
        await result.current.loadProducts();
      });

      expect(result.current.products).toHaveLength(1);
    });

    it('should map product status correctly', async () => {
      const products = [
        { ...mockApiProduct, id: '1', status: 'published' as const },
        { ...mockApiProduct, id: '2', status: 'draft' as const },
        { ...mockApiProduct, id: '3', status: 'archived' as const },
      ];

      mockMerchantFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(products),
      } as Response);

      const { result } = renderHook(() =>
        useMerchantProducts(mockToken, mockMerchantFetch)
      );

      await act(async () => {
        await result.current.loadProducts();
      });

      expect(result.current.products[0].status).toBe('Active');
      expect(result.current.products[1].status).toBe('Pending');
      expect(result.current.products[2].status).toBe('Inactive');
    });

    it('should throw error on failed request', async () => {
      mockMerchantFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error'),
      } as unknown as Response);

      const { result } = renderHook(() =>
        useMerchantProducts(mockToken, mockMerchantFetch)
      );

      await expect(
        act(async () => {
          await result.current.loadProducts();
        })
      ).rejects.toThrow();
    });
  });

  describe('handleDeleteProduct', () => {
    it('should remove product from state on successful delete', async () => {
      // First load products
      mockMerchantFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockApiProduct]),
      } as Response);

      const { result } = renderHook(() =>
        useMerchantProducts(mockToken, mockMerchantFetch)
      );

      await act(async () => {
        await result.current.loadProducts();
      });

      expect(result.current.products).toHaveLength(1);

      // Then delete
      mockMerchantFetch.mockResolvedValueOnce({
        ok: true,
      } as Response);

      await act(async () => {
        await result.current.handleDeleteProduct('prod-1');
      });

      expect(result.current.products).toHaveLength(0);
    });

    it('should call DELETE endpoint with product ID', async () => {
      mockMerchantFetch.mockResolvedValueOnce({ ok: true } as Response);

      const { result } = renderHook(() =>
        useMerchantProducts(mockToken, mockMerchantFetch)
      );

      await act(async () => {
        await result.current.handleDeleteProduct('prod-123');
      });

      expect(mockMerchantFetch).toHaveBeenCalledWith(
        'https://api.test.com/v1/merchant/products/prod-123',
        { method: 'DELETE' }
      );
    });
  });

  describe('handleRestockProduct', () => {
    it('should update product stock on successful restock', async () => {
      // First load products
      mockMerchantFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockApiProduct]),
      } as Response);

      const { result } = renderHook(() =>
        useMerchantProducts(mockToken, mockMerchantFetch)
      );

      await act(async () => {
        await result.current.loadProducts();
      });

      const initialStock = result.current.products[0].stock;

      // Then restock
      mockMerchantFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ stock_count: initialStock + 10 }),
      } as Response);

      await act(async () => {
        await result.current.handleRestockProduct('prod-1');
      });

      expect(result.current.products[0].stock).toBe(initialStock + 10);
    });

    it('should call POST endpoint with quantity', async () => {
      mockMerchantFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ stock_count: 20 }),
      } as Response);

      const { result } = renderHook(() =>
        useMerchantProducts(mockToken, mockMerchantFetch)
      );

      await act(async () => {
        await result.current.handleRestockProduct('prod-1');
      });

      expect(mockMerchantFetch).toHaveBeenCalledWith(
        'https://api.test.com/v1/merchant/products/prod-1/restock',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ quantity: 10 }),
        })
      );
    });
  });
});
