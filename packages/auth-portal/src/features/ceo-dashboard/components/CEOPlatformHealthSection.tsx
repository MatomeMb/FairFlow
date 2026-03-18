import { MetricCard } from '../../../components/shared/MetricCard';
import { StatusBar } from '../../../components/shared/StatusBar';
import type { AnalyticsDashboard } from '../../../types/analytics';

interface CEOPlatformHealthSectionProps {
  analyticsLoading: boolean;
  analytics: AnalyticsDashboard | null;
  apiOnline: boolean;
  secondsSince: number;
  onRefresh: () => void;
}

export function CEOPlatformHealthSection({ analyticsLoading, analytics, apiOnline, secondsSince, onRefresh }: CEOPlatformHealthSectionProps) {
  return (
    <div className="space-y-6">
      <div className="bg-[var(--ff-neutral)]/70 rounded-lg border border-[var(--ff-border-light)] p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-[var(--ff-ink)]">Platform Health Monitor</h3>
            <p className="text-sm text-[var(--ff-ink-muted)] mt-1">Real-time view of CTO dashboard (Read-Only)</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--ff-neutral-muted)]">
            <div className="w-2 h-2 bg-[var(--ff-success)] rounded-full animate-pulse"></div>
            Auto-refresh: 30s
          </div>
        </div>

        {analyticsLoading ? (
          <div className="text-center py-12 text-[var(--ff-ink-muted)]">Loading analytics...</div>
        ) : (
          <>
            <StatusBar apiOnline={apiOnline} version="v0.6.0" secondsSince={secondsSince} onRefresh={onRefresh} />
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard
                label="Query Cache Hit Rate"
                value={analytics?.cache?.hitRate ? (analytics.cache.hitRate * 100).toFixed(1) : 'N/A'}
                unit="%"
              />
              <MetricCard
                label="Storage Usage"
                value={analytics?.storage?.totalSize ? (analytics.storage.totalSize / 1024 / 1024).toFixed(1) : '0'}
                unit="MB"
              />
              <MetricCard label="Active Queries" value={analytics?.system?.concurrentQueries || 0} />
            </div>

            {analytics?.system && (
              <div className="mt-6 bg-[var(--ff-bg)] rounded-lg border border-[var(--ff-border-light)] p-4">
                <h4 className="text-sm font-semibold text-[var(--ff-ink)] mb-3">Memory Usage</h4>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs text-[var(--ff-ink-muted)] mb-1">
                      <span>Heap Used</span>
                      <span>{(analytics.system.memoryHeap / 1024 / 1024).toFixed(1)} MB</span>
                    </div>
                    <div className="w-full bg-[var(--ff-neutral-subtle)] rounded-full h-2">
                      <div className="bg-[var(--ff-success)] h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-[var(--ff-ink-muted)] mb-1">
                      <span>RSS</span>
                      <span>{(analytics.system.memoryRss / 1024 / 1024).toFixed(1)} MB</span>
                    </div>
                    <div className="w-full bg-[var(--ff-neutral-subtle)] rounded-full h-2">
                      <div className="bg-[var(--ff-info)] h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {analytics?.queryHistogram && analytics.queryHistogram.length > 0 && (
              <div className="mt-6 bg-[var(--ff-bg)] rounded-lg border border-[var(--ff-border-light)] p-4">
                <h4 className="text-sm font-semibold text-[var(--ff-ink)] mb-3">Query Histogram (Last 24h)</h4>
                <div className="flex items-end justify-between h-32 gap-1">
                  {analytics.queryHistogram.slice(0, 24).map((item: { duration: number; count: number }, i: number) => (
                    <div
                      key={i}
                      className="flex-1 bg-[var(--ff-cta)] rounded-t"
                      style={{ height: `${Math.min((item.count / Math.max(...analytics.queryHistogram.map((entry) => entry.count))) * 100, 100)}%` }}
                      title={`${item.duration}ms: ${item.count} queries`}
                    ></div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
