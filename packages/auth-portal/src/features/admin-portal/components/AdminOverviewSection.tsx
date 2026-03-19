import { AlertTriangle, Clock, Shield, Users, Zap } from 'lucide-react';
import { EmptyState } from '../../../components/shared/EmptyState';
import { MetricCard } from '../../../components/shared/MetricCard';
import { OfflineBanner } from '../../../components/shared/OfflineBanner';
import { StatusBar } from '../../../components/shared/StatusBar';
import { formatBytes } from '../../../lib/format';

interface RoleStats {
  ceo: number;
  cto: number;
  merchant: number;
  investor: number;
  consumer: number;
}

export interface AdminOverviewSectionProps {
  apiError: string | null;
  apiOnline: boolean;
  secondsSince: number;
  onRefresh: () => void;
  roleStats: RoleStats;
  usersCount: number;
  pendingKYCCount: number;
  memoryHeap: number;
  storageTotalSize: number;
  errorsCount: number;
}

export function AdminOverviewSection({
  apiError,
  apiOnline,
  secondsSince,
  onRefresh,
  roleStats,
  usersCount,
  pendingKYCCount,
  memoryHeap,
  storageTotalSize,
  errorsCount,
}: AdminOverviewSectionProps) {
  if (apiError) {
    return (
      <>
        <OfflineBanner />
        <div className="p-6">
          <EmptyState
            icon={<AlertTriangle className="w-10 h-10 text-yellow-400" />}
            title="API Offline"
            description="Cannot fetch analytics. Run: cd mcj && npm run demo, then refresh this panel."
            action={{ label: 'Try Again', onClick: onRefresh }}
          />
        </div>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="sr-only">Admin Dashboard</h1>
      <StatusBar apiOnline={apiOnline} version="v0.6.0" secondsSince={secondsSince} onRefresh={onRefresh} />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <MetricCard label="Active Merchants" value={roleStats.merchant.toString()} color="blue" />
          <MetricCard label="Heap Memory" value={memoryHeap.toFixed(2)} unit="MB" />
          <MetricCard label="Storage Used" value={formatBytes(storageTotalSize)} />
          <MetricCard label="Pending KYC" value={pendingKYCCount.toString()} color={pendingKYCCount > 0 ? 'amber' : 'green'} />
          <MetricCard label="Errors (24h)" value={errorsCount} color={errorsCount === 0 ? 'green' : 'red'} />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#1A2D42] border border-[rgba(255,255,255,0.07)] rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">Platform Users</p>
                <p className="text-2xl font-bold text-[var(--ff-ink)] mt-1">{usersCount}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-[#1A2D42] border border-[rgba(255,255,255,0.07)] rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">CEOs</p>
                <p className="text-2xl font-bold text-[var(--ff-ink)] mt-1">{roleStats.ceo}</p>
              </div>
              <Shield className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-[#1A2D42] border border-[rgba(255,255,255,0.07)] rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">CTOs</p>
                <p className="text-2xl font-bold text-[var(--ff-ink)] mt-1">{roleStats.cto}</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-[#1A2D42] border border-[rgba(255,255,255,0.07)] rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">KYC Pending</p>
                <p className="text-2xl font-bold text-[var(--ff-ink)] mt-1">{pendingKYCCount}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
