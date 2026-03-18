import { useCallback, useMemo, useState } from 'react';
import { apiBase } from '../../../lib/config';
import type { MerchantPortalProduct } from './useMerchantProducts';

type ReportRowDay = { date: string; views: number; clicks: number };
type ReportRowHash = { hash: string; views: number; clicks: number };

type AnalyticsState = {
  reportByDay: ReportRowDay[];
  reportByHash: ReportRowHash[];
  summary: { totalViews: number; totalClicks: number };
  viewModel: {
    engagementTrend: Array<{ label: string; views: number; clicks: number }>;
    categoryEngagement: Array<{ category: string; clicks: number }>;
    topProducts: Array<{ name: string; views: number; clicks: number; stock: number; category: string }>;
    funnel: Array<{ stage: string; count: number }>;
  };
};

async function apiError(res: Response, fallback: string): Promise<string> {
  const text = await res.text();
  try {
    const json = JSON.parse(text) as { error?: string; message?: string };
    return `${json.error || json.message || fallback} (${res.status})`;
  } catch {
    return `${(text || fallback).slice(0, 120)} (${res.status})`;
  }
}

export function useMerchantAnalytics(
  token: string | null,
  merchantFetch: (url: string, options?: RequestInit) => Promise<Response>,
  products: MerchantPortalProduct[]
) {
  const [reportByDay, setReportByDay] = useState<ReportRowDay[]>([]);
  const [reportByHash, setReportByHash] = useState<ReportRowHash[]>([]);
  const [summary, setSummary] = useState({ totalViews: 0, totalClicks: 0 });
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  const loadAnalytics = useCallback(async () => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - 29);
    const fmt = (date: Date) => date.toISOString().slice(0, 10);

    setIsLoadingAnalytics(true);
    try {
      const params = `from=${fmt(from)}&to=${fmt(to)}&limit=1000`;
      const [dayRes, hashRes] = await Promise.all([
        merchantFetch(`${apiBase}/v1/analytics/report?${params}&groupBy=day&sortBy=date`, { headers: { Accept: 'application/json' } }),
        merchantFetch(`${apiBase}/v1/analytics/report?${params}&groupBy=hash&sortBy=clicks`, { headers: { Accept: 'application/json' } }),
      ]);

      if (!dayRes.ok || !hashRes.ok) {
        const [dayErr, hashErr] = await Promise.all([
          dayRes.ok ? Promise.resolve('') : apiError(dayRes, 'Failed to load analytics'),
          hashRes.ok ? Promise.resolve('') : apiError(hashRes, 'Failed to load analytics'),
        ]);
        throw new Error(dayErr || hashErr || 'Failed to load analytics');
      }

      const dayData = await dayRes.json();
      const hashData = await hashRes.json();
      setReportByDay(dayData.rows || []);
      setReportByHash(hashData.rows || []);
      setSummary({ totalViews: dayData.summary?.totalViews ?? 0, totalClicks: dayData.summary?.totalClicks ?? 0 });
    } finally {
      setIsLoadingAnalytics(false);
    }
  }, [merchantFetch, token]);

  const analytics = useMemo<AnalyticsState>(() => {
    const productsByHash = new Map(products.filter((p) => p.hash).map((p) => [p.hash as string, p]));
    const topProducts = (reportByHash.length ? reportByHash.slice(0, 6).map((row) => {
      const product = productsByHash.get(row.hash);
      return {
        name: product?.name ?? `${row.hash.slice(0, 8)}...`,
        views: row.views,
        clicks: row.clicks,
        stock: product?.stock ?? 0,
        category: product?.category ?? 'Uncategorized',
      };
    }) : products.slice(0, 6).map((product) => ({ name: product.name, views: 0, clicks: 0, stock: product.stock, category: product.category })));

    const categoryEngagement = Array.from(topProducts.reduce((acc, item) => {
      acc.set(item.category, (acc.get(item.category) ?? 0) + item.clicks);
      return acc;
    }, new Map<string, number>())).map(([category, clicks]) => ({ category, clicks }));

    return {
      reportByDay,
      reportByHash,
      summary,
      viewModel: {
        engagementTrend: reportByDay.map((row) => ({ label: row.date, views: row.views, clicks: row.clicks })),
        categoryEngagement,
        topProducts,
        funnel: [{ stage: 'Views', count: summary.totalViews }, { stage: 'Checkout Clicks', count: summary.totalClicks }],
      },
    };
  }, [products, reportByDay, reportByHash, summary]);

  return { analytics, isLoadingAnalytics, loadAnalytics };
}
