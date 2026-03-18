import React, { useState, useMemo } from 'react';
import { PortalShell } from '../../components/layout/PortalShell';
import { FairflowLogo } from '../../components/FairflowLogo';
import { useAuth } from '../../context/AuthContext';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useSupabaseUsers } from '../../hooks/useSupabaseUsers';
import { MetricCard } from '../../components/shared/MetricCard';
import { RoleBadge } from '../../components/shared/RoleBadge';
import { StatusBar } from '../../components/shared/StatusBar';
import { Toast } from '../../components/shared/Toast';
import { InvestorMode } from './InvestorMode';
import { BarChart2, Activity, Users, Store, DollarSign, TrendingUp, Settings2, Star, Lock, RefreshCw } from 'lucide-react';
import { SprintStatus } from '../../lib/statusBadges';

type Section = 'overview' | 'platform-health' | 'users-roles' | 'merchants' | 'financials' | 'investor-view' | 'settings';

interface Merchant {
  id: string;
  businessName: string;
  email: string;
  role: 'merchant';
  ethicalScore: number;
  status: 'Active' | 'Pending' | 'Inactive';
  products: number;
  memberSince: string;
}

interface OnboardMerchantForm {
  businessName: string;
  contactEmail: string;
  category: string;
  certifications: string[];
}

export const CEODashboard: React.FC = () => {
  const { signOut } = useAuth();
  const { data: analytics, loading: analyticsLoading, secondsSince, refresh: refreshAnalytics, checkHealth } = useAnalytics(30000);
  const { users, loading: usersLoading, refresh: refreshUsers } = useSupabaseUsers();

  const [apiOnline, setApiOnline] = useState(true);
  const [activeSection, setActiveSection] = useState<Section>('overview');

  // Update page title
  React.useEffect(() => {
    document.title = 'fairflow — CEO Dashboard';
  }, []);
  const roleStats = useMemo(() => {
    const stats = { ceo: 0, cto: 0, merchant: 0, investor: 0, consumer: 0 };
    users.forEach(user => {
      if (user.role in stats) stats[user.role]++;
    });
    return stats;
  }, [users]);

  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [onboardForm, setOnboardForm] = useState<OnboardMerchantForm>({
    businessName: '',
    contactEmail: '',
    category: '',
    certifications: []
  });
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    show: false,
    message: '',
    type: 'info'
  });

  const sections = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'platform-health', label: 'Platform Health', icon: Activity },
    { id: 'users-roles', label: 'Users & Roles', icon: Users },
    { id: 'merchants', label: 'Merchants', icon: Store },
    { id: 'financials', label: 'Financials', icon: DollarSign },
    { id: 'investor-view', label: 'Investor View', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings2 }
  ];

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 4000);
  };

  const handleOnboardMerchant = () => {
    if (!onboardForm.businessName || !onboardForm.contactEmail || !onboardForm.category) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    // Mock submission - email integration coming in Sprint 8
    showToast('Invitation queued — email integration coming in Sprint 8', 'success');
    setShowOnboardModal(false);
    setOnboardForm({
      businessName: '',
      contactEmail: '',
      category: '',
      certifications: []
    });
  };

  const merchants: Merchant[] = users
    .filter(u => u.role === 'merchant')
    .map(u => ({
      id: u.id,
      businessName: `Merchant ${u.user_id.substring(0, 8)}`,
      email: `merchant-${u.user_id.substring(0, 8)}@example.com`,
      role: u.role as 'merchant',
      ethicalScore: 4,
      status: 'Active' as const,
      products: 0,
      memberSince: new Date(u.assigned_at).toLocaleDateString()
    }));

  // Check API health periodically
  React.useEffect(() => {
    const checkApiHealth = async () => {
      const healthy = await checkHealth();
      setApiOnline(healthy);
    };
    checkApiHealth();
    const interval = setInterval(checkApiHealth, 30000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Top KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard
          label="Platform Version"
          value="0.6.0"
          trend="neutral"
        />
        <MetricCard
          label="API Status"
          value={apiOnline ? 'Healthy' : 'Offline'}
          color={apiOnline ? 'green' : 'red'}
        />
        <MetricCard
          label="Total Users"
          value={users.length}
          trend="up"
        />
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

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Role Distribution */}
        <div className="bg-[var(--ff-neutral)]/70 rounded-lg border border-[var(--ff-border-light)] p-6">
          <h3 className="text-lg font-semibold text-[var(--ff-ink)] mb-4">Role Distribution</h3>
          <div className="space-y-3">
            {[
              { role: 'ceo', label: 'CEO', color: 'bg-[var(--ff-primary)]', count: roleStats?.ceo || 0 },
              { role: 'cto', label: 'CTO', color: 'bg-[var(--ff-info)]', count: roleStats?.cto || 0 },
              { role: 'merchant', label: 'Merchant', color: 'bg-[var(--ff-success)]', count: roleStats?.merchant || 0 },
              { role: 'investor', label: 'Investor', color: 'bg-[var(--ff-warning)]', count: roleStats?.investor || 0 },
              { role: 'consumer', label: 'Consumer', color: 'bg-[var(--ff-primary-hover)]', count: roleStats?.consumer || 0 }
            ].map(item => (
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

        {/* Right: System Health */}
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

      {/* Sprint Roadmap Timeline */}
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

  const renderPlatformHealth = () => (
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
            <StatusBar
              apiOnline={apiOnline}
              version="v0.6.0"
              secondsSince={secondsSince}
              onRefresh={refreshAnalytics}
            />

            {/* Analytics Overview */}
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
              <MetricCard
                label="Active Queries"
                value={analytics?.system?.concurrentQueries || 0}
              />
            </div>

            {/* Memory Usage Chart */}
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
                      <div
                        className="bg-[var(--ff-success)] h-2 rounded-full"
                        style={{ width: '65%' }}
                      ></div>
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

            {/* Query Histogram */}
            {analytics?.queryHistogram && analytics.queryHistogram.length > 0 && (
              <div className="mt-6 bg-[var(--ff-bg)] rounded-lg border border-[var(--ff-border-light)] p-4">
                <h4 className="text-sm font-semibold text-[var(--ff-ink)] mb-3">Query Histogram (Last 24h)</h4>
                <div className="flex items-end justify-between h-32 gap-1">
                  {analytics.queryHistogram.slice(0, 24).map((item: { duration: number; count: number }, i: number) => (
                    <div
                      key={i}
                      className="flex-1 bg-[var(--ff-cta)] rounded-t"
                      style={{ height: `${Math.min((item.count / Math.max(...analytics.queryHistogram.map(x => x.count))) * 100, 100)}%` }}
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

  const renderUsersRoles = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          label="Total Users"
          value={users.length}
        />
        <MetricCard
          label="Active Today"
          value={users.length}
        />
        <MetricCard
          label="Pending Invites"
          value={0}
        />
      </div>

      {/* Role Distribution */}
      <div className="bg-[var(--ff-neutral)]/70 rounded-lg border border-[var(--ff-border-light)] p-6">
        <h3 className="text-lg font-semibold text-[var(--ff-ink)] mb-4">Role Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { role: 'CEO', count: roleStats?.ceo || 0, color: 'bg-[var(--ff-primary)]' },
            { role: 'CTO', count: roleStats?.cto || 0, color: 'bg-[var(--ff-info)]' },
            { role: 'Merchant', count: roleStats?.merchant || 0, color: 'bg-[var(--ff-success)]' },
            { role: 'Investor', count: roleStats?.investor || 0, color: 'bg-[var(--ff-warning)]' },
            { role: 'Consumer', count: roleStats?.consumer || 0, color: 'bg-[var(--ff-primary-hover)]' }
          ].map(item => (
            <div key={item.role} className="text-center">
              <div className={`${item.color} rounded-lg p-4 mb-2`}>
                <div className="text-2xl font-bold text-[var(--ff-ink)]">{item.count}</div>
              </div>
              <div className="text-sm text-[var(--ff-ink-muted)]">{item.role}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[var(--ff-neutral)]/70 rounded-lg border border-[var(--ff-border-light)]">
        <div className="p-6 border-b border-[var(--ff-border-light)] flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[var(--ff-ink)]">All Users</h3>
            <p className="text-sm text-[var(--ff-ink-muted)] mt-1 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[var(--ff-warning)]" />
              Read-only view — Role changes managed by CTO
            </p>
          </div>
          <button
            onClick={() => refreshUsers()}
            className="h-9 px-4 bg-[var(--ff-neutral-subtle)] hover:bg-[var(--ff-neutral)]/70 text-[var(--ff-ink)] rounded-lg transition-colors focus:ring-2 focus:ring-[var(--ff-focus)]/50"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--ff-bg)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--ff-ink-muted)] uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--ff-ink-muted)] uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--ff-ink-muted)] uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--ff-ink-muted)] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--ff-border-mid)]">
              {usersLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-[var(--ff-ink-muted)]">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-[var(--ff-ink-muted)]">No users found</td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="hover:bg-[var(--ff-neutral-subtle)]">
                    <td className="px-6 py-4">
                      <div className="text-sm text-[var(--ff-ink)] font-medium">{user.user_id.substring(0, 24)}...</div>
                      <div className="text-xs text-[var(--ff-neutral-muted)]">{user.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[var(--ff-ink-muted)]">
                        {new Date(user.assigned_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          disabled
                          title="Role changes managed by CTO"
                          className="text-[var(--ff-neutral-muted)] cursor-not-allowed"
                        >
                          <Lock className="w-3.5 h-3.5 text-[var(--ff-warning)]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderMerchants = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--ff-ink)]">Merchants ({merchants.length} active)</h2>
          <p className="text-[var(--ff-ink-muted)] mt-1">Manage ethical merchant partners</p>
        </div>
        <button
          onClick={() => setShowOnboardModal(true)}
          className="px-6 py-3 bg-[var(--ff-cta)] hover:bg-[var(--ff-cta-hover)] text-[var(--ff-neutral)] rounded-lg font-semibold transition-colors flex items-center gap-2"
        >
          <span>+</span>
          Onboard Merchant
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Active Merchants"
          value={merchants.length}
        />
        <MetricCard
          label="Total Products"
          value={0}
        />
        <MetricCard
          label="Avg Ethical Score"
          value="4.0/5"
        />
        <MetricCard
          label="Pending Applications"
          value={0}
        />
      </div>

      {/* Merchant Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {merchants.map(merchant => (
          <div key={merchant.id} className="bg-[var(--ff-neutral)]/70 rounded-lg border border-[var(--ff-border-light)] p-6 hover:border-[var(--ff-cta)] transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-[var(--ff-ink)] font-semibold">{merchant.businessName}</h3>
                <p className="text-sm text-[var(--ff-ink-muted)]">{merchant.email}</p>
              </div>
              <RoleBadge role={merchant.role} />
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[var(--ff-ink-muted)]">Ethical Score</span>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < merchant.ethicalScore ? 'fill-[var(--ff-warning)] text-[var(--ff-warning)]' : 'text-[var(--ff-neutral-muted)]'}`} />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--ff-ink-muted)]">Status</span>
                <span className="text-[var(--ff-success)] font-semibold">{merchant.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--ff-ink-muted)]">Products</span>
                <span className="text-[var(--ff-ink)]">{merchant.products}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--ff-ink-muted)]">Member Since</span>
                <span className="text-[var(--ff-ink)]">{merchant.memberSince}</span>
              </div>
            </div>
          </div>
        ))}
        {merchants.length === 0 && (
          <div className="col-span-full bg-[var(--ff-neutral)]/70 rounded-lg border border-[var(--ff-border-light)] p-12 text-center">
            <p className="text-[var(--ff-ink-muted)] mb-4">No merchants onboarded yet</p>
            <button
              onClick={() => setShowOnboardModal(true)}
              className="px-6 py-3 bg-[var(--ff-cta)] hover:bg-[var(--ff-cta-hover)] text-[var(--ff-neutral)] rounded-lg font-semibold transition-colors"
            >
              Onboard First Merchant
            </button>
          </div>
        )}
      </div>

      {/* Onboard Modal */}
      {showOnboardModal && (
        <div className="fixed inset-0 bg-[var(--ff-neutral-bold)]/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--ff-neutral)]/70 rounded-lg border border-[var(--ff-border-light)] max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-[var(--ff-ink)] mb-4">Onboard New Merchant</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--ff-form-label)] mb-2">Business Name *</label>
                <input
                  type="text"
                  value={onboardForm.businessName}
                  onChange={e => setOnboardForm({ ...onboardForm, businessName: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--ff-bg)] border border-[var(--ff-border-light)] rounded-lg text-[var(--ff-form-text)] focus:outline-none focus:border-[var(--ff-focus)]"
                  placeholder="Enter business name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--ff-form-label)] mb-2">Contact Email *</label>
                <input
                  type="email"
                  value={onboardForm.contactEmail}
                  onChange={e => setOnboardForm({ ...onboardForm, contactEmail: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--ff-bg)] border border-[var(--ff-border-light)] rounded-lg text-[var(--ff-form-text)] focus:outline-none focus:border-[var(--ff-focus)]"
                  placeholder="merchant@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--ff-form-label)] mb-2">Category *</label>
                <select
                  value={onboardForm.category}
                  onChange={e => setOnboardForm({ ...onboardForm, category: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--ff-bg)] border border-[var(--ff-border-light)] rounded-lg text-[var(--ff-form-text)] focus:outline-none focus:border-[var(--ff-focus)]"
                >
                  <option value="">Select category</option>
                  <option value="food">Food & Beverage</option>
                  <option value="fashion">Fashion & Apparel</option>
                  <option value="home">Home & Living</option>
                  <option value="beauty">Beauty & Wellness</option>
                  <option value="tech">Technology</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--ff-form-label)] mb-2">Ethical Certifications</label>
                <div className="space-y-2">
                  {['Fair Trade', 'Organic', 'B-Corp', 'Carbon Neutral', 'Local Sourced'].map(cert => (
                    <label key={cert} className="flex items-center gap-2 text-[var(--ff-form-text)]">
                      <input
                        type="checkbox"
                        checked={onboardForm.certifications.includes(cert)}
                        onChange={e => {
                          if (e.target.checked) {
                            setOnboardForm({ ...onboardForm, certifications: [...onboardForm.certifications, cert] });
                          } else {
                            setOnboardForm({
                              ...onboardForm,
                              certifications: onboardForm.certifications.filter(c => c !== cert)
                            });
                          }
                        }}
                        className="rounded border-[var(--ff-border-light)] text-[var(--ff-cta)] focus:ring-[var(--ff-focus)]"
                      />
                      <span className="text-sm">{cert}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowOnboardModal(false)}
                className="flex-1 px-4 py-2 bg-[var(--ff-neutral-subtle)] hover:bg-[var(--ff-neutral)] text-[var(--ff-ink)] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleOnboardMerchant}
                className="flex-1 px-4 py-2 bg-[var(--ff-cta)] hover:bg-[var(--ff-cta-hover)] text-[var(--ff-neutral)] rounded-lg font-semibold transition-colors"
              >
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderFinancials = () => (
    <div className="space-y-6">
      {/* Revenue Model Summary */}
      <div className="bg-[var(--ff-neutral)]/70 rounded-lg border border-[var(--ff-border-light)] p-6">
        <h3 className="text-xl font-semibold text-[var(--ff-ink)] mb-4">Revenue Model Summary</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-[var(--ff-border-light)]">
            <span className="text-[var(--ff-neutral-bold)]">Model Type</span>
            <span className="text-[var(--ff-ink)] font-semibold">Commission-based</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-[var(--ff-border-light)]">
            <span className="text-[var(--ff-neutral-bold)]">PayFast Integration</span>
            <span className="flex items-center gap-2">
              <SprintStatus status="upcoming" />
              <span className="text-[var(--ff-neutral-muted)] text-sm">(3.5% + R2 per transaction)</span>
            </span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-[var(--ff-border-light)]">
            <span className="text-[var(--ff-neutral-bold)]">Stripe Integration</span>
            <span className="flex items-center gap-2">
              <SprintStatus status="upcoming" />
              <span className="text-[var(--ff-neutral-muted)] text-sm">(2.9% + R5.50 per transaction)</span>
            </span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-[var(--ff-neutral-bold)]">Commission Tracking</span>
            <SprintStatus status="upcoming" />
          </div>
        </div>
      </div>

      {/* Current Budget */}
      <div className="bg-[var(--ff-neutral)]/70 rounded-lg border border-[var(--ff-border-light)] p-6">
        <h3 className="text-xl font-semibold text-[var(--ff-ink)] mb-4">Current Monthly Budget</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-[var(--ff-neutral-bold)]">Cursor AI Subscription</span>
            <span className="text-[var(--ff-ink)] font-mono">R665</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-[var(--ff-neutral-bold)]">Domain + Chrome Store</span>
            <span className="text-[var(--ff-ink)] font-mono">R170</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-[var(--ff-neutral-bold)]">Dev Tools & Services</span>
            <span className="text-[var(--ff-ink)] font-mono">R2,665</span>
          </div>
          <div className="border-t border-[var(--ff-border-light)] pt-3 mt-3">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-[var(--ff-ink)]">Total</span>
              <span className="text-xl font-bold text-[var(--ff-success)]">R3,500</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[var(--ff-ink-muted)]">Remaining</span>
              <span className="text-[var(--ff-ink-muted)] font-mono">R0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Projected Operating Costs */}
      <div className="bg-[var(--ff-neutral)]/70 rounded-lg border border-[var(--ff-border-light)] p-6">
        <h3 className="text-xl font-semibold text-[var(--ff-ink)] mb-4">Projected Monthly Operating Costs</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--ff-bg)]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--ff-ink-muted)] uppercase">Service</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--ff-ink-muted)] uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--ff-ink-muted)] uppercase">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--ff-border-mid)]">
              <tr>
                <td className="px-4 py-3 text-[var(--ff-neutral-bold)]">Supabase (Free Tier)</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-[var(--ff-success)] text-[var(--ff-neutral)] text-xs rounded-lg font-medium"><SprintStatus status="complete" /></span>
                </td>
                <td className="px-4 py-3 text-right text-[var(--ff-ink)] font-mono">R0</td>
              </tr>

              <tr>
                <td className="px-4 py-3 text-[var(--ff-neutral-bold)]">AI Chat (~estimated)</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-[var(--ff-neutral-subtle)] text-[var(--ff-ink)] text-xs rounded-full">Sprint 9</span>
                </td>
                <td className="px-4 py-3 text-right text-[var(--ff-ink)] font-mono">~R90/mo</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-[var(--ff-neutral-bold)]">VPS Email (Stalwart)</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-[var(--ff-neutral-subtle)] text-[var(--ff-ink)] text-xs rounded-full">Sprint 12</span>
                </td>
                <td className="px-4 py-3 text-right text-[var(--ff-ink)] font-mono">~R85/mo</td>
              </tr>

              <tr>
                <td className="px-4 py-3 text-[var(--ff-neutral-bold)]">Supabase Pro (&gt;50K users)</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-[var(--ff-neutral-subtle)] text-[var(--ff-ink)] text-xs rounded-full">Future</span>
                </td>
                <td className="px-4 py-3 text-right text-[var(--ff-ink)] font-mono">~R450/mo</td>
              </tr>
              <tr className="bg-[var(--ff-bg)] font-semibold">
                <td className="px-4 py-3 text-[var(--ff-ink)]">Total Range</td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3 text-right text-[var(--ff-success)]">R0 → R790/mo</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderInvestorView = () => (
    <div className="space-y-6">
      <div className="bg-[var(--ff-info-subtle)] border border-[var(--ff-info-bold)] rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <TrendingUp className="w-6 h-6 text-[var(--ff-info)]" />
          <div>
            <h3 className="text-[var(--ff-info)] font-semibold mb-1">[Investor Preview Mode]</h3>
            <p className="text-[var(--ff-info)] text-sm">
              This is what investors see when they log into /dashboard/investor. You are viewing as CEO.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[var(--ff-neutral)]/70 rounded-lg border-2 border-[var(--ff-warning-border)] p-1">
        <div className="bg-[var(--ff-bg)] rounded p-6">
          <InvestorMode />
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      {/* Company Configuration */}
      <div className="bg-[var(--ff-neutral)]/70 rounded-lg border border-[var(--ff-border-light)] p-6">
        <h3 className="text-xl font-semibold text-[var(--ff-ink)] mb-6">Company Configuration</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--ff-ink-muted)] mb-1">Company Name</label>
              <div className="text-[var(--ff-ink)] font-semibold">fairflow</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--ff-ink-muted)] mb-1">Version</label>
              <div className="flex items-center gap-2">
                <span className="text-[var(--ff-ink)] font-semibold">0.6.0</span>
                <span className="px-2 py-0.5 bg-[var(--ff-success)] text-[var(--ff-neutral)] text-xs rounded-full">Latest</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--ff-ink-muted)] mb-1">Environment</label>
              <div className="flex items-center gap-2">
                <span className="text-[var(--ff-ink)]">Development</span>
                <span className="px-2 py-0.5 bg-[var(--ff-warning)] text-[var(--ff-neutral)] text-xs rounded-full">Dev</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--ff-ink-muted)] mb-1">Domain</label>
              <div className="flex items-center gap-2">
                <span className="text-[var(--ff-ink)]">fairflow.co.za</span>
                <span className="px-2 py-0.5 bg-[var(--ff-warning-bold)] text-[var(--ff-neutral)] text-xs rounded-full">Pending - Sprint 7</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--ff-ink-muted)] mb-1">Chrome Web Store</label>
              <div className="flex items-center gap-2">
                <span className="text-[var(--ff-ink-muted)]">Not submitted</span>
                <span className="px-2 py-0.5 bg-[var(--ff-neutral-subtle)] text-[var(--ff-ink)] text-xs rounded-full">Sprint 8</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--ff-ink-muted)] mb-1">Email Provider</label>
              <div className="flex items-center gap-2">
                <span className="text-[var(--ff-ink)]">Zoho Free</span>
                <span className="px-2 py-0.5 bg-[var(--ff-success)] text-[var(--ff-neutral)] text-xs rounded-full">Sprint 7</span>
                <span className="text-[var(--ff-neutral-muted)] text-xs">-&gt; Stalwart (Sprint 12)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--ff-ink-muted)] mb-1">Talent Pipeline</label>
              <div className="flex items-center gap-2">
                <span className="text-[var(--ff-success)] font-semibold">Active</span>
                <span className="px-2 py-0.5 bg-[var(--ff-success-subtle)] text-[var(--ff-neutral)] text-xs rounded-full">CTO-managed</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--ff-ink-muted)] mb-1">AI Agent</label>
              <div className="flex items-center gap-2">
                <span className="text-[var(--ff-ink-muted)]">Not configured</span>
                <span className="px-2 py-0.5 bg-[var(--ff-neutral-subtle)] text-[var(--ff-ink)] text-xs rounded-full">Sprint 9</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Configuration */}
      <div className="bg-[var(--ff-neutral)]/70 rounded-lg border border-[var(--ff-border-light)] p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-[var(--ff-ink)]">Auth Configuration</h3>
          <span className="px-3 py-1 bg-[var(--ff-neutral-subtle)] text-[var(--ff-ink-muted)] text-sm rounded-full">Read-Only</span>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--ff-ink-muted)] mb-1">Auth Provider</label>
              <div className="flex items-center gap-2">
                <span className="text-[var(--ff-ink)] font-semibold">Supabase Auth</span>
                <SprintStatus status="complete" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--ff-ink-muted)] mb-1">Custom Hook</label>
              <div className="flex items-center gap-2">
                <span className="text-[var(--ff-ink)]">custom-access-token-hook</span>
                <span className="px-2 py-0.5 bg-[var(--ff-success)] text-[var(--ff-neutral)] text-xs rounded-full">Active</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--ff-ink-muted)] mb-1">Roles Configured</label>
              <div className="text-[var(--ff-ink)] font-semibold">5 roles</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--ff-ink-muted)] mb-1">Permission Rules</label>
              <div className="text-[var(--ff-ink)] font-semibold">16 rules</div>
            </div>
          </div>

          <div className="border-t border-[var(--ff-border-light)] pt-4">
            <label className="block text-sm font-medium text-[var(--ff-ink-muted)] mb-3">Authentication Methods</label>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 px-4 bg-[var(--ff-bg)] rounded-lg">
                <span className="text-[var(--ff-neutral-bold)]">Google OAuth</span>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-[var(--ff-success)] text-[var(--ff-neutral)] text-xs rounded-lg font-medium"><SprintStatus status="complete" /></span>
                </div>
              </div>
              <div className="flex items-center justify-between py-2 px-4 bg-[var(--ff-bg)] rounded-lg">
                <span className="text-[var(--ff-neutral-bold)]">Email/Password</span>
                <SprintStatus status="complete" /> Enabled
              </div>
              <div className="flex items-center justify-between py-2 px-4 bg-[var(--ff-bg)] rounded-lg">
                <span className="text-[var(--ff-neutral-bold)]">Phone/SMS</span>
                <span className="text-[var(--ff-neutral-muted)]">Not enabled</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'platform-health':
        return renderPlatformHealth();
      case 'users-roles':
        return renderUsersRoles();
      case 'merchants':
        return renderMerchants();
      case 'financials':
        return renderFinancials();
      case 'investor-view':
        return renderInvestorView();
      case 'settings':
        return renderSettings();
      default:
        return renderOverview();
    }
  };

  return (
    <PortalShell
      title={<FairflowLogo markHeight={32} variant="dark" />}
      version="v0.6.0"
      nav={sections}
      activeSection={activeSection}
      onNavChange={(id) => setActiveSection(id as Section)}
      onLogout={signOut}
    >
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">
          {renderContent()}
        </div>
      </div>

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast({ show: false, message: '', type: 'info' })}
        />
      )}
    </PortalShell>
  );
};
