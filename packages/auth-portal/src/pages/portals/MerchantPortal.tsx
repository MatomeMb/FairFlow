import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { TabShell } from '../../components/layout/TabShell';
import { FairflowLogo } from '../../components/FairflowLogo';
import { useAuth } from '../../context/AuthContext';
import { MetricCard } from '../../components/shared/MetricCard';
import { Toast } from '../../components/shared/Toast';
import { EmptyState } from '../../components/shared/EmptyState';
import CreateProductModal from '../../components/CreateProductModal';
import { type KycSubmitPayload } from '../../components/KYCForm';
import { Package, Bell } from 'lucide-react';
import type { MerchantProductApi, MerchantOrder, MerchantNotification, MerchantAccount, PayoutLog } from '../../types/merchant';
import { MerchantOrders } from './merchant/MerchantOrders';
import { MerchantNotifications } from './merchant/MerchantNotifications';
import { MerchantKYCPayouts } from './merchant/MerchantKYCPayouts';
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

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  status: 'Active' | 'Pending' | 'Inactive';
  stock: number;
  sales: number;
  ethicalScore: number;
  matterUri?: string;
  thingUrl?: string;
  hash?: string;
}

type ReportRowDay = { date: string; views: number; clicks: number };
type ReportRowHash = { hash: string; views: number; clicks: number };

type Tab = 'products' | 'analytics' | 'orders' | 'notifications' | 'kyc-payouts' | 'account';

const InlineSpinner: React.FC<{ label: string }> = ({ label }) => (
  <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 text-sm text-stone-300 flex items-center gap-3">
    <svg className="w-5 h-5 text-emerald-400 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="4" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
    <span>{label}</span>
  </div>
);

const ErrorBanner: React.FC<{ message: string; onDismiss: () => void }> = ({ message, onDismiss }) => (
  <div className="bg-red-700 border border-red-500 rounded-xl px-4 py-3 text-sm text-white flex items-start justify-between gap-3">
    <p>{message}</p>
    <button
      type="button"
      onClick={onDismiss}
      className="text-white/90 hover:text-white leading-none min-h-[44px] min-w-[44px] flex items-center justify-center"
      aria-label="Dismiss error"
    >
      ✕
    </button>
  </div>
);

export const MerchantPortal: React.FC = () => {
  console.log('[MerchantPortal] Component body executing');
  const { signOut } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>('products');

  // Update page title
  React.useEffect(() => {
    document.title = 'fairflow — Merchant Dashboard';
  }, []);
  const [products, setProducts] = useState<Product[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [reportByDay, setReportByDay] = useState<ReportRowDay[]>([]);
  const [reportByHash, setReportByHash] = useState<ReportRowHash[]>([]);
  const [analyticsSummary, setAnalyticsSummary] = useState({ totalViews: 0, totalClicks: 0 });
  const [orders, setOrders] = useState<MerchantOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [fulfillingOrderId, setFulfillingOrderId] = useState<string | null>(null);
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
    yearEstablished: '2019'
  });
  const [showOnboardingBanner, setShowOnboardingBanner] = useState(true);
  const [authToken, setAuthToken] = useState<string | null>(null);

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

  // Use relative path in dev so Vite proxy hits backend (avoids CORS, ensures correct host)
  const apiBase = import.meta.env.VITE_API_BASE_URL ?? '';
  const hasApiAuth = Boolean(authToken || import.meta.env.VITE_API_KEY);

  // On mount: pick up token from URL or sessionStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    const urlError = params.get('error');

    console.log('[MerchantPortal] Mount effect - urlToken:', urlToken ? 'present' : 'absent');

    if (urlToken) {
      sessionStorage.setItem('merchantToken', urlToken);
      sessionStorage.setItem('merchant_token', urlToken);
      setAuthToken(urlToken);
      window.history.replaceState({}, '', '/dashboard/merchant');
    } else {
      // Load existing token from storage
      const existingToken = sessionStorage.getItem('merchantToken') || sessionStorage.getItem('merchant_token');
      console.log('[MerchantPortal] No URL token, using stored:', existingToken ? 'present' : 'absent');
      setAuthToken(existingToken);
    }

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
  
  // Redirect to login only when we're sure there is no token (avoids race: URL/storage are set before state updates)
  // Note: Only redirect if authToken was explicitly checked and is still missing after a delay
  React.useEffect(() => {
    console.log('[MerchantPortal] Redirect check - authToken:', authToken ? 'present' : 'absent');
    const timer = setTimeout(() => {
      const fromUrl = new URLSearchParams(window.location.search).get('token');
      const fromStorage = sessionStorage.getItem('merchantToken') || sessionStorage.getItem('merchant_token');
      // Only redirect if we've waited and still have no token from any source
      if (!fromUrl && !fromStorage && !authToken && !import.meta.env.VITE_API_KEY) {
        console.log('[MerchantPortal] Redirecting to login - no token found');
        window.location.href = '/login';
      }
    }, 500); // Wait 500ms to allow URL/storage to be processed
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (merchantAccount?.kyc_status !== 'not_started' || products.length > 0) {
      setShowOnboardingBanner(false);
    }
  }, [merchantAccount?.kyc_status, products.length]);

  // DEBUG: Track activeTab changes 
  useEffect(() => {
    console.log('[MerchantPortal] activeTab changed to:', activeTab);
  }, [activeTab]);

  const merchantFetch = (url: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> | undefined),
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    // Always send x-api-key when available so backend can fall back if JWT is stale
    if (import.meta.env.VITE_API_KEY) {
      headers['x-api-key'] = import.meta.env.VITE_API_KEY;
    }
    return fetch(url, { ...options, headers });
  };

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

  const mapProduct = (product: MerchantProductApi): Product => {
    const statusMap: Record<MerchantProductApi['status'], Product['status']> = {
      published: 'Active',
      draft: 'Pending',
      archived: 'Inactive',
    };

    return {
      id: product.id,
      name: product.title,
      category: product.category ?? 'Uncategorized',
      price: product.price_cents / 100,
      stock: product.stock_count,
      status: statusMap[product.status],
      sales: 0,
      ethicalScore: 0,
      matterUri: product.thing_file?.matter_uri,
      thingUrl: product.thing_file?.thing_url,
      hash: product.thing_file?.hash,
    };
  };

  const fetchMerchantProducts = useCallback(async () => {
    console.log('[MerchantPortal.fetchMerchantProducts] Running...');
    setProductsLoading(true);
    setProductsError(null);
    try {
      const res = await merchantFetch(`${apiBase}/v1/merchant/products`, {
        headers: { Accept: 'application/json', 'x-merchant-id': 'dev-merchant-001' },
      });
      if (!res.ok) {
        throw new Error(await apiError(res, 'Failed to load products'));
      }
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setProducts(list.map(mapProduct));
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load products';
      setProductsError(msg);
    } finally {
      setProductsLoading(false);
    }
  }, [apiBase, authToken]);

  const fetchAnalytics = useCallback(async () => {
    const formatDate = (date: Date) => date.toISOString().slice(0, 10);
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - 29);

    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const params = `from=${formatDate(from)}&to=${formatDate(to)}&limit=1000`;
      const [dayRes, hashRes] = await Promise.all([
        merchantFetch(`${apiBase}/v1/analytics/report?${params}&groupBy=day&sortBy=date`, {
          headers: { Accept: 'application/json' },
        }),
        merchantFetch(`${apiBase}/v1/analytics/report?${params}&groupBy=hash&sortBy=clicks`, {
          headers: { Accept: 'application/json' },
        }),
      ]);

      if (!dayRes.ok || !hashRes.ok) {
        const [dayErr, hashErr] = await Promise.all([
          dayRes.ok ? Promise.resolve('') : apiError(dayRes, 'Failed to load analytics'),
          hashRes.ok ? Promise.resolve('') : apiError(hashRes, 'Failed to load analytics'),
        ]);
        throw new Error(dayErr || hashErr || 'Failed to load analytics');
      }

      const dayData = await dayRes.json();
      const hashData = await hashRes.json();

      setReportByDay(dayData.rows || []);
      setReportByHash(hashData.rows || []);
      setAnalyticsSummary({
        totalViews: dayData.summary?.totalViews ?? 0,
        totalClicks: dayData.summary?.totalClicks ?? 0,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load analytics';
      setAnalyticsError(msg);
    } finally {
      setAnalyticsLoading(false);
    }
  }, [apiBase, authToken]);

  useEffect(() => {
    console.log('[MerchantPortal] Analytics effect - activeTab:', activeTab);
    if (activeTab !== 'analytics') return;
    fetchAnalytics();
    const intervalId = setInterval(fetchAnalytics, 10000);
    return () => clearInterval(intervalId);
  }, [activeTab, fetchAnalytics]);

  const fetchMerchantOrders = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const res = await merchantFetch(`${apiBase}/v1/merchant/orders`, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) {
        throw new Error(await apiError(res, 'Failed to load orders'));
      }
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load orders';
      setOrdersError(msg);
    } finally {
      setOrdersLoading(false);
    }
  }, [apiBase, authToken]);

  useEffect(() => {
    console.log('[MerchantPortal] Orders/Products effect - activeTab:', activeTab, 'hasApiAuth:', hasApiAuth);
    if (!hasApiAuth) return;
    if (activeTab !== 'orders' && activeTab !== 'products') return;
    fetchMerchantOrders();
  }, [activeTab, fetchMerchantOrders, hasApiAuth]);

  useEffect(() => {
    console.log('[MerchantPortal] Products/Analytics effect - activeTab:', activeTab, 'hasApiAuth:', hasApiAuth);
    if (!hasApiAuth) return;
    if (activeTab !== 'products' && activeTab !== 'analytics') return;
    fetchMerchantProducts();
  }, [activeTab, fetchMerchantProducts, hasApiAuth]);

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
  }, [apiBase, authToken]);

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
  }, [apiBase, authToken]);

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
  }, [apiBase, authToken]);

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
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;
    try {
      await Promise.all(
        unread.map((notification) =>
          merchantFetch(`${apiBase}/v1/merchant/notifications/${notification.id}`, {
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
  }, [apiBase, notifications]);

  useEffect(() => {
    if (activeTab !== 'notifications') return;
    const timeoutId = window.setTimeout(() => {
      markAllNotificationsRead();
    }, 2000);
    return () => window.clearTimeout(timeoutId);
  }, [activeTab, markAllNotificationsRead]);

  const handleMarkAsFulfilled = async (orderId: string) => {
    setFulfillingOrderId(orderId);
    try {
      const res = await merchantFetch(`${apiBase}/v1/merchant/orders/${orderId}/fulfill`, {
        method: 'PATCH',
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) {
        throw new Error('Failed to mark order as fulfilled');
      }
      const data = await res.json();
      if (data.ok && data.order) {
        setOrders((prev) => prev.map((order) => (order.id === orderId ? data.order : order)));
        showToast('Order marked as fulfilled', 'success');
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to mark order as fulfilled';
      setOrdersError(msg);
      showToast(msg, 'error');
    } finally {
      setFulfillingOrderId(null);
    }
  };

  const handleRestockProduct = useCallback(async (productId: string) => {
    setRestockingProductId(productId);
    try {
      const res = await merchantFetch(`${apiBase}/v1/merchant/products/${productId}/restock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ quantity: 10 }),
      });
      if (!res.ok) {
        throw new Error('Failed to restock product');
      }
      const data = await res.json();
      const nextStock = typeof data.stock_count === 'number' ? data.stock_count : null;
      if (nextStock !== null) {
        setProducts((prev) => prev.map((product) => (product.id === productId ? { ...product, stock: nextStock } : product)));
      }
      showToast('Stock increased by 10 units', 'success');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to restock product';
      showToast(msg, 'error');
    } finally {
      setRestockingProductId(null);
    }
  }, [apiBase]);

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

  const handleRemoveProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
    showToast('Product removed', 'success');
  };

  const stats = useMemo(() => ({
    active: products.filter(p => p.status === 'Active').length,
    pending: products.filter(p => p.status === 'Pending').length,
    totalSales: products.reduce((sum, p) => sum + p.sales, 0),
    avgScore: products.length === 0
      ? '0.0'
      : (products.reduce((sum, p) => sum + p.ethicalScore, 0) / products.length).toFixed(1)
  }), [products]);

  const analyticsSnapshot = useMemo(() => {
    const productByHash = new Map(
      products.filter((p) => p.hash).map((p) => [p.hash as string, p])
    );

    const engagementTrend = reportByDay.map((row) => ({
      label: row.date,
      views: row.views,
      clicks: row.clicks,
    }));

    const topProductsFromEvents = reportByHash.slice(0, 6).map((row) => {
      const product = productByHash.get(row.hash);
      return {
        name: product?.name ?? `${row.hash.slice(0, 8)}...`,
        views: row.views,
        clicks: row.clicks,
        stock: product?.stock ?? 0,
        category: product?.category ?? 'Uncategorized',
      };
    });

    const fallbackProducts = products.slice(0, 6).map((product) => ({
      name: product.name,
      views: 0,
      clicks: 0,
      stock: product.stock,
      category: product.category,
    }));

    const topProducts = topProductsFromEvents.length > 0 ? topProductsFromEvents : fallbackProducts;

    const categoryEngagement = Array.from(
      topProducts.reduce((acc, item) => {
        const current = acc.get(item.category) ?? 0;
        acc.set(item.category, current + item.clicks);
        return acc;
      }, new Map<string, number>())
    ).map(([category, clicks]) => ({ category, clicks }));

    const funnel = [
      { stage: 'Views', count: analyticsSummary.totalViews },
      { stage: 'Checkout Clicks', count: analyticsSummary.totalClicks },
    ];

    return { engagementTrend, categoryEngagement, topProducts, funnel };
  }, [products, reportByDay, reportByHash, analyticsSummary.totalViews, analyticsSummary.totalClicks]);

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

        {(ordersLoading || accountLoading || productsLoading) && <InlineSpinner label="Loading dashboard data..." />}

        {merchantAccount?.kyc_status !== 'approved' && (
          <div className="bg-amber-900/20 border border-amber-800/60 rounded-xl p-4 text-amber-300 text-sm">
            KYC is not approved yet. Complete KYC in the KYC & Payouts tab to unlock full payout processing.
          </div>
        )}

        {shouldShowOnboardingBanner && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-amber-400">Welcome — let's get you set up</h3>
                <p className="mt-1 text-sm text-stone-400">
                  Complete these three steps to start selling.
                </p>
              </div>
              <button
                onClick={() => setShowOnboardingBanner(false)}
                className="text-stone-400 hover:text-stone-200"
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
                      step.done ? 'bg-emerald-500 text-white' : 'bg-stone-700 text-stone-400'
                    }`}>
                      {step.done ? '✓' : i + 1}
                    </span>
                    <span className={`text-sm ${step.done ? 'text-stone-500 line-through' : 'text-stone-200'}`}>
                      {step.label}
                    </span>
                  </div>
                  {!step.done && (
                    <button
                      onClick={step.action}
                      className="text-xs text-amber-400 hover:text-amber-300 underline"
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
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
            <h3 className="font-semibold mb-3">Recent Orders</h3>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-stone-500">No recent orders yet.</p>
            ) : (
              <div className="space-y-2">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between text-sm">
                    <span className="text-stone-300 truncate mr-2">{order.customer_email}</span>
                    <span className={`text-xs px-2 py-1 rounded ${order.fulfillment_status === 'fulfilled' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-amber-900/50 text-amber-400'}`}>
                      {order.fulfillment_status === 'fulfilled' ? 'Fulfilled' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
            <h3 className="font-semibold mb-3">Low Stock Alerts</h3>
            {lowStockProducts.length === 0 ? (
              <p className="text-sm text-stone-500">No low stock alerts.</p>
            ) : (
              <div className="space-y-2">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between gap-3 rounded-lg border border-amber-800/40 bg-amber-900/10 p-3">
                    <p className="text-sm text-amber-300">{product.name} has {product.stock} unit(s) remaining</p>
                    <button
                      onClick={() => handleRestockProduct(product.id)}
                      disabled={restockingProductId === product.id}
                      className="bg-amber-600 hover:bg-amber-700 disabled:bg-stone-700 text-white px-4 py-3 min-h-[44px] rounded-lg text-xs font-medium transition"
                    >
                      {restockingProductId === product.id ? 'Restocking...' : 'Restock'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {productsLoading ? (
          <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-stone-800">
                <tr>
                  <th className="px-6 py-3 text-left text-stone-300">Product</th>
                  <th className="px-6 py-3 text-left text-stone-300">Category</th>
                  <th className="px-6 py-3 text-right text-stone-300">Price</th>
                  <th className="px-6 py-3 text-right text-stone-300">Stock</th>
                  <th className="px-6 py-3 text-center text-stone-300">Status</th>
                  <th className="px-6 py-3 text-left text-stone-300">Links</th>
                  <th className="px-6 py-3 text-right text-stone-300">Action</th>
                </tr>
              </thead>
              <tbody>
                {[0, 1, 2].map((index) => (
                  <tr key={index} className="border-t border-stone-800">
                    <td className="px-6 py-4" colSpan={7}>
                      <div className="h-4 bg-stone-800 rounded animate-pulse w-full" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : products.length === 0 ? (
          <EmptyState icon={<Package className="w-10 h-10 text-stone-500" />} title="No products yet" description="No products yet. Create your first product to begin selling." />
        ) : (
          <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-stone-800">
                <tr>
                  <th className="px-6 py-3 text-left text-stone-300">Product</th>
                  <th className="px-6 py-3 text-left text-stone-300">Category</th>
                  <th className="px-6 py-3 text-right text-stone-300">Price</th>
                  <th className="px-6 py-3 text-right text-stone-300">Stock</th>
                  <th className="px-6 py-3 text-center text-stone-300">Status</th>
                  <th className="px-6 py-3 text-left text-stone-300">Links</th>
                  <th className="px-6 py-3 text-right text-stone-300">Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-t border-stone-800 hover:bg-stone-800/50">
                    <td className="px-6 py-4">{p.name}</td>
                    <td className="px-6 py-4 text-stone-400">{p.category}</td>
                    <td className="px-6 py-4 text-right font-mono">R {p.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">{p.stock}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-xs px-2 py-1 rounded ${
                        p.status === 'Active' ? 'bg-emerald-900/50 text-emerald-500' :
                        p.status === 'Pending' ? 'bg-amber-900/50 text-amber-500' :
                        'bg-red-900/50 text-red-500'
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
                              className="text-blue-400 hover:text-blue-300"
                            >
                              .thing URL
                            </a>
                          </div>
                          <div className="text-emerald-400 font-mono break-all" title="Matter URI">
                            {p.matterUri}
                          </div>
                        </div>
                      ) : (
                        <span className="text-stone-500 text-xs">Not compiled</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {p.hash ? (
                          <>
                            <button
                              onClick={() => handleCopyMatter(p.id, p.matterUri)}
                              className="bg-stone-800 hover:bg-stone-700 text-stone-200 px-3 py-2 min-h-[44px] rounded-lg text-xs"
                            >
                              {copiedMatterId === p.id ? 'Copied!' : 'Copy matter://'}
                            </button>
                            <a
                              href={`/product/${p.hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 min-h-[44px] rounded-lg text-xs"
                            >
                              View Page ↗
                            </a>
                            <button
                              onClick={() => handleCopyPage(p.id, p.hash)}
                              className="bg-stone-800 hover:bg-stone-700 text-stone-200 px-3 py-2 min-h-[44px] rounded-lg text-xs"
                            >
                              {copiedPageId === p.id ? 'Copied!' : 'Copy page'}
                            </button>
                          </>
                        ) : (
                          <span className="text-stone-500 text-xs">Pending</span>
                        )}
                        <button onClick={() => handleRemoveProduct(p.id)} className="text-red-500 hover:text-red-400 text-xs min-h-[44px] px-2">
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
          className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm font-medium"
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
      {analyticsLoading && (
        <InlineSpinner label="Loading analytics..." />
      )}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard label="Total Views" value={analyticsSummary.totalViews.toLocaleString()} color="green" />
        <MetricCard label="Checkout Clicks" value={analyticsSummary.totalClicks.toLocaleString()} color="blue" />
        <MetricCard label="Active Products" value={stats.active} color="blue" />
        <MetricCard label="Total Inventory" value={products.reduce((sum, p) => sum + p.stock, 0)} unit="units" color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Engagement Trend (Last 30 Days)</h3>
            <span className="text-xs text-stone-500">Views vs Clicks</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsSnapshot.engagementTrend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="clicksFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1f2937" strokeDasharray="4 4" />
                <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1f2937', color: '#e2e8f0' }} />
                <Area type="monotone" dataKey="views" stroke="#38bdf8" fill="url(#viewsFill)" strokeWidth={2} />
                <Area type="monotone" dataKey="clicks" stroke="#10b981" fill="url(#clicksFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-xl p-6">
          <h3 className="font-bold mb-4">Checkout Funnel</h3>
          <div className="space-y-4">
            {analyticsSnapshot.funnel.map((stage) => (
              <div key={stage.stage} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-400">{stage.stage}</span>
                  <span className="font-mono text-stone-200">{stage.count.toLocaleString()}</span>
                </div>
                <div className="h-2 rounded-full bg-stone-800">
                  <div
                    className="h-2 rounded-full bg-emerald-500"
                    style={{ width: `${Math.min(100, (stage.count / analyticsSnapshot.funnel[0].count) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
            <p className="text-xs text-stone-500">Based on real view and click events.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Top Products</h3>
            <span className="text-xs text-stone-500">Checkout Clicks</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsSnapshot.topProducts} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid stroke="#1f2937" strokeDasharray="4 4" />
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1f2937', color: '#e2e8f0' }} />
                <Bar dataKey="clicks" fill="#38bdf8" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Engagement by Category</h3>
            <span className="text-xs text-stone-500">Checkout Clicks</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsSnapshot.categoryEngagement} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#1f2937" strokeDasharray="4 4" />
                <XAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1f2937', color: '#e2e8f0' }} />
                <Bar dataKey="clicks" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-stone-900 border border-stone-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">Inventory Snapshot</h3>
          <span className="text-xs text-stone-500">Stock vs. Clicks</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-stone-400">
              <tr className="border-b border-stone-800">
                <th className="py-2 text-left">Product</th>
                <th className="py-2 text-right">Stock</th>
                <th className="py-2 text-right">Clicks</th>
              </tr>
            </thead>
            <tbody>
              {analyticsSnapshot.topProducts.map((item) => (
                <tr key={item.name} className="border-b border-stone-800 last:border-0">
                  <td className="py-2 text-stone-200">{item.name}</td>
                  <td className="py-2 text-right text-stone-400">{item.stock}</td>
                  <td className="py-2 text-right text-emerald-400">{item.clicks.toLocaleString()}</td>
                </tr>
              ))}
              {analyticsSnapshot.topProducts.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-stone-500">No sales data yet. Create products to start tracking.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const getHoldingStatusLabel = (order: MerchantOrder) => {
    const kycApproved = merchantAccount?.kyc_status === 'approved';
    const consumerConfirmed = order.consumer_confirmed_delivery === true;
    if (kycApproved && !consumerConfirmed) return 'Holding — awaiting consumer confirmation';
    if (!kycApproved && consumerConfirmed) return 'Holding — awaiting KYC approval';
    return 'Holding — awaiting KYC + consumer confirmation';
  };

  const getPayoutStatusLabel = (order: MerchantOrder) => {
    if (order.payout_status === 'pending_release') return 'Queued for bank transfer';
    if (order.payout_status === 'released') return 'Transferred to bank account';
    if (order.payout_status === 'failed') return 'Transfer failed — contact support';
    return getHoldingStatusLabel(order);
  };

  const commissionRate = merchantAccount?.commission_rate ?? 0.03;

  const renderOrders = () => (
    <MerchantOrders
      orders={orders}
      ordersLoading={ordersLoading}
      ordersError={ordersError}
      fulfillingOrderId={fulfillingOrderId}
      commissionRate={commissionRate}
      onDismissOrdersError={() => setOrdersError(null)}
      onMarkAsFulfilled={handleMarkAsFulfilled}
      getPayoutStatusLabel={getPayoutStatusLabel}
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
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-6">
        <h3 className="font-bold mb-6">Business Profile</h3>
        <div className="space-y-4">
          <div>
            <label className="text-stone-400 text-sm block mb-2">Business Name</label>
            <input
              type="text"
              value={businessProfile.businessName}
              onChange={(e) => setBusinessProfile({ ...businessProfile, businessName: e.target.value })}
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-3 text-white"
            />
          </div>
          <div>
            <label className="text-stone-400 text-sm block mb-2">Contact Email</label>
            <input
              type="email"
              value={businessProfile.contactEmail}
              onChange={(e) => setBusinessProfile({ ...businessProfile, contactEmail: e.target.value })}
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-3 text-white"
            />
          </div>
          <div>
            <label className="text-stone-400 text-sm block mb-2">Phone</label>
            <input
              type="tel"
              value={businessProfile.phone}
              onChange={(e) => setBusinessProfile({ ...businessProfile, phone: e.target.value })}
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-3 text-white"
            />
          </div>
          <div>
            <label className="text-stone-400 text-sm block mb-2">Business Address</label>
            <textarea
              value={businessProfile.address}
              onChange={(e) => setBusinessProfile({ ...businessProfile, address: e.target.value })}
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-3 text-white h-20"
            />
          </div>
          <div>
            <label className="text-stone-400 text-sm block mb-2">Certifications</label>
            <input
              type="text"
              value={businessProfile.certifications}
              onChange={(e) => setBusinessProfile({ ...businessProfile, certifications: e.target.value })}
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-3 text-white"
            />
          </div>
          <div>
            <label className="text-stone-400 text-sm block mb-2">Year Established</label>
            <input
              type="text"
              value={businessProfile.yearEstablished}
              onChange={(e) => setBusinessProfile({ ...businessProfile, yearEstablished: e.target.value })}
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-3 text-white"
            />
          </div>
        </div>
        <button
          onClick={() => showToast('Changes saved', 'success')}
          className="mt-6 bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-xl font-medium transition"
        >
          Save Changes
        </button>
      </div>
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-6">
        <h3 className="font-bold mb-4">Account Settings</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-stone-400">Two-Factor Authentication</span>
            <button className="text-emerald-500 hover:text-emerald-400 text-sm">Enable</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <TabShell
      title={<FairflowLogo markHeight={36} variant="dark" />}
      tabs={tabs}
      activeTab={activeTab as string}
      onTabChange={(tab) => setActiveTab(tab as Tab)}
      onLogout={signOut}
      headerActions={(
        <button
          onClick={() => setActiveTab('notifications')}
          className="relative p-2 rounded-lg border border-stone-700 bg-stone-800 hover:bg-stone-700 transition-colors"
          aria-label="Open notifications"
        >
          <Bell className="w-4 h-4 text-stone-200" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] leading-[18px] font-semibold">
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
          fetchMerchantProducts();
        }}
      />

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </TabShell>
  );
}
