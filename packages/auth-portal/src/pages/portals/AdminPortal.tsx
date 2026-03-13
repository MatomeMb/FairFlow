import React, { useEffect, useState, useMemo } from 'react';
import { FairflowLogo, LogoStyle, LOGO_STYLES } from '../../components/FairflowLogo';
import { useAuth } from '../../context/AuthContext';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useSupabaseUsers } from '../../hooks/useSupabaseUsers';
import { MetricCard } from '../../components/shared/MetricCard';
import { RoleBadge } from '../../components/shared/RoleBadge';
import { StatusBar } from '../../components/shared/StatusBar';
import { Toast } from '../../components/shared/Toast';
import { EmptyState } from '../../components/shared/EmptyState';
import { OfflineBanner } from '../../components/shared/OfflineBanner';
import { formatBytes } from '../../lib/format';
import { 
  BarChart2, Activity, Users, Store, DollarSign, Settings2, 
  AlertTriangle, Check, X, Clock, Shield, FileCheck, LogOut, RefreshCw,
  ChevronDown, Bell, Zap
} from 'lucide-react';

type AdminSection = 
  | 'overview' 
  | 'kyc-management' 
  | 'users-roles' 
  | 'merchants' 
  | 'financials' 
  | 'platform-health' 
  | 'system' 
  | 'settings';

interface KYCSubmission {
  id: string;
  businessName: string;
  email: string;
  kycStatus: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  kycData: {
    id_number: string;
    date_of_birth: string;
    phone: string;
    address: string;
  };
  bankAccount: {
    account_holder_name: string;
    bank_name: string;
    account_number: string;
    branch_code: string;
    account_type: string;
  };
}

export const AdminPortal: React.FC = () => {
  const { signOut } = useAuth();
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);
  const [apiOnline, setApiOnline] = useState(true);
  const [logoStyle, setLogoStyle] = useState<LogoStyle>('geo-tech');
  const [logoMenuOpen, setLogoMenuOpen] = useState(false);
  
  // KYC Management State
  const [pendingKYC, setPendingKYC] = useState<KYCSubmission[]>([]);
  const [loadingKYC, setLoadingKYC] = useState(false);
  const [selectedKYC, setSelectedKYC] = useState<KYCSubmission | null>(null);
  const [kycAction, setKYCAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');

  const { data: analytics, error: apiError, secondsSince, refresh, checkHealth } = useAnalytics();
  const { users, loading: _usersLoading, refresh: _refreshUsers } = useSupabaseUsers();

  // Update page title
  useEffect(() => {
    document.title = 'fairflow — Admin Portal';
    
    // Check URL for logo style
    const params = new URLSearchParams(window.location.search);
    const style = params.get('logoStyle') as LogoStyle;
    const styleExists = style && LOGO_STYLES.some((entry) => entry.id === style);
    if (styleExists) {
      setLogoStyle(style);
      window.localStorage.setItem('fairflowLogoStyle', style);
      return;
    }

    const storedStyle = window.localStorage.getItem('fairflowLogoStyle') as LogoStyle | null;
    if (storedStyle && LOGO_STYLES.some((entry) => entry.id === storedStyle)) {
      setLogoStyle(storedStyle);
    }
  }, []);

  // Check health on mount with retry
  useEffect(() => {
    const performHealthCheck = async () => {
      let isOnline = false;
      for (let i = 0; i < 3; i++) {
        const result = await checkHealth();
        if (result) {
          isOnline = true;
          break;
        }
        // Wait 500ms before retrying
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      setApiOnline(isOnline);
    };
    performHealthCheck();
  }, [checkHealth]);

  // Fetch pending KYC
  const fetchPendingKYC = async () => {
    setLoadingKYC(true);
    try {
      const response = await fetch('http://localhost:3000/v1/admin/kyc/pending', {
        headers: {
          'Authorization': 'Bearer mor-admin-secret-local'
        }
      });
      const data = await response.json();
      if (data.ok && data.pending) {
        setPendingKYC(data.pending);
      }
    } catch (error) {
      console.error('Error fetching KYC:', error);
      setToast({ message: 'Failed to fetch pending KYC', type: 'error' });
    } finally {
      setLoadingKYC(false);
    }
  };

  // Load KYC when switching to that section
  useEffect(() => {
    if (activeSection === 'kyc-management') {
      fetchPendingKYC();
    }
  }, [activeSection]);

  // Handle KYC approval
  const handleApproveKYC = async () => {
    if (!selectedKYC) return;
    
    try {
      const response = await fetch(`http://localhost:3000/v1/admin/kyc/approve/${selectedKYC.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': 'Bearer mor-admin-secret-local',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes: approvalNotes })
      });
      
      const data = await response.json();
      if (data.ok) {
        setToast({ message: `KYC approved for ${selectedKYC.businessName}`, type: 'success' });
        setSelectedKYC(null);
        setApprovalNotes('');
        fetchPendingKYC();
      } else {
        setToast({ message: data.error || 'Failed to approve KYC', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Error approving KYC', type: 'error' });
    }
  };

  // Handle KYC rejection
  const handleRejectKYC = async () => {
    if (!selectedKYC || !rejectionReason.trim()) return;
    
    try {
      const response = await fetch(`http://localhost:3000/v1/admin/kyc/reject/${selectedKYC.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': 'Bearer mor-admin-secret-local',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rejectionReason })
      });
      
      const data = await response.json();
      if (data.ok) {
        setToast({ message: `KYC rejected for ${selectedKYC.businessName} — merchant notified`, type: 'success' });
        setSelectedKYC(null);
        setRejectionReason('');
        fetchPendingKYC();
      } else {
        setToast({ message: data.error || 'Failed to reject KYC', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Error rejecting KYC', type: 'error' });
    }
  };

  const roleStats = useMemo(() => {
    const stats = { ceo: 0, cto: 0, merchant: 0, investor: 0, consumer: 0 };
    users.forEach(user => {
      if (user.role in stats) stats[user.role as keyof typeof stats]++;
    });
    return stats;
  }, [users]);

  const navigation: { id: AdminSection; label: string; icon: React.ComponentType<any> }[] = [
    { id: 'overview', label: 'Dashboard', icon: BarChart2 },
    { id: 'kyc-management', label: 'KYC Approvals', icon: FileCheck },
    { id: 'merchants', label: 'Merchants', icon: Store },
    { id: 'users-roles', label: 'Users & Roles', icon: Users },
    { id: 'platform-health', label: 'Platform Health', icon: Activity },
    { id: 'financials', label: 'Financials', icon: DollarSign },
    { id: 'system', label: 'System', icon: Zap },
    { id: 'settings', label: 'Settings', icon: Settings2 },
  ];

  const renderOverview = () => {
    if (apiError) {
      return (
        <>
          <OfflineBanner />
          <div className="p-6">
            <EmptyState
              icon={<AlertTriangle className="w-10 h-10 text-yellow-400" />}
              title="API Offline"
              description="Cannot fetch analytics. Run: cd mcj && npm run demo, then refresh this panel."
              action={{ label: "Try Again", onClick: refresh }}
            />
          </div>
        </>
      );
    }

    return (
      <div className="space-y-6">
        <h1 className="sr-only">Admin Dashboard</h1>
        <StatusBar
          apiOnline={apiOnline}
          version="v0.6.0"
          secondsSince={secondsSince}
          onRefresh={refresh}
        />

        <div className="p-6 space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <MetricCard label="Active Merchants" value={roleStats.merchant.toString()} color="blue" />
            <MetricCard label="Heap Memory" value={(analytics?.system.memoryHeap || 0).toFixed(2)} unit="MB" />
            <MetricCard label="Storage Used" value={formatBytes(analytics?.storage.totalSize || 0)} />
            <MetricCard label="Pending KYC" value={pendingKYC.length.toString()} color={pendingKYC.length > 0 ? 'amber' : 'green'} />
            <MetricCard label="Errors (24h)" value={analytics?.errors.count || 0} color={analytics?.errors.count === 0 ? "green" : "red"} />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/70 border border-[var(--ff-border)] rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--ff-ink-muted)]">Platform Users</p>
                  <p className="text-2xl font-bold text-[var(--ff-ink)] mt-1">{users.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white/70 border border-[var(--ff-border)] rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--ff-ink-muted)]">CEOs</p>
                  <p className="text-2xl font-bold text-[var(--ff-ink)] mt-1">{roleStats.ceo}</p>
                </div>
                <Shield className="w-8 h-8 text-purple-500" />
              </div>
            </div>
            <div className="bg-white/70 border border-[var(--ff-border)] rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--ff-ink-muted)]">CTOs</p>
                  <p className="text-2xl font-bold text-[var(--ff-ink)] mt-1">{roleStats.cto}</p>
                </div>
                <Zap className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
            <div className="bg-white/70 border border-[var(--ff-border)] rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--ff-ink-muted)]">KYC Pending</p>
                  <p className="text-2xl font-bold text-[var(--ff-ink)] mt-1">{pendingKYC.length}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderKYCManagement = () => {
    if (loadingKYC) {
      return (
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="animate-spin">
            <RefreshCw className="w-5 h-5" />
          </div>
        </div>
      );
    }

    if (pendingKYC.length === 0) {
      return (
        <div className="p-6">
          <EmptyState
            icon={<Check className="w-10 h-10 text-green-400" />}
            title="No Pending KYC Submissions"
            description="All merchants have been verified!"
          />
        </div>
      );
    }

    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[var(--ff-ink)]">KYC Approvals</h2>
            <p className="text-sm text-[var(--ff-ink-muted)] mt-1">{pendingKYC.length} pending submission{pendingKYC.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={fetchPendingKYC}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        <div className="space-y-4">
          {pendingKYC.map((kyc) => (
            <div key={kyc.id} className="bg-white/70 border border-[var(--ff-border)] rounded-xl p-5 hover:border-[var(--ff-border)] transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-semibold text-[var(--ff-ink)]">{kyc.businessName}</h3>
                      <p className="text-sm text-[var(--ff-ink-muted)]">{kyc.email}</p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-[var(--ff-ink-muted)]">ID Number</p>
                      <p className="text-[var(--ff-ink)] font-mono">{kyc.kycData?.id_number || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[var(--ff-ink-muted)]">DOB</p>
                      <p className="text-[var(--ff-ink)]">{kyc.kycData?.date_of_birth || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[var(--ff-ink-muted)]">Bank</p>
                      <p className="text-[var(--ff-ink)]">{kyc.bankAccount?.bank_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[var(--ff-ink-muted)]">Account</p>
                      <p className="text-[var(--ff-ink)] font-mono">****{kyc.bankAccount?.account_number?.slice(-4) || 'N/A'}</p>
                    </div>
                  </div>
                  <p className="text-xs text-[var(--ff-ink-muted)] mt-3">
                    Submitted: {new Date(kyc.submittedAt).toLocaleDateString()} at {new Date(kyc.submittedAt).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => {
                      setSelectedKYC(kyc);
                      setKYCAction('approve');
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-[var(--ff-ink)] rounded-lg transition"
                  >
                    <Check className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setSelectedKYC(kyc);
                      setKYCAction('reject');
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-[var(--ff-ink)] rounded-lg transition"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMerchants = () => {
    const merchants = users.filter(u => u.role === 'merchant').slice(0, 10);
    
    return (
      <div className="p-6 space-y-6">
        <h2 className="text-xl font-bold text-[var(--ff-ink)]">Merchant Management</h2>
        <div className="space-y-4">
          {merchants.map(merchant => (
            <div key={merchant.id} className="bg-white/70 border border-[var(--ff-border)] rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[var(--ff-ink)]">{merchant.id}</p>
                  <p className="text-sm text-[var(--ff-ink-muted)]">{merchant.role}</p>
                </div>
                <RoleBadge role={merchant.role} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderUsersRoles = () => {
    return (
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
            <div key={user.id} className="bg-white/70 border border-[var(--ff-border)] rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-[var(--ff-ink)]">{user.id}</p>
                <p className="text-sm text-[var(--ff-ink-muted)]">{user.user_id}</p>
              </div>
              <RoleBadge role={user.role} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPlatformHealth = () => {
    if (apiError) {
      return (
        <div className="p-6">
          <EmptyState
            icon={<AlertTriangle className="w-10 h-10 text-yellow-400" />}
            title="API Offline"
            description="Run: cd mcj && npm run demo"
          />
        </div>
      );
    }

    return (
      <div className="p-6 space-y-6">
        <h2 className="text-xl font-bold text-[var(--ff-ink)]">Platform Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard label="API Status" value={apiOnline ? "Online" : "Offline"} color={apiOnline ? "green" : "red"} />
          <MetricCard label="Memory (Heap)" value={(analytics?.system.memoryHeap || 0).toFixed(2)} unit="MB" />
          <MetricCard label="Memory (RSS)" value={(analytics?.system.memoryRss || 0).toFixed(2)} unit="MB" />
        </div>
      </div>
    );
  };

  const renderSystem = () => {
    return (
      <div className="p-6 space-y-6">
        <h2 className="text-xl font-bold text-[var(--ff-ink)]">System</h2>
        <div className="bg-white/70 border border-[var(--ff-border)] rounded-xl p-5">
          <p className="text-sm text-[var(--ff-ink-muted)]">System features coming soon</p>
        </div>
      </div>
    );
  };

  const renderFinancials = () => {
    return (
      <div className="p-6 space-y-6">
        <h2 className="text-xl font-bold text-[var(--ff-ink)]">Financials</h2>
        <div className="bg-white/70 border border-[var(--ff-border)] rounded-xl p-5">
          <p className="text-sm text-[var(--ff-ink-muted)]">Financial reporting coming soon</p>
        </div>
      </div>
    );
  };

  const renderSettings = () => {
    return (
      <div className="p-6 space-y-6">
        <h2 className="text-xl font-bold text-[var(--ff-ink)]">Settings</h2>
        <button
          onClick={signOut}
          className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-[var(--ff-ink)] rounded-lg transition"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'kyc-management':
        return renderKYCManagement();
      case 'merchants':
        return renderMerchants();
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
        return renderOverview();
    }
  };

  return (
    <div className="flex h-screen bg-[var(--ff-bg)] overflow-hidden" data-testid="admin-portal">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-[rgba(27,35,48,0.24)] z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full md:translate-x-0'} fixed inset-y-0 left-0 z-40 md:static bg-white border-r border-[var(--ff-border)] transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-[var(--ff-border)] flex-shrink-0 overflow-hidden">
          <div className="flex items-center justify-between">
            <FairflowLogo markHeight={sidebarOpen ? 32 : 28} showWordmark={sidebarOpen} style={logoStyle} variant="light" />
            {sidebarOpen && <span className="text-xs font-bold text-[var(--ff-ink-muted)]">ADMIN</span>}
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigation.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                aria-label={item.label}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  activeSection === item.id
                    ? 'bg-[var(--ff-accent-light)] text-[var(--ff-ink)] border border-[var(--ff-border)]'
                    : 'text-[var(--ff-ink-muted)] hover:text-[var(--ff-ink)] hover:bg-[var(--ff-surface)]'
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
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center px-4 py-2 text-[var(--ff-ink-muted)] hover:text-[var(--ff-ink)] transition"
          >
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-[var(--ff-border)] bg-white px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                className="md:hidden p-2 text-[var(--ff-ink-muted)] hover:text-[var(--ff-ink)] hover:bg-[var(--ff-surface)] rounded-lg"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <h1 className="text-xl md:text-2xl font-bold text-[var(--ff-ink)]">
                {navigation.find(n => n.id === activeSection)?.label || 'Admin Portal'}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <button 
                  onClick={() => setLogoMenuOpen(!logoMenuOpen)}
                  className="flex items-center gap-2 bg-[var(--ff-surface)] hover:brightness-95 text-[var(--ff-ink)] rounded-lg px-3 py-1.5 transition-colors border border-[var(--ff-border)]"
                >
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs font-bold uppercase tracking-wider">{logoStyle.replace('-', ' ')}</span>
                  <ChevronDown className={`w-3 h-3 text-[var(--ff-ink-muted)] transition-transform ${logoMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {logoMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setLogoMenuOpen(false)} 
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white/70 border border-[var(--ff-border)] rounded-xl shadow-2xl z-20 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-3 py-2 border-b border-[var(--ff-border)] mb-1">
                        <span className="text-[10px] font-black text-[var(--ff-ink-muted)] uppercase tracking-[0.2em]">Select Brand Identity</span>
                      </div>
                      {LOGO_STYLES.map((styleOption) => (
                        <button
                          key={styleOption.id}
                          onClick={() => {
                            setLogoStyle(styleOption.id);
                            window.localStorage.setItem('fairflowLogoStyle', styleOption.id);
                            setLogoMenuOpen(false);
                            const url = new URL(window.location.href);
                            url.searchParams.set('logoStyle', styleOption.id);
                            window.history.replaceState({}, '', url.toString());
                          }}
                          className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-all ${
                            logoStyle === styleOption.id 
                              ? 'bg-blue-600/10 text-blue-400 font-bold' 
                                : 'text-[var(--ff-ink-muted)] hover:bg-[var(--ff-surface)] hover:text-[var(--ff-ink)]'
                          }`}
                        >
                          <span className="capitalize">{styleOption.label}</span>
                          {logoStyle === styleOption.id && <Check className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <button className="p-2 text-[var(--ff-ink-muted)] hover:text-[var(--ff-ink)] hover:bg-[var(--ff-surface)] rounded-lg">
                <Bell className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>
      </div>

      {/* KYC Action Modal */}
      {selectedKYC && (
        <div className="fixed inset-0 bg-[rgba(27,35,48,0.24)] flex items-center justify-center z-50">
          <div className="bg-white/70 border border-[var(--ff-border)] rounded-xl shadow-lg max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-bold text-[var(--ff-ink)] mb-4">
              {kycAction === 'approve' ? 'Approve KYC' : 'Reject KYC'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-[var(--ff-ink-muted)]">Merchant</p>
                <p className="text-[var(--ff-ink)] font-semibold">{selectedKYC.businessName}</p>
              </div>

              {kycAction === 'approve' ? (
                <div>
                  <label className="block text-sm text-[var(--ff-ink-muted)] mb-2">Approval Notes (Optional)</label>
                  <textarea
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    className="w-full bg-[var(--ff-surface)] border border-[var(--ff-border)] rounded-lg px-3 py-2 text-[var(--ff-ink)] text-sm placeholder-[var(--ff-ink-muted)] focus:outline-none focus:border-blue-500"
                    placeholder="Add any notes about this approval..."
                    rows={3}
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm text-[var(--ff-ink-muted)] mb-2">Rejection Reason *</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full bg-[var(--ff-surface)] border border-[var(--ff-border)] rounded-lg px-3 py-2 text-[var(--ff-ink)] text-sm placeholder-[var(--ff-ink-muted)] focus:outline-none focus:border-red-500"
                    placeholder="Explain why this KYC is being rejected..."
                    rows={3}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setSelectedKYC(null);
                  setKYCAction(null);
                  setRejectionReason('');
                  setApprovalNotes('');
                }}
                className="flex-1 px-4 py-2 bg-[var(--ff-surface)] hover:brightness-95 text-[var(--ff-ink)] rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={kycAction === 'approve' ? handleApproveKYC : handleRejectKYC}
                disabled={kycAction === 'reject' && !rejectionReason.trim()}
                className={`flex-1 px-4 py-2 rounded-lg transition text-[var(--ff-ink)] font-medium ${
                  kycAction === 'approve'
                    ? 'bg-green-600 hover:bg-green-700 disabled:opacity-50'
                    : 'bg-red-600 hover:bg-red-700 disabled:opacity-50'
                }`}
              >
                {kycAction === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
};
