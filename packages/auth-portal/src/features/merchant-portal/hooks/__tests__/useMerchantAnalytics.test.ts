import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useMerchantAnalytics } from '../useMerchantAnalytics';
import type { MerchantPortalProduct } from '../useMerchantProducts';

// Mock config
vi.mock('../../../../lib/config', () => ({
  apiBase: 'https://api.test.com',
}));

describe('useMerchantAnalytics', () => {
  const mockToken = 'test-token-123';
  let mockMerchantFetch: ReturnType<typeof vi.fn<(url: string, options?: RequestInit) => Promise<Response>>>;

  const mockProducts: MerchantPortalProduct[] = [
    {
      id: 'prod-1',
      name: 'Product One',
      category: 'Electronics',
      price: 29.99,
      status: 'Active',
      stock: 50,
      sales: 10,
      ethicalScore: 85,
      hash: 'hash-001',
    },
    {
      id: 'prod-2',
      name: 'Product Two',
      category: 'Fashion',
      price: 49.99,
      status: 'Active',
      stock: 30,
      sales: 5,
      ethicalScore: 92,
      hash: 'hash-002',
    },
  ];

  beforeEach(() => {
    mockMerchantFetch = vi.fn();
  });

  describe('initial state', () => {
    it('should return default analytics values', () => {
      const { result } = renderHook(() =>
        useMerchantAnalytics(mockToken, mockMerchantFetch, mockProducts)
      );

      expect(result.current.analytics.summary).toEqual({
        totalViews: 0,
        totalClicks: 0,
      });
      expect(result.current.analytics.reportByDay).toEqual([]);
      expect(result.current.analytics.reportByHash).toEqual([]);
      expect(result.current.isLoadingAnalytics).toBe(false);
    });

    it('should derive viewModel from products when no report data', () => {
      const { result } = renderHook(() =>
        useMerchantAnalytics(mockToken, mockMerchantFetch, mockProducts)
      );

      const { viewModel } = result.current.analytics;
      expect(viewModel.topProducts).toHaveLength(2);
      expect(viewModel.topProducts[0].name).toBe('Product One');
      expect(viewModel.topProducts[0].views).toBe(0);
      expect(viewModel.topProducts[0].clicks).toBe(0);
    });
  });

  describe('loadAnalytics', () => {
    const mockDayResponse = {
      rows: [
        { date: '2024-01-15', views: 100, clicks: 25 },
        { date: '2024-01-16', views: 120, clicks: 30 },
      ],
      summary: { totalViews: 220, totalClicks: 55 },
    };

    const mockHashResponse = {
      rows: [
        { hash: 'hash-001', views: 150, clicks: 40 },
        { hash: 'hash-002', views: 70, clicks: 15 },
      ],
    };

    it('should fetch analytics from both endpoints', async () => {
      mockMerchantFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockDayResponse),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockHashResponse),
        } as Response);

      const { result } = renderHook(() =>
        useMerchantAnalytics(mockToken, mockMerchantFetch, mockProducts)
      );

      await act(async () => {
        await result.current.loadAnalytics();
      });

      expect(mockMerchantFetch).toHaveBeenCalledTimes(2);
      // Verify day endpoint
      expect(mockMerchantFetch).toHaveBeenCalledWith(
        expect.stringContaining('groupBy=day'),
        expect.any(Object)
      );
      // Verify hash endpoint
      expect(mockMerchantFetch).toHaveBeenCalledWith(
        expect.stringContaining('groupBy=hash'),
        expect.any(Object)
      );
    });

    it('should update analytics state with fetched data', async () => {
      mockMerchantFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockDayResponse),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockHashResponse),
        } as Response);

      const { result } = renderHook(() =>
        useMerchantAnalytics(mockToken, mockMerchantFetch, mockProducts)
      );

      await act(async () => {
        await result.current.loadAnalytics();
      });

      expect(result.current.analytics.summary).toEqual({
        totalViews: 220,
        totalClicks: 55,
      });
      expect(result.current.analytics.reportByDay).toHaveLength(2);
      expect(result.current.analytics.reportByHash).toHaveLength(2);
    });

    it('should set loading state during fetch', async () => {
      let resolveFetches: Array<(value: Response) => void> = [];
      
      mockMerchantFetch.mockImplementation(() => {
        return new Promise<Response>((resolve) => {
          resolveFetches.push(resolve);
        });
      });

      const { result } = renderHook(() =>
        useMerchantAnalytics(mockToken, mockMerchantFetch, mockProducts)
      );

      // Start loading
      let loadPromise: Promise<void>;
      act(() => {
        loadPromise = result.current.loadAnalytics();
      });

      // Wait for loading to start
      await waitFor(() => {
        expect(result.current.isLoadingAnalytics).toBe(true);
      });

      // Resolve both fetches
      await act(async () => {
        resolveFetches.forEach((resolve) => {
          resolve({
            ok: true,
            json: () => Promise.resolve({ rows: [], summary: { totalViews: 0, totalClicks: 0 } }),
          } as Response);
        });
        await loadPromise;
      });

      expect(result.current.isLoadingAnalytics).toBe(false);
    });

    it('should throw error when day endpoint fails', async () => {
      mockMerchantFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          text: () => Promise.resolve('Server Error'),
        } as unknown as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockHashResponse),
        } as Response);

      const { result } = renderHook(() =>
        useMerchantAnalytics(mockToken, mockMerchantFetch, mockProducts)
      );

      await expect(
        act(async () => {
          await result.current.loadAnalytics();
        })
      ).rejects.toThrow();
    });

    it('should throw error when hash endpoint fails', async () => {
      mockMerchantFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockDayResponse),
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 403,
          text: () => Promise.resolve('Forbidden'),
        } as unknown as Response);

      const { result } = renderHook(() =>
        useMerchantAnalytics(mockToken, mockMerchantFetch, mockProducts)
      );

      await expect(
        act(async () => {
          await result.current.loadAnalytics();
        })
      ).rejects.toThrow();
    });
  });

  describe('viewModel derivation', () => {
    it('should build engagementTrend from reportByDay', async () => {
      const mockDayResponse = {
        rows: [
          { date: '2024-01-15', views: 100, clicks: 25 },
          { date: '2024-01-16', views: 120, clicks: 30 },
        ],
        summary: { totalViews: 220, totalClicks: 55 },
      };

      mockMerchantFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockDayResponse),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ rows: [] }),
        } as Response);

      const { result } = renderHook(() =>
        useMerchantAnalytics(mockToken, mockMerchantFetch, mockProducts)
      );

      await act(async () => {
        await result.current.loadAnalytics();
      });

      const { engagementTrend } = result.current.analytics.viewModel;
      expect(engagementTrend).toHaveLength(2);
      expect(engagementTrend[0]).toEqual({ label: '2024-01-15', views: 100, clicks: 25 });
    });

    it('should build funnel from summary', async () => {
      const mockDayResponse = {
        rows: [],
        summary: { totalViews: 500, totalClicks: 125 },
      };

      mockMerchantFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockDayResponse),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ rows: [] }),
        } as Response);

      const { result } = renderHook(() =>
        useMerchantAnalytics(mockToken, mockMerchantFetch, mockProducts)
      );

      await act(async () => {
        await result.current.loadAnalytics();
      });

      const { funnel } = result.current.analytics.viewModel;
      expect(funnel).toEqual([
        { stage: 'Views', count: 500 },
        { stage: 'Checkout Clicks', count: 125 },
      ]);
    });

    it('should match products by hash for topProducts', async () => {
      const mockHashResponse = {
        rows: [{ hash: 'hash-001', views: 150, clicks: 40 }],
      };

      mockMerchantFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ rows: [], summary: { totalViews: 0, totalClicks: 0 } }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockHashResponse),
        } as Response);

      const { result } = renderHook(() =>
        useMerchantAnalytics(mockToken, mockMerchantFetch, mockProducts)
      );

      await act(async () => {
        await result.current.loadAnalytics();
      });

      const { topProducts } = result.current.analytics.viewModel;
      expect(topProducts[0].name).toBe('Product One'); // Matched by hash-001
      expect(topProducts[0].views).toBe(150);
      expect(topProducts[0].clicks).toBe(40);
      expect(topProducts[0].category).toBe('Electronics');
    });

    it('should handle unknown hash with truncated display', async () => {
      const mockHashResponse = {
        rows: [{ hash: 'unknown-hash-xyz', views: 50, clicks: 10 }],
      };

      mockMerchantFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ rows: [], summary: { totalViews: 0, totalClicks: 0 } }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockHashResponse),
        } as Response);

      const { result } = renderHook(() =>
        useMerchantAnalytics(mockToken, mockMerchantFetch, [])
      );

      await act(async () => {
        await result.current.loadAnalytics();
      });

      const { topProducts } = result.current.analytics.viewModel;
      expect(topProducts[0].name).toBe('unknown-...'); // Truncated hash
    });

    it('should aggregate categoryEngagement from topProducts', async () => {
      const mockHashResponse = {
        rows: [
          { hash: 'hash-001', views: 100, clicks: 30 },
          { hash: 'hash-002', views: 50, clicks: 20 },
        ],
      };

      mockMerchantFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ rows: [], summary: { totalViews: 0, totalClicks: 0 } }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockHashResponse),
        } as Response);

      const { result } = renderHook(() =>
        useMerchantAnalytics(mockToken, mockMerchantFetch, mockProducts)
      );

      await act(async () => {
        await result.current.loadAnalytics();
      });

      const { categoryEngagement } = result.current.analytics.viewModel;
      // Electronics: 30 clicks, Fashion: 20 clicks
      const electronics = categoryEngagement.find((c) => c.category === 'Electronics');
      const fashion = categoryEngagement.find((c) => c.category === 'Fashion');
      expect(electronics?.clicks).toBe(30);
      expect(fashion?.clicks).toBe(20);
    });
  });
});
