import { MetricCard } from '../../../components/shared/MetricCard';
import { SprintStatus } from '../../../lib/statusBadges';
import type { AnalyticsDashboard } from '../../../types/analytics';

interface CEORoleStats {
  ceo: number;
  cto: number;
  merchant: number;
  investor: number;
  consumer: number;
}

interface CEOOverviewSectionProps {
  apiOnline: boolean;
  usersCount: number;
  roleStats: CEORoleStats;
  analytics: AnalyticsDashboard | null;
}

export function CEOOverviewSection({ apiOnline, usersCount, roleStats, analytics }: CEOOverviewSectionProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard label="Platform Version" value="0.6.0" trend="neutral" />
        <MetricCard label="API Status" value={apiOnline ? 'Healthy' : 'Offline'} color={apiOnline ? 'green' : 'red'} />
        <MetricCard label="Total Users" value={usersCount} trend="up" />
        <MetricCard
          label="Storage Used"
          value={analytics?.storage?.totalSize ? (analytics.storage.totalSize / 1024 / 1024).toFixed(1) : '0'}
          unit="MB"
        />
        <MetricCard
          label="Error Rate"
          value={analytics?.errors?.count || 0}
          color={analytics?.errors?.count && analytics.errors.count > 0 ? 'red' : 'green'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--ff-neutral)]/70 rounded-lg border border-[var(--ff-border-light)] p-6">
          <h3 className="text-lg font-semibold text-[var(--ff-ink)] mb-4">Role Distribution</h3>
          <div className="space-y-3">
            {[
              { role: 'ceo', label: 'CEO', color: 'bg-[var(--ff-primary)]', count: roleStats.ceo },
              { role: 'cto', label: 'CTO', color: 'bg-[var(--ff-info)]', count: roleStats.cto },
              { role: 'merchant', label: 'Merchant', color: 'bg-[var(--ff-success)]', count: roleStats.merchant },
              { role: 'investor', label: 'Investor', color: 'bg-[var(--ff-warning)]', count: roleStats.investor },
              { role: 'consumer', label: 'Consumer', color: 'bg-[var(--ff-primary-hover)]', count: roleStats.consumer },
            ].map((item) => (
              <div key={item.role} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="text-[var(--ff-neutral-bold)]">{item.label}</span>
                </div>
                <span className="text-[var(--ff-ink)] font-semibold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--ff-neutral)]/70 rounded-lg border border-[var(--ff-border-light)] p-6">
          <h3 className="text-lg font-semibold text-[var(--ff-ink)] mb-4">System Health</h3>
          <div className="space-y-3">
            {analytics?.system && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--ff-ink-muted)]">Heap Usage</span>
                  <span className="text-[var(--ff-ink)] font-mono">{(analytics.system.memoryHeap / 1024 / 1024).toFixed(1)} MB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--ff-ink-muted)]">RSS Memory</span>
                  <span className="text-[var(--ff-ink)] font-mono">{(analytics.system.memoryRss / 1024 / 1024).toFixed(1)} MB</span>
                </div>
              </>
            )}
            {analytics?.cache && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--ff-ink-muted)]">Cache Hit Rate</span>
                  <span className="text-[var(--ff-success)] font-semibold">
                    {analytics.cache.hitRate ? `${(analytics.cache.hitRate * 100).toFixed(1)}%` : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--ff-ink-muted)]">Cached Queries</span>
                  <span className="text-[var(--ff-ink)] font-mono">{analytics.cache.size || 0}</span>
                </div>
              </>
            )}
            {analytics?.preAggregation && (
              <div className="flex items-center justify-between">
                <span className="text-[var(--ff-ink-muted)]">Pre-Aggregations</span>
                <span className="text-[var(--ff-ink)] font-mono">{analytics.preAggregation.files || 0}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-[var(--ff-neutral)]/70 rounded-lg border border-[var(--ff-border-light)] p-6">
        <h3 className="text-lg font-semibold text-[var(--ff-ink)] mb-6">Sprint Roadmap Timeline</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-[var(--ff-success)] rounded-full flex items-center justify-center text-[var(--ff-neutral)] font-bold">
              <SprintStatus status="complete" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h4 className="text-[var(--ff-ink)] font-semibold">Sprint 7</h4>
                <SprintStatus status="complete" />
              </div>
              <p className="text-[var(--ff-ink-muted)] text-sm">Foundation - Domain, Email, Auth, Google OAuth</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-[var(--ff-info)] rounded-full flex items-center justify-center text-[var(--ff-neutral)] font-bold">
              <SprintStatus status="in-progress" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h4 className="text-[var(--ff-ink)] font-semibold">Sprint 8</h4>
                <SprintStatus status="in-progress" />
              </div>
              <p className="text-[var(--ff-ink-muted)] text-sm">Commerce - Chrome Store, PayFast, Merchant Portal</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-[var(--ff-neutral-subtle)] rounded-full flex items-center justify-center text-[var(--ff-ink)] font-bold">
              <SprintStatus status="upcoming" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h4 className="text-[var(--ff-ink)] font-semibold">Sprint 9</h4>
                <SprintStatus status="upcoming" />
              </div>
              <p className="text-[var(--ff-ink-muted)] text-sm">Intelligence - AI Assistant, Investor Mode</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-[var(--ff-neutral-subtle)] rounded-full flex items-center justify-center text-[var(--ff-ink)] font-bold">
              <SprintStatus status="upcoming" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h4 className="text-[var(--ff-ink)] font-semibold">Sprint 10</h4>
                <SprintStatus status="upcoming" />
              </div>
              <p className="text-[var(--ff-ink-muted)] text-sm">Growth - Voice, Talent Pipeline, Analytics</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
