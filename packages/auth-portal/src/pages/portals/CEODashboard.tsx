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
        <div className="bg-white/70 rounded-lg border border-[var(--ff-border)] p-6">
          <h3 className="text-lg font-semibold text-[var(--ff-ink)] mb-4">Role Distribution</h3>
          <div className="space-y-3">
            {[
              { role: 'ceo', label: 'CEO', color: 'bg-purple-500', count: roleStats?.ceo || 0 },
              { role: 'cto', label: 'CTO', color: 'bg-blue-500', count: roleStats?.cto || 0 },
              { role: 'merchant', label: 'Merchant', color: 'bg-emerald-500', count: roleStats?.merchant || 0 },
              { role: 'investor', label: 'Investor', color: 'bg-yellow-500', count: roleStats?.investor || 0 },
              { role: 'consumer', label: 'Consumer', color: 'bg-pink-500', count: roleStats?.consumer || 0 }
            ].map(item => (
              <div key={item.role} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="text-stone-700">{item.label}</span>
                </div>
                <span className="text-[var(--ff-ink)] font-semibold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: System Health */}
        <div className="bg-white/70 rounded-lg border border-[var(--ff-border)] p-6">
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
                  <span className="text-emerald-400 font-semibold">
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
      <div className="bg-white/70 rounded-lg border border-[var(--ff-border)] p-6">
        <h3 className="text-lg font-semibold text-[var(--ff-ink)] mb-6">Sprint Roadmap Timeline</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
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
            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
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
            <div className="flex-shrink-0 w-8 h-8 bg-stone-200 rounded-full flex items-center justify-center text-[var(--ff-ink)] font-bold">
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
            <div className="flex-shrink-0 w-8 h-8 bg-stone-200 rounded-full flex items-center justify-center text-[var(--ff-ink)] font-bold">
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
      <div className="bg-white/70 rounded-lg border border-[var(--ff-border)] p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-[var(--ff-ink)]">Platform Health Monitor</h3>
            <p className="text-sm text-[var(--ff-ink-muted)] mt-1">Real-time view of CTO dashboard (Read-Only)</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
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
              <div className="mt-6 bg-[var(--ff-bg)] rounded-lg border border-[var(--ff-border)] p-4">
                <h4 className="text-sm font-semibold text-[var(--ff-ink)] mb-3">Memory Usage</h4>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs text-[var(--ff-ink-muted)] mb-1">
                      <span>Heap Used</span>
                      <span>{(analytics.system.memoryHeap / 1024 / 1024).toFixed(1)} MB</span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: '65%' }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-[var(--ff-ink-muted)] mb-1">
                      <span>RSS</span>
                      <span>{(analytics.system.memoryRss / 1024 / 1024).toFixed(1)} MB</span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Query Histogram */}
            {analytics?.queryHistogram && analytics.queryHistogram.length > 0 && (
              <div className="mt-6 bg-[var(--ff-bg)] rounded-lg border border-[var(--ff-border)] p-4">
                <h4 className="text-sm font-semibold text-[var(--ff-ink)] mb-3">Query Histogram (Last 24h)</h4>
                <div className="flex items-end justify-between h-32 gap-1">
                  {analytics.queryHistogram.slice(0, 24).map((item: { duration: number; count: number }, i: number) => (
                    <div
                      key={i}
                      className="flex-1 bg-emerald-600 rounded-t"
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
      <div className="bg-white/70 rounded-lg border border-[var(--ff-border)] p-6">
        <h3 className="text-lg font-semibold text-[var(--ff-ink)] mb-4">Role Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { role: 'CEO', count: roleStats?.ceo || 0, color: 'bg-purple-500' },
            { role: 'CTO', count: roleStats?.cto || 0, color: 'bg-blue-500' },
            { role: 'Merchant', count: roleStats?.merchant || 0, color: 'bg-emerald-500' },
            { role: 'Investor', count: roleStats?.investor || 0, color: 'bg-yellow-500' },
            { role: 'Consumer', count: roleStats?.consumer || 0, color: 'bg-pink-500' }
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
      <div className="bg-white/70 rounded-lg border border-[var(--ff-border)]">
        <div className="p-6 border-b border-[var(--ff-border)] flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[var(--ff-ink)]">All Users</h3>
            <p className="text-sm text-[var(--ff-ink-muted)] mt-1 flex items-center gap-2">
              <Lock className="w-4 h-4 text-yellow-500" />
              Read-only view — Role changes managed by CTO
            </p>
          </div>
          <button
            onClick={() => refreshUsers()}
            className="h-9 px-4 bg-stone-100 hover:bg-stone-200/70 text-[var(--ff-ink)] rounded-lg transition-colors focus:ring-2 focus:ring-emerald-500/50"
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
            <tbody className="divide-y divide-stone-800">
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
                  <tr key={user.id} className="hover:bg-stone-200/60">
                    <td className="px-6 py-4">
                      <div className="text-sm text-[var(--ff-ink)] font-medium">{user.user_id.substring(0, 24)}...</div>
                      <div className="text-xs text-stone-500">{user.id}</div>
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
                          className="text-stone-600 cursor-not-allowed"
                        >
                          <Lock className="w-3.5 h-3.5 text-yellow-500" />
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
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
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
          <div key={merchant.id} className="bg-white/70 rounded-lg border border-[var(--ff-border)] p-6 hover:border-emerald-600 transition-colors">
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
                    <Star key={i} className={`w-4 h-4 ${i < merchant.ethicalScore ? 'fill-yellow-400 text-yellow-400' : 'text-stone-600'}`} />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--ff-ink-muted)]">Status</span>
                <span className="text-emerald-400 font-semibold">{merchant.status}</span>
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
          <div className="col-span-full bg-white/70 rounded-lg border border-[var(--ff-border)] p-12 text-center">
            <p className="text-[var(--ff-ink-muted)] mb-4">No merchants onboarded yet</p>
            <button
              onClick={() => setShowOnboardModal(true)}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors"
            >
              Onboard First Merchant
            </button>
          </div>
        )}
      </div>

      {/* Onboard Modal */}
      {showOnboardModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/70 rounded-lg border border-[var(--ff-border)] max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-[var(--ff-ink)] mb-4">Onboard New Merchant</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Business Name *</label>
                <input
                  type="text"
                  value={onboardForm.businessName}
                  onChange={e => setOnboardForm({ ...onboardForm, businessName: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--ff-bg)] border border-[var(--ff-border)] rounded-lg text-stone-900 placeholder:text-stone-500 focus:outline-none focus:border-emerald-500"
                  placeholder="Enter business name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Contact Email *</label>
                <input
                  type="email"
                  value={onboardForm.contactEmail}
                  onChange={e => setOnboardForm({ ...onboardForm, contactEmail: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--ff-bg)] border border-[var(--ff-border)] rounded-lg text-stone-900 placeholder:text-stone-500 focus:outline-none focus:border-emerald-500"
                  placeholder="merchant@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Category *</label>
                <select
                  value={onboardForm.category}
                  onChange={e => setOnboardForm({ ...onboardForm, category: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--ff-bg)] border border-[var(--ff-border)] rounded-lg text-stone-900 placeholder:text-stone-500 focus:outline-none focus:border-emerald-500"
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
                <label className="block text-sm font-medium text-stone-700 mb-2">Ethical Certifications</label>
                <div className="space-y-2">
                  {['Fair Trade', 'Organic', 'B-Corp', 'Carbon Neutral', 'Local Sourced'].map(cert => (
                    <label key={cert} className="flex items-center gap-2 text-stone-700">
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
                        className="rounded border-[var(--ff-border)] text-emerald-600 focus:ring-emerald-500"
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
                className="flex-1 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-[var(--ff-ink)] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleOnboardMerchant}
                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors"
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
      <div className="bg-white/70 rounded-lg border border-[var(--ff-border)] p-6">
        <h3 className="text-xl font-semibold text-[var(--ff-ink)] mb-4">Revenue Model Summary</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-[var(--ff-border)]">
            <span className="text-stone-700">Model Type</span>
            <span className="text-[var(--ff-ink)] font-semibold">Commission-based</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-[var(--ff-border)]">
            <span className="text-stone-700">PayFast Integration</span>
            <span className="flex items-center gap-2">
              <SprintStatus status="upcoming" />
              <span className="text-stone-500 text-sm">(3.5% + R2 per transaction)</span>
            </span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-[var(--ff-border)]">
            <span className="text-stone-700">Stripe Integration</span>
            <span className="flex items-center gap-2">
              <SprintStatus status="upcoming" />
              <span className="text-stone-500 text-sm">(2.9% + R5.50 per transaction)</span>
            </span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-stone-700">Commission Tracking</span>
            <SprintStatus status="upcoming" />
          </div>
        </div>
      </div>

      {/* Current Budget */}
      <div className="bg-white/70 rounded-lg border border-[var(--ff-border)] p-6">
        <h3 className="text-xl font-semibold text-[var(--ff-ink)] mb-4">Current Monthly Budget</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-stone-700">Cursor AI Subscription</span>
            <span className="text-[var(--ff-ink)] font-mono">R665</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-stone-700">Domain + Chrome Store</span>
            <span className="text-[var(--ff-ink)] font-mono">R170</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-stone-700">Dev Tools & Services</span>
            <span className="text-[var(--ff-ink)] font-mono">R2,665</span>
          </div>
          <div className="border-t border-[var(--ff-border)] pt-3 mt-3">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-[var(--ff-ink)]">Total</span>
              <span className="text-xl font-bold text-emerald-400">R3,500</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[var(--ff-ink-muted)]">Remaining</span>
              <span className="text-[var(--ff-ink-muted)] font-mono">R0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Projected Operating Costs */}
      <div className="bg-white/70 rounded-lg border border-[var(--ff-border)] p-6">
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
            <tbody className="divide-y divide-stone-800">
              <tr>
                <td className="px-4 py-3 text-stone-700">Supabase (Free Tier)</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-emerald-600 text-white text-xs rounded-lg font-medium"><SprintStatus status="complete" /></span>
                </td>
                <td className="px-4 py-3 text-right text-[var(--ff-ink)] font-mono">R0</td>
              </tr>

              <tr>
                <td className="px-4 py-3 text-stone-700">AI Chat (~estimated)</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-stone-200 text-[var(--ff-ink)] text-xs rounded-full">Sprint 9</span>
                </td>
                <td className="px-4 py-3 text-right text-[var(--ff-ink)] font-mono">~R90/mo</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-stone-700">VPS Email (Stalwart)</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-stone-200 text-[var(--ff-ink)] text-xs rounded-full">Sprint 12</span>
                </td>
                <td className="px-4 py-3 text-right text-[var(--ff-ink)] font-mono">~R85/mo</td>
              </tr>

              <tr>
                <td className="px-4 py-3 text-stone-700">Supabase Pro (&gt;50K users)</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-stone-200 text-[var(--ff-ink)] text-xs rounded-full">Future</span>
                </td>
                <td className="px-4 py-3 text-right text-[var(--ff-ink)] font-mono">~R450/mo</td>
              </tr>
              <tr className="bg-[var(--ff-bg)] font-semibold">
                <td className="px-4 py-3 text-[var(--ff-ink)]">Total Range</td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3 text-right text-emerald-400">R0 → R790/mo</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderInvestorView = () => (
    <div className="space-y-6">
      <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <TrendingUp className="w-6 h-6 text-blue-300" />
          <div>
            <h3 className="text-blue-300 font-semibold mb-1">[Investor Preview Mode]</h3>
            <p className="text-blue-200 text-sm">
              This is what investors see when they log into /dashboard/investor. You are viewing as CEO.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white/70 rounded-lg border-2 border-yellow-500/50 p-1">
        <div className="bg-[var(--ff-bg)] rounded p-6">
          <InvestorMode />
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      {/* Company Configuration */}
      <div className="bg-white/70 rounded-lg border border-[var(--ff-border)] p-6">
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
                <span className="px-2 py-0.5 bg-emerald-600 text-white text-xs rounded-full">Latest</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--ff-ink-muted)] mb-1">Environment</label>
              <div className="flex items-center gap-2">
                <span className="text-[var(--ff-ink)]">Development</span>
                <span className="px-2 py-0.5 bg-yellow-600 text-white text-xs rounded-full">Dev</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--ff-ink-muted)] mb-1">Domain</label>
              <div className="flex items-center gap-2">
                <span className="text-[var(--ff-ink)]">fairflow.co.za</span>
                <span className="px-2 py-0.5 bg-yellow-700 text-white text-xs rounded-full">Pending - Sprint 7</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--ff-ink-muted)] mb-1">Chrome Web Store</label>
              <div className="flex items-center gap-2">
                <span className="text-[var(--ff-ink-muted)]">Not submitted</span>
                <span className="px-2 py-0.5 bg-stone-200 text-[var(--ff-ink)] text-xs rounded-full">Sprint 8</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--ff-ink-muted)] mb-1">Email Provider</label>
              <div className="flex items-center gap-2">
                <span className="text-[var(--ff-ink)]">Zoho Free</span>
                <span className="px-2 py-0.5 bg-emerald-600 text-white text-xs rounded-full">Sprint 7</span>
                <span className="text-stone-500 text-xs">→ Stalwart (Sprint 12)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--ff-ink-muted)] mb-1">Talent Pipeline</label>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-semibold">Active</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 text-xs rounded-full">CTO-managed</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--ff-ink-muted)] mb-1">AI Agent</label>
              <div className="flex items-center gap-2">
                <span className="text-[var(--ff-ink-muted)]">Not configured</span>
                <span className="px-2 py-0.5 bg-stone-200 text-[var(--ff-ink)] text-xs rounded-full">Sprint 9</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Configuration */}
      <div className="bg-white/70 rounded-lg border border-[var(--ff-border)] p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-[var(--ff-ink)]">Auth Configuration</h3>
          <span className="px-3 py-1 bg-stone-200 text-[var(--ff-ink-muted)] text-sm rounded-full">Read-Only</span>
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
                <span className="px-2 py-0.5 bg-emerald-600 text-white text-xs rounded-full">Active</span>
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

          <div className="border-t border-[var(--ff-border)] pt-4">
            <label className="block text-sm font-medium text-[var(--ff-ink-muted)] mb-3">Authentication Methods</label>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 px-4 bg-[var(--ff-bg)] rounded-lg">
                <span className="text-stone-700">Google OAuth</span>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-emerald-600 text-white text-xs rounded-lg font-medium"><SprintStatus status="complete" /></span>
                </div>
              </div>
              <div className="flex items-center justify-between py-2 px-4 bg-[var(--ff-bg)] rounded-lg">
                <span className="text-stone-700">Email/Password</span>
                <SprintStatus status="complete" /> Enabled
              </div>
              <div className="flex items-center justify-between py-2 px-4 bg-[var(--ff-bg)] rounded-lg">
                <span className="text-stone-700">Phone/SMS</span>
                <span className="text-stone-600">Not enabled</span>
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
