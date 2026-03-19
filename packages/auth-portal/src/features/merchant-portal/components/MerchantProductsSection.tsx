import { memo, useMemo, type ComponentType } from 'react';
import { Package } from 'lucide-react';
import { MetricCard } from '../../../components/shared/MetricCard';
import { EmptyState } from '../../../components/shared/EmptyState';
import type { MerchantOrder, MerchantAccount } from '../../../types/merchant';
import type { MerchantPortalProduct } from '../hooks/useMerchantProducts';
interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
}
interface InlineSpinnerProps {
  label: string;
}
interface MerchantProductsStats {
  active: number;
  pending: number;
}
export interface MerchantProductsSectionProps {
  ErrorBanner: ComponentType<ErrorBannerProps>;
  InlineSpinner: ComponentType<InlineSpinnerProps>;
  products: MerchantPortalProduct[];
  orders: MerchantOrder[];
  merchantAccount: MerchantAccount | null;
  analyticsError: string | null;
  ordersError: string | null;
  accountError: string | null;
  productsError: string | null;
  onDismissAnalyticsError: () => void;
  onDismissOrdersError: () => void;
  onDismissAccountError: () => void;
  onDismissProductsError: () => void;
  isLoadingOrders: boolean;
  accountLoading: boolean;
  isLoadingProducts: boolean;
  showOnboardingBanner: boolean;
  onDismissOnboardingBanner: () => void;
  onOpenCreateModal: () => void;
  onGoToKycPayouts: () => void;
  stats: MerchantProductsStats;
  restockingProductId: string | null;
  onRestockProduct: (productId: string) => void;
  copiedMatterId: string | null;
  copiedPageId: string | null;
  onCopyMatter: (productId: string, value?: string) => void;
  onCopyPage: (productId: string, hash?: string) => void;
  onRemoveProduct: (productId: string) => void;
}
export const MerchantProductsSection = memo(function MerchantProductsSection({
  ErrorBanner,
  InlineSpinner,
  products,
  orders,
  merchantAccount,
  analyticsError,
  ordersError,
  accountError,
  productsError,
  onDismissAnalyticsError,
  onDismissOrdersError,
  onDismissAccountError,
  onDismissProductsError,
  isLoadingOrders,
  accountLoading,
  isLoadingProducts,
  showOnboardingBanner,
  onDismissOnboardingBanner,
  onOpenCreateModal,
  onGoToKycPayouts,
  stats,
  restockingProductId,
  onRestockProduct,
  copiedMatterId,
  copiedPageId,
  onCopyMatter,
  onCopyPage,
  onRemoveProduct,
}: MerchantProductsSectionProps) {
  const lowStockProducts = useMemo(() => products.filter((product) => product.stock < 5), [products]);
  const recentOrders = useMemo(() => orders.slice(0, 3), [orders]);
  const onboardingKycStatus = merchantAccount?.kyc_status;
  const shouldShowOnboardingBanner = showOnboardingBanner && products.length === 0;
  const onboardingSteps = useMemo(
    () => [
      { done: products.length > 0, label: 'Create your first product', action: onOpenCreateModal, cta: 'Create product' },
      { done: onboardingKycStatus === 'pending' || onboardingKycStatus === 'approved', label: 'Submit KYC verification', action: onGoToKycPayouts, cta: 'Start KYC' },
      { done: merchantAccount?.bank_account != null, label: 'Add your bank account for payouts', action: onGoToKycPayouts, cta: 'Add bank account' },
    ],
    [merchantAccount?.bank_account, onGoToKycPayouts, onOpenCreateModal, onboardingKycStatus, products.length]
  );
  return (
    <div className="space-y-6">
      {analyticsError && <ErrorBanner message={analyticsError} onDismiss={onDismissAnalyticsError} />}
      {ordersError && <ErrorBanner message={ordersError} onDismiss={onDismissOrdersError} />}
      {accountError && <ErrorBanner message={accountError} onDismiss={onDismissAccountError} />}
      {productsError && <ErrorBanner message={productsError} onDismiss={onDismissProductsError} />}
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
              <p className="mt-1 text-sm text-[var(--ff-ink-muted)]">Complete these three steps to start selling.</p>
            </div>
            <button onClick={onDismissOnboardingBanner} className="text-[var(--ff-ink-muted)] hover:text-[var(--ff-ink)]">
              ✕
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {onboardingSteps.map((step, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    step.done ? 'bg-[var(--ff-success)] text-[var(--ff-neutral)]' : 'bg-[var(--ff-neutral-subtle)] text-[var(--ff-ink-muted)]'
                  }`}>
                    {step.done ? '✓' : index + 1}
                  </span>
                  <span className={`text-sm ${step.done ? 'text-[var(--ff-ink-muted)] line-through' : 'text-[var(--ff-ink)]'}`}>
                    {step.label}
                  </span>
                </div>
                {!step.done && (
                  <button onClick={step.action} className="text-xs text-[var(--ff-warning)] hover:text-[var(--ff-warning-bold)] underline">
                    {step.cta} →
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard label="Active Products" value={stats.active} color="green" />
        <MetricCard label="Pending Review" value={stats.pending} color="amber" />
        <MetricCard label="Pending Payout" value={`R ${((merchantAccount?.pending_payout ?? 0) / 100).toFixed(2)}`} color="blue" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[var(--ff-border-light)] bg-[var(--ff-neutral)]/70 p-4">
          <h3 className="mb-3 font-semibold">Recent Orders</h3>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-[var(--ff-neutral-muted)]">No recent orders yet.</p>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between text-sm">
                  <span className="mr-2 truncate text-[var(--ff-neutral-bold)]">{order.customer_email}</span>
                  <span className={`rounded px-2 py-1 text-xs ${order.fulfillment_status === 'fulfilled' ? 'bg-[var(--ff-success-subtle)] text-[var(--ff-success)]' : 'bg-[var(--ff-warning-subtle)] text-[var(--ff-warning)]'}`}>
                    {order.fulfillment_status === 'fulfilled' ? 'Fulfilled' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-[var(--ff-border-light)] bg-[var(--ff-neutral)]/70 p-4">
          <h3 className="mb-3 font-semibold">Low Stock Alerts</h3>
          {lowStockProducts.length === 0 ? (
            <p className="text-sm text-[var(--ff-neutral-muted)]">No low stock alerts.</p>
          ) : (
            <div className="space-y-2">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between gap-3 rounded-lg border border-[var(--ff-warning-border)] bg-[var(--ff-warning-subtle)] p-3">
                  <p className="text-sm text-[var(--ff-warning)]">{product.name} has {product.stock} unit(s) remaining</p>
                  <button
                    onClick={() => onRestockProduct(product.id)}
                    disabled={restockingProductId === product.id}
                    className="min-h-[44px] rounded-lg bg-[var(--ff-warning)] px-4 py-3 text-xs font-medium text-[var(--ff-ink)] transition hover:bg-[var(--ff-warning-bold)] disabled:bg-[var(--ff-neutral-subtle)]"
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
        <div className="overflow-x-auto rounded-xl border border-[var(--ff-border-light)] bg-[var(--ff-neutral)]/70">
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
                    <div className="h-4 w-full animate-pulse rounded bg-[var(--ff-neutral-subtle)]" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : products.length === 0 ? (
        <EmptyState icon={<Package className="h-10 w-10 text-[var(--ff-neutral-muted)]" />} title="No products yet" description="No products yet. Create your first product to begin selling." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--ff-border-light)] bg-[var(--ff-neutral)]/70">
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
              {products.map((product) => (
                <tr key={product.id} className="border-t border-[var(--ff-border-light)] hover:bg-[var(--ff-neutral-subtle)]">
                  <td className="px-6 py-4">{product.name}</td>
                  <td className="px-6 py-4 text-[var(--ff-ink-muted)]">{product.category}</td>
                  <td className="px-6 py-4 text-right font-mono">R {product.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">{product.stock}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`rounded px-2 py-1 text-xs ${
                      product.status === 'Active'
                        ? 'bg-[var(--ff-success-subtle)] text-[var(--ff-success)]'
                        : product.status === 'Pending'
                          ? 'bg-[var(--ff-warning-subtle)] text-[var(--ff-warning)]'
                          : 'bg-[var(--ff-error-subtle)] text-[var(--ff-error)]'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {product.thingUrl && product.hash && product.matterUri ? (
                      <div className="flex flex-col gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <a href={product.thingUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--ff-info)] hover:text-[var(--ff-info-bold)]">
                            .thing URL
                          </a>
                        </div>
                        <div className="break-all font-mono text-[var(--ff-success)]" title="Matter URI">
                          {product.matterUri}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-[var(--ff-neutral-muted)]">Not compiled</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      {product.hash ? (
                        <>
                          <button
                            onClick={() => onCopyMatter(product.id, product.matterUri)}
                            className="min-h-[44px] rounded-lg border border-[var(--ff-border)] bg-[var(--ff-surface)] px-3 py-2 text-xs text-[var(--ff-ink)] hover:brightness-95"
                          >
                            {copiedMatterId === product.id ? 'Copied!' : 'Copy matter://'}
                          </button>
                          <a
                            href={`/product/${product.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="min-h-[44px] rounded-lg bg-[var(--ff-cta)] px-3 py-2 text-xs text-[var(--ff-neutral)] hover:bg-[var(--ff-cta-hover)]"
                          >
                            View Page ↗
                          </a>
                          <button
                            onClick={() => onCopyPage(product.id, product.hash)}
                            className="min-h-[44px] rounded-lg border border-[var(--ff-border)] bg-[var(--ff-surface)] px-3 py-2 text-xs text-[var(--ff-ink)] hover:brightness-95"
                          >
                            {copiedPageId === product.id ? 'Copied!' : 'Copy page'}
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-[var(--ff-neutral-muted)]">Pending</span>
                      )}
                      <button onClick={() => onRemoveProduct(product.id)} className="min-h-[44px] px-2 text-xs text-[var(--ff-error)] hover:text-[var(--ff-error-bold)]">
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
      <button onClick={onOpenCreateModal} className="rounded-full bg-[#AAFF45] px-6 py-3 text-sm font-bold text-[#0D1B2A] hover:bg-[#95E830] transition-colors">
        + Create Product
      </button>
    </div>
  );
});