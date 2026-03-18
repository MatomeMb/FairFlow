import type { ComponentType } from 'react';
import { MetricCard } from '../../../components/shared/MetricCard';
import type { MerchantPortalProduct } from '../hooks/useMerchantProducts';
import type { MerchantAnalyticsSummary, MerchantAnalyticsViewModel } from '../hooks/useMerchantAnalytics';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface MerchantAnalyticsStats {
  active: number;
}

export interface MerchantAnalyticsSectionProps {
  analyticsError: string | null;
  onDismissAnalyticsError: () => void;
  ErrorBanner: ComponentType<{ message: string; onDismiss: () => void }>;
  InlineSpinner: ComponentType<{ label: string }>;
  isLoadingAnalytics: boolean;
  summary: MerchantAnalyticsSummary;
  stats: MerchantAnalyticsStats;
  products: MerchantPortalProduct[];
  analyticsViewModel: MerchantAnalyticsViewModel;
}

export function MerchantAnalyticsSection({
  analyticsError,
  onDismissAnalyticsError,
  ErrorBanner,
  InlineSpinner,
  isLoadingAnalytics,
  summary,
  stats,
  products,
  analyticsViewModel,
}: MerchantAnalyticsSectionProps) {
  return (
    <div className="space-y-6">
      {analyticsError && <ErrorBanner message={analyticsError} onDismiss={onDismissAnalyticsError} />}
      {isLoadingAnalytics && <InlineSpinner label="Loading analytics..." />}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <MetricCard label="Total Views" value={summary.totalViews.toLocaleString()} color="green" />
        <MetricCard label="Checkout Clicks" value={summary.totalClicks.toLocaleString()} color="blue" />
        <MetricCard label="Active Products" value={stats.active} color="blue" />
        <MetricCard label="Total Inventory" value={products.reduce((sum, product) => sum + product.stock, 0)} unit="units" color="amber" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-[var(--ff-border-light)] bg-[var(--ff-neutral)]/70 p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold">Engagement Trend (Last 30 Days)</h3>
            <span className="text-xs text-[var(--ff-neutral-muted)]">Views vs Clicks</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsViewModel.engagementTrend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--ff-info)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--ff-info)" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="clicksFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--ff-success)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--ff-success)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1f2937" strokeDasharray="4 4" />
                <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1f2937', color: '#e2e8f0' }} />
                <Area type="monotone" dataKey="views" stroke="var(--ff-info)" fill="url(#viewsFill)" strokeWidth={2} />
                <Area type="monotone" dataKey="clicks" stroke="var(--ff-success)" fill="url(#clicksFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--ff-border-light)] bg-[var(--ff-neutral)]/70 p-6">
          <h3 className="mb-4 font-bold">Checkout Funnel</h3>
          <div className="space-y-4">
            {analyticsViewModel.funnel.map((stage) => (
              <div key={stage.stage} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--ff-ink-muted)]">{stage.stage}</span>
                  <span className="font-mono text-[var(--ff-ink)]">{stage.count.toLocaleString()}</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--ff-neutral-subtle)]">
                  <div className="h-2 rounded-full bg-[var(--ff-success)]" style={{ width: `${Math.min(100, (stage.count / analyticsViewModel.funnel[0].count) * 100)}%` }} />
                </div>
              </div>
            ))}
            <p className="text-xs text-[var(--ff-neutral-muted)]">Based on real view and click events.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-[var(--ff-border-light)] bg-[var(--ff-neutral)]/70 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold">Top Products</h3>
            <span className="text-xs text-[var(--ff-neutral-muted)]">Checkout Clicks</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsViewModel.topProducts} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid stroke="#1f2937" strokeDasharray="4 4" />
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1f2937', color: '#e2e8f0' }} />
                <Bar dataKey="clicks" fill="var(--ff-info)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--ff-border-light)] bg-[var(--ff-neutral)]/70 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold">Engagement by Category</h3>
            <span className="text-xs text-[var(--ff-neutral-muted)]">Checkout Clicks</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsViewModel.categoryEngagement} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#1f2937" strokeDasharray="4 4" />
                <XAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1f2937', color: '#e2e8f0' }} />
                <Bar dataKey="clicks" fill="var(--ff-warning)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--ff-border-light)] bg-[var(--ff-neutral)]/70 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold">Inventory Snapshot</h3>
          <span className="text-xs text-[var(--ff-neutral-muted)]">Stock vs. Clicks</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[var(--ff-ink-muted)]">
              <tr className="border-b border-[var(--ff-border)]">
                <th className="py-2 text-left">Product</th>
                <th className="py-2 text-right">Stock</th>
                <th className="py-2 text-right">Clicks</th>
              </tr>
            </thead>
            <tbody>
              {analyticsViewModel.topProducts.map((item) => (
                <tr key={item.name} className="border-b border-[var(--ff-border)] last:border-0">
                  <td className="py-2 text-[var(--ff-ink)]">{item.name}</td>
                  <td className="py-2 text-right text-[var(--ff-ink-muted)]">{item.stock}</td>
                  <td className="py-2 text-right text-[var(--ff-success-bold)]">{item.clicks.toLocaleString()}</td>
                </tr>
              ))}
              {analyticsViewModel.topProducts.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-[var(--ff-neutral-muted)]">No sales data yet. Create products to start tracking.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}