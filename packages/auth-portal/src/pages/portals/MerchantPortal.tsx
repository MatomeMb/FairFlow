import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { TabShell } from '../../components/layout/TabShell';
import { FairflowLogo, type LogoStyle, LOGO_STYLES } from '../../components/FairflowLogo';
import { useAuth } from '../../context/AuthContext';
import { Toast } from '../../components/shared/Toast';
import CreateProductModal from '../../components/CreateProductModal';
import { type KycSubmitPayload } from '../../components/KYCForm';
import { Bell } from 'lucide-react';
import type { MerchantOrder, MerchantNotification, MerchantAccount, PayoutLog } from '../../types/merchant';
import { MerchantOrders } from './merchant/MerchantOrders';
import { MerchantNotifications } from './merchant/MerchantNotifications';
import { MerchantKYCPayouts } from './merchant/MerchantKYCPayouts';
import { apiBase } from '../../lib/config';
import { useMerchantAuthToken } from '../../features/merchant-portal/hooks/useMerchantAuthToken';
import { useMerchantProducts } from '../../features/merchant-portal/hooks/useMerchantProducts';
import { useMerchantOrders } from '../../features/merchant-portal/hooks/useMerchantOrders';
import { useMerchantAnalytics } from '../../features/merchant-portal/hooks/useMerchantAnalytics';
import { MerchantProductsSection } from '../../features/merchant-portal/components/MerchantProductsSection';
import { MerchantAnalyticsSection } from '../../features/merchant-portal/components/MerchantAnalyticsSection';
import { MerchantAccountSection, type BusinessProfile } from '../../features/merchant-portal/components/MerchantAccountSection';
import { useVisibilityAwareInterval } from '../../hooks/useVisibilityAwareInterval';

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
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>({
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

  const tabs = useMemo(() => [
    { id: 'products', label: 'My Products' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'orders', label: 'Orders' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'kyc-payouts', label: 'KYC & Payouts' },
    { id: 'account', label: 'My Account' }
  ], []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);
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
  }, [apiBase, merchantFetch]);

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
  }, [apiBase, merchantFetch, showToast]);

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
  }, [apiBase, merchantFetch]);

  useEffect(() => {
    if (!hasApiAuth) return;
    fetchNotifications();
  }, [fetchNotifications, hasApiAuth]);

  useVisibilityAwareInterval(
    () => {
      if (!hasApiAuth) return;
      void fetchNotifications();
    },
    hasApiAuth ? 15000 : null
  );

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
  }, [apiBase, merchantFetch, showToast]);

  const markAllNotificationsRead = useCallback(async () => {
    try {
      const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
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
  }, [apiBase, merchantFetch, notifications, showToast]);

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

  const handleUploadSlip = useCallback(async (orderId: string, file: File) => {
    try {
      const slipUrl = await uploadSlip(orderId, file);
      if (slipUrl) showToast('Shipment slip uploaded', 'success');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to upload slip';
      showToast(msg, 'error');
    }
  }, [showToast, uploadSlip]);

  const handleMarkAsShipped = useCallback(async (orderId: string, slipUrl: string) => {
    try {
      await markAsShipped(orderId, slipUrl);
      showToast('Order marked as shipped', 'success');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to mark as shipped';
      setOrdersError(msg);
      showToast(msg, 'error');
    }
  }, [markAsShipped, showToast]);

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
  }, [restockProduct, showToast]);

  const handleCopyMatter = useCallback(async (productId: string, value?: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedMatterId(productId);
      window.setTimeout(() => setCopiedMatterId(null), 1500);
    } catch {
      showToast('Failed to copy matter link', 'error');
    }
  }, [showToast]);

  const handleCopyPage = useCallback(async (productId: string, hash?: string) => {
    if (!hash) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/product/${hash}`);
      setCopiedPageId(productId);
      window.setTimeout(() => setCopiedPageId(null), 1500);
    } catch {
      showToast('Failed to copy product page', 'error');
    }
  }, [showToast]);

  const handleRemoveProduct = useCallback(async (id: string) => {
    try {
      await handleDeleteProduct(id);
      showToast('Product removed', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to remove product', 'error');
    }
  }, [handleDeleteProduct, showToast]);

  const handleBusinessProfileChange = useCallback((updates: Partial<BusinessProfile>) => {
    setBusinessProfile((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleSaveBusinessProfile = useCallback(async () => {
    if (!businessProfile.businessName || !businessProfile.contactEmail || !businessProfile.phone) {
      showToast('Please fill in business name, email, and phone', 'error');
      return;
    }

    try {
      const res = await merchantFetch(`${apiBase}/v1/merchant/account`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          business_name: businessProfile.businessName,
          phone: businessProfile.phone,
          address: businessProfile.address,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || 'Failed to save business profile', 'error');
        return;
      }
      setMerchantAccount(data.account);
      showToast('Business profile updated successfully', 'success');
    } catch (error) {
      showToast(`Error: ${error instanceof Error ? error.message : 'Failed to save'}`, 'error');
    }
  }, [apiBase, businessProfile, merchantFetch, showToast]);

  const handleUpdateBankDetails = useCallback(async () => {
    if (!businessProfile.accountHolderName || !businessProfile.accountNumber || !businessProfile.branchCode || !businessProfile.bankName) {
      showToast('Please fill in all bank account fields', 'error');
      return;
    }

    try {
      const res = await merchantFetch(`${apiBase}/v1/merchant/account/bank`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
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
  }, [apiBase, businessProfile, merchantFetch, showToast]);

  const stats = useMemo(() => ({
    active: products.filter(p => p.status === 'Active').length,
    pending: products.filter(p => p.status === 'Pending').length,
    totalSales: products.reduce((sum, p) => sum + p.sales, 0),
    avgScore: products.length === 0
      ? '0.0'
      : (products.reduce((sum, p) => sum + p.ethicalScore, 0) / products.length).toFixed(1)
  }), [products]);

  const analyticsSnapshot = analytics.viewModel;

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

  const handleDismissOrdersError = useCallback(() => {
    setOrdersError(null);
  }, []);

  const handleDismissNotificationsError = useCallback(() => {
    setNotificationsError(null);
  }, []);

  const handleDismissAnalyticsError = useCallback(() => {
    setAnalyticsError(null);
  }, []);

  const handleDismissAccountError = useCallback(() => {
    setAccountError(null);
  }, []);

  const handleDismissProductsError = useCallback(() => {
    setProductsError(null);
  }, []);

  const handleDismissOnboardingBanner = useCallback(() => {
    setShowOnboardingBanner(false);
  }, []);

  const handleOpenCreateModal = useCallback(() => {
    setShowCreateModal(true);
  }, []);

  const handleGoToKycPayouts = useCallback(() => {
    setActiveTab('kyc-payouts');
  }, []);

  const handleOpenNotificationsTab = useCallback(() => {
    setActiveTab('notifications');
  }, []);

  const handleCloseCreateModal = useCallback(() => {
    setShowCreateModal(false);
  }, []);

  const handleCreatedProduct = useCallback((product?: { thing_file?: { matter_uri?: string } }) => {
    setShowCreateModal(false);
    if (product?.thing_file?.matter_uri) {
      showToast('Product created with matter:// URI', 'success');
    } else {
      showToast('Product created', 'success');
    }
    void loadProductsWithError();
  }, [loadProductsWithError, showToast]);

  const renderOrders = () => (
    <MerchantOrders
      orders={orders}
      ordersLoading={isLoadingOrders}
      ordersError={ordersError}
      fulfillingOrderId={fulfillingOrderId}
      uploadingSlipOrderId={uploadingSlipOrderId}
      commissionRate={commissionRate}
      onDismissOrdersError={handleDismissOrdersError}
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
      onDismissNotificationsError={handleDismissNotificationsError}
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

  return (
    <TabShell
      title={<FairflowLogo markHeight={32} variant="light" style={logoStyle} />}
      tabs={tabs}
      activeTab={activeTab as string}
      onTabChange={(tab) => setActiveTab(tab as Tab)}
      onLogout={signOut}
      headerActions={(
        <button
          onClick={handleOpenNotificationsTab}
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
        {activeTab === 'products' && (
          <MerchantProductsSection
            ErrorBanner={ErrorBanner}
            InlineSpinner={InlineSpinner}
            products={products}
            orders={orders}
            merchantAccount={merchantAccount}
            analyticsError={analyticsError}
            ordersError={ordersError}
            accountError={accountError}
            productsError={productsError}
            onDismissAnalyticsError={handleDismissAnalyticsError}
            onDismissOrdersError={handleDismissOrdersError}
            onDismissAccountError={handleDismissAccountError}
            onDismissProductsError={handleDismissProductsError}
            isLoadingOrders={isLoadingOrders}
            accountLoading={accountLoading}
            isLoadingProducts={isLoadingProducts}
            showOnboardingBanner={showOnboardingBanner}
            onDismissOnboardingBanner={handleDismissOnboardingBanner}
            onOpenCreateModal={handleOpenCreateModal}
            onGoToKycPayouts={handleGoToKycPayouts}
            stats={stats}
            restockingProductId={restockingProductId}
            onRestockProduct={handleRestockProduct}
            copiedMatterId={copiedMatterId}
            copiedPageId={copiedPageId}
            onCopyMatter={handleCopyMatter}
            onCopyPage={handleCopyPage}
            onRemoveProduct={handleRemoveProduct}
          />
        )}
        {activeTab === 'analytics' && (
          <MerchantAnalyticsSection
            analyticsError={analyticsError}
            onDismissAnalyticsError={handleDismissAnalyticsError}
            ErrorBanner={ErrorBanner}
            InlineSpinner={InlineSpinner}
            isLoadingAnalytics={isLoadingAnalytics}
            summary={analytics.summary}
            stats={{ active: stats.active }}
            products={products}
            analyticsViewModel={analyticsSnapshot}
          />
        )}
        {activeTab === 'orders' && renderOrders()}
        {activeTab === 'notifications' && renderNotifications()}
        {activeTab === 'kyc-payouts' && renderKycPayouts()}
        {activeTab === 'account' && (
          <MerchantAccountSection
            businessProfile={businessProfile}
            merchantAccount={merchantAccount}
            onBusinessProfileChange={handleBusinessProfileChange}
            onSaveChanges={handleSaveBusinessProfile}
            onUpdateBankDetails={handleUpdateBankDetails}
          />
        )}
      </div>

      <CreateProductModal
        isOpen={showCreateModal}
        onClose={handleCloseCreateModal}
        onCreated={handleCreatedProduct}
      />

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </TabShell>
  );
}
