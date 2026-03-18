import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { TabShell } from '../../components/layout/TabShell';
import { FairflowLogo, type LogoStyle, LOGO_STYLES } from '../../components/FairflowLogo';
import { useAuth } from '../../context/AuthContext';
import { MetricCard } from '../../components/shared/MetricCard';
import { Toast } from '../../components/shared/Toast';
import { EmptyState } from '../../components/shared/EmptyState';
import CreateProductModal from '../../components/CreateProductModal';
import { type KycSubmitPayload } from '../../components/KYCForm';
import { Package, Bell } from 'lucide-react';
import type { MerchantOrder, MerchantNotification, MerchantAccount, PayoutLog } from '../../types/merchant';
import { MerchantOrders } from './merchant/MerchantOrders';
import { MerchantNotifications } from './merchant/MerchantNotifications';
import { MerchantKYCPayouts } from './merchant/MerchantKYCPayouts';
import { apiBase } from '../../lib/config';
import { useMerchantAuthToken } from '../../features/merchant-portal/hooks/useMerchantAuthToken';
import { useMerchantProducts } from '../../features/merchant-portal/hooks/useMerchantProducts';
import { useMerchantOrders } from '../../features/merchant-portal/hooks/useMerchantOrders';
import { useMerchantAnalytics } from '../../features/merchant-portal/hooks/useMerchantAnalytics';
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

type Tab = 'products' | 'analytics' | 'orders' | 'notifications' | 'kyc-payouts' | 'account';

const InlineSpinner: React.FC<{ label: string }> = ({ label }) => (
  <div className="bg-[var(--ff-neutral)]/70 border border-[var(--ff-border-light)] rounded-xl p-4 text-sm text-[var(--ff-neutral-bold)] flex items-center gap-3">
    <svg className="w-5 h-5 text-[var(--ff-success)] animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="4" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
    <span>{label}</span>
  </div>
);

const ErrorBanner: React.FC<{ message: string; onDismiss: () => void }> = ({ message, onDismiss }) => (
  <div className="bg-[var(--ff-error-bold)] border border-[var(--ff-error)] rounded-xl px-4 py-3 text-sm text-[var(--ff-neutral)] flex items-start justify-between gap-3">
    <p>{message}</p>
    <button
      type="button"
      onClick={onDismiss}
      className="text-[var(--ff-ink)]/90 hover:text-[var(--ff-ink)] leading-none min-h-[44px] min-w-[44px] flex items-center justify-center"
      aria-label="Dismiss error"
    >
      ✕
    </button>
  </div>
);

export const MerchantPortal: React.FC = () => {
  const { signOut } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [logoStyle, setLogoStyle] = useState<LogoStyle>('geo-tech');

  // Update page title
  React.useEffect(() => {
    document.title = 'fairflow — Merchant Dashboard';

    const params = new URLSearchParams(window.location.search);
    const styleParam = params.get('logoStyle') as LogoStyle | null;
    if (styleParam && LOGO_STYLES.some((entry) => entry.id === styleParam)) {
      setLogoStyle(styleParam);
      return;
    }

    const storedStyle = window.localStorage.getItem('fairflowLogoStyle') as LogoStyle | null;
    if (storedStyle && LOGO_STYLES.some((entry) => entry.id === storedStyle)) {
      setLogoStyle(storedStyle);
    }
  }, []);
  const { token: authToken, merchantFetch } = useMerchantAuthToken();
  const {
    products,
    isLoadingProducts,
    loadProducts,
    handleDeleteProduct,
    handleRestockProduct: restockProduct,
  } = useMerchantProducts(authToken, merchantFetch);
  const {
    orders,
    isLoadingOrders,
    loadOrders,
    fulfillOrder,
    uploadSlip,
    markAsShipped,
    fulfillingOrderId,
    uploadingSlipOrderId,
    updateOrder,
  } = useMerchantOrders(authToken, merchantFetch);
  const { analytics, isLoadingAnalytics, loadAnalytics } = useMerchantAnalytics(authToken, merchantFetch, products);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<MerchantNotification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);
  const [updatingNotificationId, setUpdatingNotificationId] = useState<string | null>(null);
  const [merchantAccount, setMerchantAccount] = useState<MerchantAccount | null>(null);
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [payoutLogs, setPayoutLogs] = useState<PayoutLog[]>([]);
  const [payoutsLoading, setPayoutsLoading] = useState(false);
  const [restockingProductId, setRestockingProductId] = useState<string | null>(null);
  const [copiedMatterId, setCopiedMatterId] = useState<string | null>(null);
  const [copiedPageId, setCopiedPageId] = useState<string | null>(null);
  const [kycSubmitting, setKycSubmitting] = useState(false);
  const [kycForm, setKycForm] = useState<KycSubmitPayload>({
    business_name: '',
    id_number: '',
    date_of_birth: '',
    residential_address: '',
    phone: '',
    bank_account: {
      account_holder_name: '',
      bank_name: 'ABSA',
      account_number: '',
      branch_code: '',
      account_type: 'cheque',
    },
  });
  const [businessProfile, setBusinessProfile] = useState({
    businessName: 'Ethical Threads SA',
    contactEmail: 'contact@ethicalthreads.co.za',
    phone: '+27 21 555 1234',
    address: '123 Main St, Cape Town, 8000',
    certifications: 'Fair Trade Certified, B-Corp Verified',
    yearEstablished: '2019',
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    branchCode: ''
  });
  const [showOnboardingBanner, setShowOnboardingBanner] = useState(true);

  const tabs = [
    { id: 'products', label: 'My Products' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'orders', label: 'Orders' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'kyc-payouts', label: 'KYC & Payouts' },
    { id: 'account', label: 'My Account' }
  ];

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  const hasApiAuth = Boolean(authToken || import.meta.env.VITE_API_KEY);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlError = params.get('error');

    if (urlError) {
      const messages: Record<string, string> = {
        google_cancelled: 'Google sign-in was cancelled.',
        google_token_failed: 'Could not complete Google sign-in. Please try again.',
        google_profile_failed: 'Could not retrieve your Google profile. Please try again.',
        google_no_email: 'Google account email is required to continue.',
        google_not_configured: 'Google sign-in is not configured yet.',
        account_exists: 'An account with a different email already exists.',
      };
      showToast(messages[urlError] || 'Sign-in failed. Please try again.', 'error');
      window.history.replaceState({}, '', '/dashboard/merchant');
    }
  }, []);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const fromUrl = new URLSearchParams(window.location.search).get('token');
      const fromStorage = sessionStorage.getItem('merchantToken') || sessionStorage.getItem('merchant_token');
      if (!fromUrl && !fromStorage && !authToken && !import.meta.env.VITE_API_KEY) {
        window.location.href = '/merchant/login';
      }
    }, 500); // Wait 500ms to allow URL/storage to be processed
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (merchantAccount?.kyc_status !== 'not_started' || products.length > 0) {
      setShowOnboardingBanner(false);
    }
  }, [merchantAccount?.kyc_status, products.length]);

  const apiError = async (res: Response, fallback: string): Promise<string> => {
    const text = await res.text();
    let detail = res.status === 401 ? 'Unauthorized (check token or API key)' : fallback;
    try {
      const j = JSON.parse(text) as { error?: string; message?: string };
      if (j.error || j.message) detail = j.error || j.message || detail;
    } catch {
      if (text) detail = text.slice(0, 120);
    }
    return `${detail} (${res.status})`;
  };

  const loadProductsWithError = useCallback(async () => {
    setProductsError(null);
    try {
      await loadProducts();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load products';
      setProductsError(msg);
    }
  }, [loadProducts]);

  const loadAnalyticsWithError = useCallback(async () => {
    setAnalyticsError(null);
    try {
      await loadAnalytics();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load analytics';
      setAnalyticsError(msg);
    }
  }, [loadAnalytics]);

  const loadOrdersWithError = useCallback(async () => {
    setOrdersError(null);
    try {
      await loadOrders();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load orders';
      setOrdersError(msg);
    }
  }, [loadOrders]);

  useEffect(() => {
    if (activeTab !== 'analytics') return;
    void loadAnalyticsWithError();
  }, [activeTab, loadAnalyticsWithError]);

  useEffect(() => {
    if (!hasApiAuth) return;
    if (activeTab !== 'orders' && activeTab !== 'products') return;
    void loadOrdersWithError();
  }, [activeTab, hasApiAuth, loadOrdersWithError]);

  useEffect(() => {
    if (!hasApiAuth) return;
    if (activeTab !== 'products' && activeTab !== 'analytics') return;
    void loadProductsWithError();
  }, [activeTab, hasApiAuth, loadProductsWithError]);

  const fetchMerchantAccount = useCallback(async () => {
    setAccountLoading(true);
    setAccountError(null);
    try {
      const res = await merchantFetch(`${apiBase}/v1/merchant/account`, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) {
        throw new Error(await apiError(res, 'Failed to load merchant account'));
      }
      const data = await res.json();
      setMerchantAccount(data);
      setKycForm((prev) => ({
        ...prev,
        business_name: data.business_name || prev.business_name,
        bank_account: {
          account_holder_name: data.bank_account?.account_holder_name || prev.bank_account.account_holder_name,
          bank_name: data.bank_account?.bank_name || prev.bank_account.bank_name,
          account_number: '',
          branch_code: data.bank_account?.branch_code || prev.bank_account.branch_code,
          account_type: data.bank_account?.account_type || prev.bank_account.account_type,
        },
      }));
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load merchant account';
      setAccountError(msg);
    } finally {
      setAccountLoading(false);
    }
  }, [apiBase]);

  const fetchPayoutLogs = useCallback(async () => {
    setPayoutsLoading(true);
    try {
      const res = await merchantFetch(`${apiBase}/v1/merchant/payouts`, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) {
        throw new Error('Failed to load payouts');
      }
      const data = await res.json();
      setPayoutLogs(Array.isArray(data) ? data : []);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load payouts';
      showToast(msg, 'error');
    } finally {
      setPayoutsLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    if (!hasApiAuth) return;
    fetchMerchantAccount();
    fetchPayoutLogs();
  }, [fetchMerchantAccount, fetchPayoutLogs, hasApiAuth]);

  useEffect(() => {
    if (!hasApiAuth) return;
    if (activeTab !== 'kyc-payouts') return;
    fetchMerchantAccount();
    fetchPayoutLogs();
  }, [activeTab, fetchMerchantAccount, fetchPayoutLogs, hasApiAuth]);

  const handleStartKyc = async (payload: KycSubmitPayload = kycForm) => {
    setKycSubmitting(true);
    try {
      const res = await merchantFetch(`${apiBase}/v1/merchant/kyc/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error(await apiError(res, 'Failed to submit KYC'));
      }
      const updated = await res.json();
      setMerchantAccount(updated.account || updated);
      setKycForm(payload);
      showToast('KYC submitted for review', 'success');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to submit KYC';
      showToast(msg, 'error');
    } finally {
      setKycSubmitting(false);
    }
  };

  const fetchNotifications = useCallback(async () => {
    setNotificationsLoading(true);
    setNotificationsError(null);
    try {
      const res = await merchantFetch(`${apiBase}/v1/merchant/notifications`, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) {
        throw new Error('Failed to load notifications');
      }
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load notifications';
      setNotificationsError(msg);
    } finally {
      setNotificationsLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    if (!hasApiAuth) return;
    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 15000);
    return () => clearInterval(intervalId);
  }, [fetchNotifications, hasApiAuth]);

  const markNotificationRead = useCallback(async (id: string) => {
    setUpdatingNotificationId(id);
    try {
      const res = await merchantFetch(`${apiBase}/v1/merchant/notifications/${id}`, {
        method: 'PATCH',
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) {
        throw new Error('Failed to mark notification as read');
      }
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to mark notification as read';
      setNotificationsError(msg);
      showToast(msg, 'error');
    } finally {
      setUpdatingNotificationId(null);
    }
  }, [apiBase]);

  const markAllNotificationsRead = useCallback(async () => {
    try {
      // Capture current unread IDs without making notifications a dependency
      let unreadIds: string[] = [];
      setNotifications((prev) => {
        unreadIds = prev.filter((n) => !n.read).map((n) => n.id);
        return prev; // Don't modify state, just read it
      });
      if (unreadIds.length === 0) return;
      
      await Promise.all(
        unreadIds.map((id) =>
          merchantFetch(`${apiBase}/v1/merchant/notifications/${id}`, {
            method: 'PATCH',
            headers: { Accept: 'application/json' },
          })
        )
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to mark all as read';
      setNotificationsError(msg);
      showToast(msg, 'error');
    }
  }, [apiBase]);

  useEffect(() => {
    if (activeTab !== 'notifications') return;
    const timeoutId = window.setTimeout(() => {
      markAllNotificationsRead();
    }, 2000);
    return () => window.clearTimeout(timeoutId);
  }, [activeTab, markAllNotificationsRead]);

  const handleMarkAsFulfilled = async (orderId: string) => {
    try {
      await fulfillOrder(orderId);
      showToast('Order marked as fulfilled', 'success');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to mark order as fulfilled';
      setOrdersError(msg);
      showToast(msg, 'error');
    }
  };

  const handleUploadSlip = async (orderId: string, file: File) => {
    try {
      const slipUrl = await uploadSlip(orderId, file);
      if (slipUrl) showToast('Shipment slip uploaded', 'success');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to upload slip';
      showToast(msg, 'error');
    }
  };

  const handleMarkAsShipped = async (orderId: string, slipUrl: string) => {
    try {
      await markAsShipped(orderId, slipUrl);
      showToast('Order marked as shipped', 'success');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to mark as shipped';
      setOrdersError(msg);
      showToast(msg, 'error');
    }
  };

  const handleRestockProduct = useCallback(async (productId: string) => {
    setRestockingProductId(productId);
    try {
      await restockProduct(productId);
      showToast('Stock increased by 10 units', 'success');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to restock product';
      showToast(msg, 'error');
    } finally {
      setRestockingProductId(null);
    }
  }, [restockProduct]);

  const handleCopyMatter = async (productId: string, value?: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedMatterId(productId);
      window.setTimeout(() => setCopiedMatterId(null), 1500);
    } catch {
      showToast('Failed to copy matter link', 'error');
    }
  };

  const handleCopyPage = async (productId: string, hash?: string) => {
    if (!hash) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/product/${hash}`);
      setCopiedPageId(productId);
      window.setTimeout(() => setCopiedPageId(null), 1500);
    } catch {
      showToast('Failed to copy product page', 'error');
    }
  };

  const handleRemoveProduct = async (id: string) => {
    try {
      await handleDeleteProduct(id);
      showToast('Product removed', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to remove product', 'error');
    }
  };

  const stats = useMemo(() => ({
    active: products.filter(p => p.status === 'Active').length,
    pending: products.filter(p => p.status === 'Pending').length,
    totalSales: products.reduce((sum, p) => sum + p.sales, 0),
    avgScore: products.length === 0
      ? '0.0'
      : (products.reduce((sum, p) => sum + p.ethicalScore, 0) / products.length).toFixed(1)
  }), [products]);

  const analyticsSnapshot = analytics.viewModel;

  const renderMyProducts = () => {
    const lowStockProducts = products.filter((product) => product.stock < 5);
    const recentOrders = orders.slice(0, 3);
    const onboardingKycStatus = merchantAccount?.kyc_status;
    const shouldShowOnboardingBanner =
      showOnboardingBanner && products.length === 0;

    return (
      <div className="space-y-6">
        {analyticsError && <ErrorBanner message={analyticsError} onDismiss={() => setAnalyticsError(null)} />}
        {ordersError && <ErrorBanner message={ordersError} onDismiss={() => setOrdersError(null)} />}
        {accountError && <ErrorBanner message={accountError} onDismiss={() => setAccountError(null)} />}
        {productsError && <ErrorBanner message={productsError} onDismiss={() => setProductsError(null)} />}

        {(isLoadingOrders || accountLoading || isLoadingProducts) && <InlineSpinner label="Loading dashboard data..." />}

        {merchantAccount?.kyc_status !== 'approved' && (
          <div className="rounded-xl border border-[var(--ff-warning-border)] bg-[var(--ff-warning-subtle)] p-4 text-sm text-[var(--ff-warning-bold)]">
            <p className="font-semibold">KYC is not approved yet.</p>
            <p className="mt-1 text-[var(--ff-warning-bold)]">Complete KYC in the KYC & Payouts tab to unlock full payout processing.</p>
          </div>
        )}

        {shouldShowOnboardingBanner && (
          <div className="rounded-lg border border-[var(--ff-warning-border)] bg-[var(--ff-warning-subtle)] p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-[var(--ff-warning)]">Welcome — let's get you set up</h3>
                <p className="mt-1 text-sm text-[var(--ff-ink-muted)]">
                  Complete these three steps to start selling.
                </p>
              </div>
              <button
                onClick={() => setShowOnboardingBanner(false)}
                className="text-[var(--ff-ink-muted)] hover:text-[var(--ff-ink)]"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {[
                {
                  done: products.length > 0,
                  label: 'Create your first product',
                  action: () => setShowCreateModal(true),
                  cta: 'Create product',
                },
                {
                  done: onboardingKycStatus === 'pending' || onboardingKycStatus === 'approved',
                  label: 'Submit KYC verification',
                  action: () => setActiveTab('kyc-payouts'),
                  cta: 'Start KYC',
                },
                {
                  done: merchantAccount?.bank_account != null,
                  label: 'Add your bank account for payouts',
                  action: () => setActiveTab('kyc-payouts'),
                  cta: 'Add bank account',
                },
              ].map((step, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      step.done ? 'bg-[var(--ff-success)] text-[var(--ff-neutral)]' : 'bg-[var(--ff-neutral-subtle)] text-[var(--ff-ink-muted)]'
                    }`}>
                      {step.done ? '✓' : i + 1}
                    </span>
                    <span className={`text-sm ${step.done ? 'text-[var(--ff-ink-muted)] line-through' : 'text-[var(--ff-ink)]'}`}>
                      {step.label}
                    </span>
                  </div>
                  {!step.done && (
                    <button
                      onClick={step.action}
                      className="text-xs text-[var(--ff-warning)] hover:text-[var(--ff-warning-bold)] underline"
                    >
                      {step.cta} →
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard label="Active Products" value={stats.active} color="green" />
          <MetricCard label="Pending Review" value={stats.pending} color="amber" />
          <MetricCard label="Pending Payout" value={`R ${((merchantAccount?.pending_payout ?? 0) / 100).toFixed(2)}`} color="blue" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-[var(--ff-neutral)]/70 border border-[var(--ff-border-light)] rounded-xl p-4">
            <h3 className="font-semibold mb-3">Recent Orders</h3>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-[var(--ff-neutral-muted)]">No recent orders yet.</p>
            ) : (
              <div className="space-y-2">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between text-sm">
                    <span className="text-[var(--ff-neutral-bold)] truncate mr-2">{order.customer_email}</span>
                    <span className={`text-xs px-2 py-1 rounded ${order.fulfillment_status === 'fulfilled' ? 'bg-[var(--ff-success-subtle)] text-[var(--ff-success)]' : 'bg-[var(--ff-warning-subtle)] text-[var(--ff-warning)]'}`}>
                      {order.fulfillment_status === 'fulfilled' ? 'Fulfilled' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[var(--ff-neutral)]/70 border border-[var(--ff-border-light)] rounded-xl p-4">
            <h3 className="font-semibold mb-3">Low Stock Alerts</h3>
            {lowStockProducts.length === 0 ? (
              <p className="text-sm text-[var(--ff-neutral-muted)]">No low stock alerts.</p>
            ) : (
              <div className="space-y-2">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between gap-3 rounded-lg border border-[var(--ff-warning-border)] bg-[var(--ff-warning-subtle)] p-3">
                    <p className="text-sm text-[var(--ff-warning)]">{product.name} has {product.stock} unit(s) remaining</p>
                    <button
                      onClick={() => handleRestockProduct(product.id)}
                      disabled={restockingProductId === product.id}
                      className="bg-[var(--ff-warning)] hover:bg-[var(--ff-warning-bold)] disabled:bg-[var(--ff-neutral-subtle)] text-[var(--ff-ink)] px-4 py-3 min-h-[44px] rounded-lg text-xs font-medium transition"
                    >
                      {restockingProductId === product.id ? 'Restocking...' : 'Restock'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {isLoadingProducts ? (
          <div className="bg-[var(--ff-neutral)]/70 border border-[var(--ff-border-light)] rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--ff-neutral-subtle)]">
                <tr>
                  <th className="px-6 py-3 text-left text-[var(--ff-neutral-bold)]">Product</th>
                  <th className="px-6 py-3 text-left text-[var(--ff-neutral-bold)]">Category</th>
                  <th className="px-6 py-3 text-right text-[var(--ff-neutral-bold)]">Price</th>
                  <th className="px-6 py-3 text-right text-[var(--ff-neutral-bold)]">Stock</th>
                  <th className="px-6 py-3 text-center text-[var(--ff-neutral-bold)]">Status</th>
                  <th className="px-6 py-3 text-left text-[var(--ff-neutral-bold)]">Links</th>
                  <th className="px-6 py-3 text-right text-[var(--ff-neutral-bold)]">Action</th>
                </tr>
              </thead>
              <tbody>
                {[0, 1, 2].map((index) => (
                  <tr key={index} className="border-t border-[var(--ff-border)]">
                    <td className="px-6 py-4" colSpan={7}>
                      <div className="h-4 bg-[var(--ff-neutral-subtle)] rounded animate-pulse w-full" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : products.length === 0 ? (
          <EmptyState icon={<Package className="w-10 h-10 text-[var(--ff-neutral-muted)]" />} title="No products yet" description="No products yet. Create your first product to begin selling." />
        ) : (
          <div className="bg-[var(--ff-neutral)]/70 border border-[var(--ff-border-light)] rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--ff-neutral-subtle)]">
                <tr>
                  <th className="px-6 py-3 text-left text-[var(--ff-neutral-bold)]">Product</th>
                  <th className="px-6 py-3 text-left text-[var(--ff-neutral-bold)]">Category</th>
                  <th className="px-6 py-3 text-right text-[var(--ff-neutral-bold)]">Price</th>
                  <th className="px-6 py-3 text-right text-[var(--ff-neutral-bold)]">Stock</th>
                  <th className="px-6 py-3 text-center text-[var(--ff-neutral-bold)]">Status</th>
                  <th className="px-6 py-3 text-left text-[var(--ff-neutral-bold)]">Links</th>
                  <th className="px-6 py-3 text-right text-[var(--ff-neutral-bold)]">Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-t border-[var(--ff-border-light)] hover:bg-[var(--ff-neutral-subtle)]">
                    <td className="px-6 py-4">{p.name}</td>
                    <td className="px-6 py-4 text-[var(--ff-ink-muted)]">{p.category}</td>
                    <td className="px-6 py-4 text-right font-mono">R {p.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">{p.stock}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-xs px-2 py-1 rounded ${
                        p.status === 'Active' ? 'bg-[var(--ff-success-subtle)] text-[var(--ff-success)]' :
                        p.status === 'Pending' ? 'bg-[var(--ff-warning-subtle)] text-[var(--ff-warning)]' :
                        'bg-[var(--ff-error-subtle)] text-[var(--ff-error)]'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {p.thingUrl && p.hash && p.matterUri ? (
                        <div className="flex flex-col gap-2 text-xs">
                          <div className="flex items-center gap-2">
                            <a
                              href={p.thingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[var(--ff-info)] hover:text-[var(--ff-info-bold)]"
                            >
                              .thing URL
                            </a>
                          </div>
                          <div className="text-[var(--ff-success)] font-mono break-all" title="Matter URI">
                            {p.matterUri}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[var(--ff-neutral-muted)] text-xs">Not compiled</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {p.hash ? (
                          <>
                            <button
                              onClick={() => handleCopyMatter(p.id, p.matterUri)}
                              className="min-h-[44px] rounded-lg border border-[var(--ff-border)] bg-[var(--ff-surface)] px-3 py-2 text-xs text-[var(--ff-ink)] hover:brightness-95"
                            >
                              {copiedMatterId === p.id ? 'Copied!' : 'Copy matter://'}
                            </button>
                            <a
                              href={`/product/${p.hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-[var(--ff-cta)] hover:bg-[var(--ff-cta-hover)] text-[var(--ff-neutral)] px-3 py-2 min-h-[44px] rounded-lg text-xs"
                            >
                              View Page ↗
                            </a>
                            <button
                              onClick={() => handleCopyPage(p.id, p.hash)}
                              className="min-h-[44px] rounded-lg border border-[var(--ff-border)] bg-[var(--ff-surface)] px-3 py-2 text-xs text-[var(--ff-ink)] hover:brightness-95"
                            >
                              {copiedPageId === p.id ? 'Copied!' : 'Copy page'}
                            </button>
                          </>
                        ) : (
                          <span className="text-[var(--ff-neutral-muted)] text-xs">Pending</span>
                        )}
                        <button onClick={() => handleRemoveProduct(p.id)} className="text-[var(--ff-error)] hover:text-[var(--ff-error-bold)] text-xs min-h-[44px] px-2">
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-[var(--ff-cta)] text-[var(--ff-neutral)] rounded hover:bg-[var(--ff-cta-hover)] text-sm font-medium"
        >
          + Create Product
        </button>
      </div>
    );
  };

  const renderAnalytics = () => (
    <div className="space-y-6">
      {analyticsError && (
        <ErrorBanner message={analyticsError} onDismiss={() => setAnalyticsError(null)} />
      )}
      {isLoadingAnalytics && (
        <InlineSpinner label="Loading analytics..." />
      )}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard label="Total Views" value={analytics.summary.totalViews.toLocaleString()} color="green" />
        <MetricCard label="Checkout Clicks" value={analytics.summary.totalClicks.toLocaleString()} color="blue" />
        <MetricCard label="Active Products" value={stats.active} color="blue" />
        <MetricCard label="Total Inventory" value={products.reduce((sum, p) => sum + p.stock, 0)} unit="units" color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[var(--ff-neutral)]/70 border border-[var(--ff-border-light)] rounded-xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Engagement Trend (Last 30 Days)</h3>
            <span className="text-xs text-[var(--ff-neutral-muted)]">Views vs Clicks</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsSnapshot.engagementTrend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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

        <div className="bg-[var(--ff-neutral)]/70 border border-[var(--ff-border-light)] rounded-xl p-6">
          <h3 className="font-bold mb-4">Checkout Funnel</h3>
          <div className="space-y-4">
            {analyticsSnapshot.funnel.map((stage) => (
              <div key={stage.stage} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--ff-ink-muted)]">{stage.stage}</span>
                  <span className="font-mono text-[var(--ff-ink)]">{stage.count.toLocaleString()}</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--ff-neutral-subtle)]">
                  <div
                    className="h-2 rounded-full bg-[var(--ff-success)]"
                    style={{ width: `${Math.min(100, (stage.count / analyticsSnapshot.funnel[0].count) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
            <p className="text-xs text-[var(--ff-neutral-muted)]">Based on real view and click events.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--ff-neutral)]/70 border border-[var(--ff-border-light)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Top Products</h3>
            <span className="text-xs text-[var(--ff-neutral-muted)]">Checkout Clicks</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsSnapshot.topProducts} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid stroke="#1f2937" strokeDasharray="4 4" />
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1f2937', color: '#e2e8f0' }} />
                <Bar dataKey="clicks" fill="var(--ff-info)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[var(--ff-neutral)]/70 border border-[var(--ff-border-light)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Engagement by Category</h3>
            <span className="text-xs text-[var(--ff-neutral-muted)]">Checkout Clicks</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsSnapshot.categoryEngagement} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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

      <div className="bg-[var(--ff-neutral)]/70 border border-[var(--ff-border-light)] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
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
              {analyticsSnapshot.topProducts.map((item) => (
                <tr key={item.name} className="border-b border-[var(--ff-border)] last:border-0">
                  <td className="py-2 text-[var(--ff-ink)]">{item.name}</td>
                  <td className="py-2 text-right text-[var(--ff-ink-muted)]">{item.stock}</td>
                  <td className="py-2 text-right text-[var(--ff-success-bold)]">{item.clicks.toLocaleString()}</td>
                </tr>
              ))}
              {analyticsSnapshot.topProducts.length === 0 && (
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

  const getPayoutStatusLabel = (order: MerchantOrder) => {
    if (order.payment_status === 'released') return 'Released to your account';
    if (order.payment_status === 'confirmed') return 'Releasing — customer confirmed';
    if (order.payment_status === 'shipped') return 'Held — awaiting customer confirmation';
    if (order.payment_status === 'held') return 'Held — upload slip and ship';
    if (order.payment_status === 'disputed') return 'Disputed — contact support';
    if (order.payout_status === 'pending_release') return 'Queued for bank transfer';
    if (order.payout_status === 'released') return 'Transferred to bank account';
    if (order.payout_status === 'failed') return 'Transfer failed — contact support';
    return 'Held — awaiting shipment';
  };

  const commissionRate = merchantAccount?.commission_rate ?? 0.03;

  const renderOrders = () => (
    <MerchantOrders
      orders={orders}
      ordersLoading={isLoadingOrders}
      ordersError={ordersError}
      fulfillingOrderId={fulfillingOrderId}
      uploadingSlipOrderId={uploadingSlipOrderId}
      commissionRate={commissionRate}
      onDismissOrdersError={() => setOrdersError(null)}
      onMarkAsFulfilled={handleMarkAsFulfilled}
      onUploadSlip={handleUploadSlip}
      onMarkAsShipped={handleMarkAsShipped}
      onDeliveryDateSaved={(orderId, date) => updateOrder(orderId, { estimated_delivery_date: date })}
      getPayoutStatusLabel={getPayoutStatusLabel}
      apiBase={apiBase}
      authToken={authToken}
    />
  );

  const formatRelativeTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  };

  const formatCents = (value: number | null | undefined) => {
    const numeric = typeof value === 'number' && Number.isFinite(value) ? value : 0;
    return `R ${(numeric / 100).toFixed(2)}`;
  };

  const renderNotifications = () => (
    <MerchantNotifications
      notifications={notifications}
      notificationsLoading={notificationsLoading}
      notificationsError={notificationsError}
      updatingNotificationId={updatingNotificationId}
      onDismissNotificationsError={() => setNotificationsError(null)}
      onMarkAllNotificationsRead={markAllNotificationsRead}
      onMarkNotificationRead={markNotificationRead}
      formatRelativeTime={formatRelativeTime}
    />
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderKycPayouts = () => (
    <MerchantKYCPayouts
      kycSubmitting={kycSubmitting}
      kycForm={kycForm}
      merchantAccount={merchantAccount}
      payoutLogs={payoutLogs}
      payoutsLoading={payoutsLoading}
      accountLoading={accountLoading}
      accountError={accountError}
      commissionRate={commissionRate}
      onDismissAccountError={() => setAccountError(null)}
      onStartKyc={handleStartKyc}
      formatCents={formatCents}
    />
  );

  const renderMyAccount = () => (
    <div className="space-y-6">
      <div className="bg-[var(--ff-neutral)]/70 border border-[var(--ff-border-light)] rounded-xl p-6">
        <h3 className="font-bold mb-6">Business Profile</h3>
        <div className="space-y-4">
          <div>
            <label className="text-[var(--ff-ink-muted)] text-sm block mb-2">Business Name</label>
            <input
              type="text"
              value={businessProfile.businessName}
              onChange={(e) => setBusinessProfile({ ...businessProfile, businessName: e.target.value })}
              className="w-full bg-[var(--ff-neutral-subtle)] border border-[var(--ff-border-light)] rounded-lg px-4 py-3 text-[var(--ff-form-text)]"
            />
          </div>
          <div>
            <label className="text-[var(--ff-ink-muted)] text-sm block mb-2">Contact Email</label>
            <input
              type="email"
              value={businessProfile.contactEmail}
              onChange={(e) => setBusinessProfile({ ...businessProfile, contactEmail: e.target.value })}
              className="w-full bg-[var(--ff-neutral-subtle)] border border-[var(--ff-border-light)] rounded-lg px-4 py-3 text-[var(--ff-form-text)]"
            />
          </div>
          <div>
            <label className="text-[var(--ff-ink-muted)] text-sm block mb-2">Phone</label>
            <input
              type="tel"
              value={businessProfile.phone}
              onChange={(e) => setBusinessProfile({ ...businessProfile, phone: e.target.value })}
              className="w-full bg-[var(--ff-neutral-subtle)] border border-[var(--ff-border-light)] rounded-lg px-4 py-3 text-[var(--ff-form-text)]"
            />
          </div>
          <div>
            <label className="text-[var(--ff-ink-muted)] text-sm block mb-2">Business Address</label>
            <textarea
              value={businessProfile.address}
              onChange={(e) => setBusinessProfile({ ...businessProfile, address: e.target.value })}
              className="w-full bg-[var(--ff-neutral-subtle)] border border-[var(--ff-border-light)] rounded-lg px-4 py-3 text-[var(--ff-form-text)] h-20"
            />
          </div>
          <div>
            <label className="text-[var(--ff-ink-muted)] text-sm block mb-2">Certifications</label>
            <input
              type="text"
              value={businessProfile.certifications}
              onChange={(e) => setBusinessProfile({ ...businessProfile, certifications: e.target.value })}
              className="w-full bg-[var(--ff-neutral-subtle)] border border-[var(--ff-border-light)] rounded-lg px-4 py-3 text-[var(--ff-form-text)]"
            />
          </div>
          <div>
            <label className="text-[var(--ff-ink-muted)] text-sm block mb-2">Year Established</label>
            <input
              type="text"
              value={businessProfile.yearEstablished}
              onChange={(e) => setBusinessProfile({ ...businessProfile, yearEstablished: e.target.value })}
              className="w-full bg-[var(--ff-neutral-subtle)] border border-[var(--ff-border-light)] rounded-lg px-4 py-3 text-[var(--ff-form-text)]"
            />
          </div>
        </div>
        <button
          onClick={() => showToast('Changes saved', 'success')}
          className="mt-6 bg-[var(--ff-cta)] hover:bg-[var(--ff-cta-hover)] px-6 py-3 rounded-xl font-medium transition"
        >
          Save Changes
        </button>
      </div>
      <div className="bg-[var(--ff-neutral)]/70 border border-[var(--ff-border-light)] rounded-xl p-6">
        <h3 className="font-bold mb-6">Bank Account Details</h3>
        <p className="text-[var(--ff-ink-muted)] text-sm mb-4">For receiving weekly payouts to your merchant account</p>
        <div className="space-y-4">
          <div>
            <label className="text-[var(--ff-ink-muted)] text-sm block mb-2">Account Holder Name</label>
            <input
              type="text"
              value={businessProfile.accountHolderName || ''}
              onChange={(e) => setBusinessProfile({ ...businessProfile, accountHolderName: e.target.value })}
              placeholder="Full name on bank account"
              className="w-full bg-[var(--ff-neutral-subtle)] border border-[var(--ff-border-light)] rounded-lg px-4 py-3 text-[var(--ff-form-text)]"
            />
          </div>
          <div>
            <label className="text-[var(--ff-ink-muted)] text-sm block mb-2">Bank Name</label>
            <input
              type="text"
              value={businessProfile.bankName || ''}
              onChange={(e) => setBusinessProfile({ ...businessProfile, bankName: e.target.value })}
              placeholder="e.g., Standard Bank"
              className="w-full bg-[var(--ff-neutral-subtle)] border border-[var(--ff-border-light)] rounded-lg px-4 py-3 text-[var(--ff-form-text)]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[var(--ff-ink-muted)] text-sm block mb-2">Account Number</label>
              <input
                type="text"
                value={businessProfile.accountNumber || ''}
                onChange={(e) => setBusinessProfile({ ...businessProfile, accountNumber: e.target.value })}
                placeholder="Account number"
                className="w-full bg-[var(--ff-neutral-subtle)] border border-[var(--ff-border-light)] rounded-lg px-4 py-3 text-[var(--ff-form-text)]"
              />
            </div>
            <div>
              <label className="text-[var(--ff-ink-muted)] text-sm block mb-2">Branch Code</label>
              <input
                type="text"
                value={businessProfile.branchCode || ''}
                onChange={(e) => setBusinessProfile({ ...businessProfile, branchCode: e.target.value })}
                placeholder="Branch code"
                className="w-full bg-[var(--ff-neutral-subtle)] border border-[var(--ff-border-light)] rounded-lg px-4 py-3 text-[var(--ff-form-text)]"
              />
            </div>
          </div>
          {merchantAccount?.bank_account?.bank_name && (
            <div className="bg-[var(--ff-neutral-subtle)] border border-[var(--ff-border-light)]/50 rounded-lg p-4 mt-4">
              <p className="text-[var(--ff-ink-muted)] text-sm mb-2">Current Bank Details:</p>
              <p className="text-[var(--ff-ink)] text-sm">{merchantAccount.bank_account.account_holder_name}</p>
              <p className="text-[var(--ff-ink-muted)] text-sm">{merchantAccount.bank_account.bank_name}</p>
              <p className="text-[var(--ff-neutral-muted)] text-sm">Account: ...{merchantAccount.bank_account.account_number?.slice(-4)}</p>
            </div>
          )}
        </div>
        <button
          onClick={async () => {
            if (!businessProfile.accountHolderName || !businessProfile.accountNumber || !businessProfile.branchCode || !businessProfile.bankName) {
              showToast('Please fill in all bank account fields', 'error');
              return;
            }
            try {
              const token = localStorage.getItem('merchantToken');
              const res = await fetch(`${apiBase}/v1/merchant/account/bank`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                  account_name: businessProfile.accountHolderName,
                  account_number: businessProfile.accountNumber,
                  branch_code: businessProfile.branchCode,
                  bank_name: businessProfile.bankName,
                }),
              });
              const data = await res.json();
              if (!res.ok) {
                showToast(data.message || 'Failed to update bank account', 'error');
                return;
              }
              setMerchantAccount(data.account);
              showToast('Bank account updated successfully', 'success');
            } catch (error) {
              showToast(`Error: ${error instanceof Error ? error.message : 'Failed to update'}`, 'error');
            }
          }}
          className="mt-6 bg-[var(--ff-cta)] hover:bg-[var(--ff-cta-hover)] px-6 py-3 rounded-xl font-medium transition"
        >
          Update Bank Details
        </button>
      </div>
      <div className="bg-[var(--ff-neutral)]/70 border border-[var(--ff-border-light)] rounded-xl p-6">
        <h3 className="font-bold mb-4">Account Settings</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[var(--ff-ink-muted)]">Two-Factor Authentication</span>
            <button className="text-[var(--ff-success)] hover:text-[var(--ff-success-bold)] text-sm">Enable</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <TabShell
      title={<FairflowLogo markHeight={32} variant="light" style={logoStyle} />}
      tabs={tabs}
      activeTab={activeTab as string}
      onTabChange={(tab) => setActiveTab(tab as Tab)}
      onLogout={signOut}
      headerActions={(
        <button
          onClick={() => setActiveTab('notifications')}
          className="relative rounded-lg border border-[var(--ff-border)] bg-[var(--ff-surface)] p-2 transition-colors hover:brightness-95"
          aria-label="Open notifications"
        >
          <Bell className="w-4 h-4 text-[var(--ff-ink)]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--ff-error)] text-[var(--ff-neutral)] text-[10px] leading-[18px] font-semibold">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      )}
    >
      <div className="space-y-6">
        {activeTab === 'products' && renderMyProducts()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'orders' && renderOrders()}
        {activeTab === 'notifications' && renderNotifications()}
        {activeTab === 'kyc-payouts' && renderKycPayouts()}
        {activeTab === 'account' && renderMyAccount()}
      </div>

      <CreateProductModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={(product) => {
          setShowCreateModal(false);
          if (product?.thing_file?.matter_uri) {
            showToast('Product created with matter:// URI', 'success');
          } else {
            showToast('Product created', 'success');
          }
          void loadProductsWithError();
        }}
      />

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </TabShell>
  );
}
