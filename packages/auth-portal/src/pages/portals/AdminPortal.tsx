import React, { useEffect, useMemo, useState } from 'react';
import { FairflowLogo } from '../../components/FairflowLogo';
import { useAuth } from '../../context/AuthContext';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useSupabaseUsers } from '../../hooks/useSupabaseUsers';
import { MetricCard } from '../../components/shared/MetricCard';
import { RoleBadge } from '../../components/shared/RoleBadge';
import { Toast } from '../../components/shared/Toast';
import { EmptyState } from '../../components/shared/EmptyState';
import { adminSecret } from '../../lib/config';
import { useAdminNavigation } from '../../features/admin-portal/hooks/useAdminNavigation';
import { useAdminShellState } from '../../features/admin-portal/hooks/useAdminShellState';
import { useAdminKYCQueue } from '../../features/admin-portal/hooks/useAdminKYCQueue';
import { AdminOverviewSection } from '../../features/admin-portal/components/AdminOverviewSection';
import { AdminKYCSection } from '../../features/admin-portal/components/AdminKYCSection';
import { AdminMerchantsSection } from '../../features/admin-portal/components/AdminMerchantsSection';
import { BarChart2, Activity, Users, Store, DollarSign, Settings2, AlertTriangle, FileCheck, LogOut, Bell } from 'lucide-react';

type ToastState = { message: string; type: 'success' | 'error' | 'info' } | null;
type NavIcon = React.ComponentType<{ className?: string }>;

const NAVIGATION_ICON_MAP: Record<string, NavIcon> = {
  BarChart2,
  FileCheck,
  Store,
  Users,
  Activity,
  DollarSign,
  Settings2,
};

export const AdminPortal: React.FC = () => {
  const { signOut } = useAuth();
  const hasConfiguredAdminSecret = Boolean(import.meta.env.VITE_ADMIN_SECRET);
  const isUsingDefaultAdminSecret = adminSecret === 'mor-admin-secret-local';
  const showAdminSecretWarning = !hasConfiguredAdminSecret || isUsingDefaultAdminSecret;
  const [toast, setToast] = useState<ToastState>(null);
  const [apiOnline, setApiOnline] = useState(true);
  const token = adminSecret;
  const { navigation, activeSection, setActiveSection } = useAdminNavigation();
  const {
    sidebarOpen,
    toggleSidebar,
    closeSidebar,
  } = useAdminShellState();
  const {
    pendingKYC,
    loadingKYC,
    selectedKYC,
    kycAction,
    rejectionReason,
    setRejectionReason,
    approvalNotes,
    setApprovalNotes,
    loadKYCQueue,
    openKYCAction,
    resetKYCAction,
    handleKYCAction,
  } = useAdminKYCQueue(token, (message, type) => setToast({ message, type }));

  const { data: analytics, error: apiError, secondsSince, refresh, checkHealth } = useAnalytics();
  const { users, loading: _usersLoading, refresh: _refreshUsers } = useSupabaseUsers();

  useEffect(() => {
    document.title = 'fairflow — Admin Portal';
  }, []);

  useEffect(() => {
    const performHealthCheck = async () => {
      let isOnline = false;
      for (let i = 0; i < 3; i++) {
        const result = await checkHealth();
        if (result) {
          isOnline = true;
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      setApiOnline(isOnline);
    };
    performHealthCheck();
  }, [checkHealth]);

  useEffect(() => {
    if (activeSection === 'kyc-management') {
      loadKYCQueue();
    }
  }, [activeSection, loadKYCQueue]);

  const roleStats = useMemo(() => {
    const stats = { ceo: 0, cto: 0, merchant: 0, investor: 0, consumer: 0 };
    users.forEach(user => {
      if (user.role in stats) stats[user.role as keyof typeof stats]++;
    });
    return stats;
  }, [users]);

  const merchants = users.filter((user) => user.role === 'merchant').slice(0, 10).map((user) => ({ id: user.id, role: user.role }));
  const overviewProps = {
    apiError,
    apiOnline,
    secondsSince,
    onRefresh: refresh,
    roleStats,
    usersCount: users.length,
    pendingKYCCount: pendingKYC.length,
    memoryHeap: analytics?.system.memoryHeap || 0,
    storageTotalSize: analytics?.storage.totalSize || 0,
    errorsCount: analytics?.errors.count || 0,
  };

  const renderUsersRoles = () => (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold text-[var(--ff-ink)]">Users & Roles</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard label="CEOs" value={roleStats.ceo.toString()} />
        <MetricCard label="CTOs" value={roleStats.cto.toString()} />
        <MetricCard label="Merchants" value={roleStats.merchant.toString()} />
        <MetricCard label="Investors" value={roleStats.investor.toString()} />
        <MetricCard label="Consumers" value={roleStats.consumer.toString()} />
      </div>
      <div className="space-y-4">
        {users.slice(0, 10).map(user => (
          <div key={user.id} className="bg-[#1A2D42] border border-[rgba(255,255,255,0.07)] rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-[var(--ff-ink)]">{user.id}</p>
              <p className="text-sm text-white">{user.user_id}</p>
            </div>
            <RoleBadge role={user.role} />
          </div>
        ))}
      </div>
    </div>
  );

  const renderPlatformHealth = () => {
    if (apiError) return <div className="p-6"><EmptyState icon={<AlertTriangle className="w-10 h-10 text-yellow-400" />} title="API Offline" description="Run: cd mcj && npm run demo" /></div>;
    return (
      <div className="p-6 space-y-6">
        <h2 className="text-xl font-bold text-[var(--ff-ink)]">Platform Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard label="API Status" value={apiOnline ? 'Online' : 'Offline'} color={apiOnline ? 'green' : 'red'} />
          <MetricCard label="Memory (Heap)" value={(analytics?.system.memoryHeap || 0).toFixed(2)} unit="MB" />
          <MetricCard label="Memory (RSS)" value={(analytics?.system.memoryRss || 0).toFixed(2)} unit="MB" />
        </div>
      </div>
    );
  };

  const renderSystem = () => <div className="p-6 space-y-6"><h2 className="text-xl font-bold text-[var(--ff-ink)]">System</h2><div className="bg-[#1A2D42] border border-[rgba(255,255,255,0.07)] rounded-xl p-5"><p className="text-sm text-white">System features coming soon</p></div></div>;

  const renderFinancials = () => <div className="p-6 space-y-6"><h2 className="text-xl font-bold text-[var(--ff-ink)]">Financials</h2><div className="bg-[#1A2D42] border border-[rgba(255,255,255,0.07)] rounded-xl p-5"><p className="text-sm text-white">Financial reporting coming soon</p></div></div>;

  const renderSettings = () => <div className="p-6 space-y-6"><h2 className="text-xl font-bold text-[var(--ff-ink)]">Settings</h2><button onClick={signOut} className="flex items-center gap-2 px-6 py-3 bg-[var(--ff-error)] hover:bg-[var(--ff-error-bold)] text-[var(--ff-neutral)] rounded-lg transition"><LogOut className="w-4 h-4" />Sign Out</button></div>;

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <AdminOverviewSection {...overviewProps} />;
      case 'kyc-management':
        return (
          <AdminKYCSection
            loadingKYC={loadingKYC}
            pendingKYC={pendingKYC}
            onRefresh={loadKYCQueue}
            onOpenKYCAction={openKYCAction}
          />
        );
      case 'merchants':
        return <AdminMerchantsSection merchants={merchants} />;
      case 'users-roles':
        return renderUsersRoles();
      case 'platform-health':
        return renderPlatformHealth();
      case 'system':
        return renderSystem();
      case 'financials':
        return renderFinancials();
      case 'settings':
        return renderSettings();
      default:
        return <AdminOverviewSection {...overviewProps} />;
    }
  };

  return (
    <div className="flex h-screen bg-[var(--ff-bg)] overflow-hidden" data-testid="admin-portal">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-[rgba(27,35,48,0.24)] z-30 md:hidden" onClick={closeSidebar} />
      )}
      <div className={`${sidebarOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full md:translate-x-0'} fixed inset-y-0 left-0 z-40 md:static bg-[#1A2D42] border-r border-[rgba(255,255,255,0.07)] transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-[rgba(255,255,255,0.07)] flex-shrink-0 overflow-hidden">
          <div className="flex items-center justify-between">
            <FairflowLogo markHeight={sidebarOpen ? 32 : 28} showWordmark={sidebarOpen} style="geo-tech" variant="light" />
            {sidebarOpen && <span className="text-xs font-bold text-white">ADMIN</span>}
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigation.map(item => {
            const Icon = NAVIGATION_ICON_MAP[item.icon] || BarChart2;
            return (
              <button
                key={item.id}
                aria-label={item.label}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  activeSection === item.id
                    ? 'bg-[var(--ff-accent-light)] text-[var(--ff-ink)] border border-[var(--ff-border)]'
                    : 'text-[#8A99AA] hover:text-white hover:bg-[var(--ff-surface)]'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-[var(--ff-border)] p-4">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center px-4 py-2 text-[#8A99AA] hover:text-white transition"
          >
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b border-[var(--ff-border)] bg-[#0D1B2A] px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                className="md:hidden p-2 text-[#8A99AA] hover:text-white hover:bg-[var(--ff-surface)] rounded-lg"
                onClick={toggleSidebar}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <h1 className="text-xl md:text-2xl font-bold text-[var(--ff-ink)]">
                {navigation.find(n => n.id === activeSection)?.label || 'Admin Portal'}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-[#8A99AA] hover:text-white hover:bg-[var(--ff-surface)] rounded-lg">
                <Bell className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {showAdminSecretWarning && (
          <div className="mx-4 md:mx-6 mt-4 rounded-lg border border-[var(--ff-warning-border)] bg-[var(--ff-warning-subtle)] px-4 py-3">
            <p className="text-sm text-[var(--ff-warning-bold)]">
              Admin API secret is not configured. Set `VITE_ADMIN_SECRET` to match backend `ADMIN_SECRET_KEY`.
            </p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>
      </div>

      {selectedKYC && (
        <div className="fixed inset-0 bg-[rgba(27,35,48,0.24)] flex items-center justify-center z-50">
          <div className="bg-[#1A2D42] border border-[var(--ff-border)] rounded-xl shadow-lg max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-bold text-white mb-4">
              {kycAction === 'approve' ? 'Approve KYC' : 'Reject KYC'}
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-[#8A99AA]">Merchant</p>
                <p className="text-white font-semibold">{selectedKYC.businessName}</p>
              </div>

              {kycAction === 'approve' ? (
                <div>
                  <label className="block text-sm text-white mb-2">Approval Notes (Optional)</label>
                  <textarea
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    className="w-full bg-[var(--ff-surface)] border border-[var(--ff-border)] rounded-lg px-3 py-2 text-[var(--ff-ink)] text-sm placeholder-[var(--ff-ink-muted)] focus:outline-none focus:border-[var(--ff-focus)]"
                    placeholder="Add any notes about this approval..."
                    rows={3}
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm text-white mb-2">Rejection Reason *</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full bg-[var(--ff-surface)] border border-[var(--ff-border)] rounded-lg px-3 py-2 text-[var(--ff-ink)] text-sm placeholder-[var(--ff-ink-muted)] focus:outline-none focus:border-[var(--ff-focus)]"
                    placeholder="Explain why this KYC is being rejected..."
                    rows={3}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={resetKYCAction}
                className="flex-1 px-4 py-2 bg-[var(--ff-surface)] hover:brightness-95 text-[var(--ff-ink)] rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleKYCAction}
                disabled={kycAction === 'reject' && !rejectionReason.trim()}
                className={`flex-1 px-4 py-2 rounded-lg transition text-[var(--ff-ink)] font-medium ${
                  kycAction === 'approve'
                    ? 'bg-[var(--ff-success)] hover:bg-[var(--ff-success-bold)] disabled:opacity-50 text-[var(--ff-neutral)]'
                    : 'bg-[var(--ff-error)] hover:bg-[var(--ff-error-bold)] disabled:opacity-50 text-[var(--ff-neutral)]'
                }`}
              >
                {kycAction === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
};

