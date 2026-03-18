import React, { useState, useMemo } from 'react';
import { PortalShell } from '../../components/layout/PortalShell';
import { FairflowLogo } from '../../components/FairflowLogo';
import { useAuth } from '../../context/AuthContext';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useSupabaseUsers } from '../../hooks/useSupabaseUsers';
import { Toast } from '../../components/shared/Toast';
import { InvestorMode } from './InvestorMode';
import { BarChart2, Activity, Users, Store, DollarSign, TrendingUp, Settings2 } from 'lucide-react';
import { CEOOverviewSection } from '../../features/ceo-dashboard/components/CEOOverviewSection';
import { CEOMerchantsSection } from '../../features/ceo-dashboard/components/CEOMerchantsSection';
import { CEOFinancialsSection } from '../../features/ceo-dashboard/components/CEOFinancialsSection';
import { CEOPlatformHealthSection } from '../../features/ceo-dashboard/components/CEOPlatformHealthSection';
import { CEOUsersRolesSection } from '../../features/ceo-dashboard/components/CEOUsersRolesSection';
import { CEOSettingsSection } from '../../features/ceo-dashboard/components/CEOSettingsSection';
import { useCEOOnboarding } from '../../features/ceo-dashboard/hooks/useCEOOnboarding';
import { useCEOSection, type CEOSection } from '../../features/ceo-dashboard/hooks/useCEOSection';

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

const SECTION_ICONS = {
  BarChart2,
  Activity,
  Users,
  Store,
  DollarSign,
  TrendingUp,
  Settings2
};

export const CEODashboard: React.FC = () => {
  const { signOut } = useAuth();
  const { data: analytics, loading: analyticsLoading, secondsSince, refresh: refreshAnalytics, checkHealth } = useAnalytics(30000);
  const { users, loading: usersLoading, refresh: refreshUsers } = useSupabaseUsers();
  const { navigation, activeSection, setActiveSection } = useCEOSection();
  const {
    showOnboardModal,
    setShowOnboardModal,
    onboardForm,
    toast,
    setToast,
    updateField,
    toggleCertification,
    closeModal,
    submitOnboarding
  } = useCEOOnboarding();

  const [apiOnline, setApiOnline] = useState(true);

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

  const sections = useMemo(() => {
    return navigation.map(item => ({
      ...item,
      icon: SECTION_ICONS[item.icon]
    }));
  }, [navigation]);

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

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <CEOOverviewSection
            apiOnline={apiOnline}
            usersCount={users.length}
            roleStats={roleStats}
            analytics={analytics}
          />
        );
      case 'platform-health':
        return (
          <CEOPlatformHealthSection
            analyticsLoading={analyticsLoading}
            analytics={analytics}
            apiOnline={apiOnline}
            secondsSince={secondsSince}
            onRefresh={refreshAnalytics}
          />
        );
      case 'users-roles':
        return (
          <CEOUsersRolesSection
            users={users}
            usersLoading={usersLoading}
            roleStats={roleStats}
            onRefreshUsers={refreshUsers}
          />
        );
      case 'merchants':
        return (
          <CEOMerchantsSection
            merchants={merchants}
            showOnboardModal={showOnboardModal}
            onboardForm={onboardForm}
            onOpenModal={() => setShowOnboardModal(true)}
            onCloseModal={closeModal}
            onSubmit={submitOnboarding}
            onUpdateField={updateField}
            onToggleCertification={toggleCertification}
          />
        );
      case 'financials':
        return <CEOFinancialsSection />;
      case 'investor-view':
        return renderInvestorView();
      case 'settings':
        return <CEOSettingsSection />;
      default:
        return (
          <CEOOverviewSection
            apiOnline={apiOnline}
            usersCount={users.length}
            roleStats={roleStats}
            analytics={analytics}
          />
        );
    }
  };

  return (
    <PortalShell
      title={<FairflowLogo markHeight={32} variant="dark" />}
      version="v0.6.0"
      nav={sections}
      activeSection={activeSection}
      onNavChange={(id) => setActiveSection(id as CEOSection)}
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
