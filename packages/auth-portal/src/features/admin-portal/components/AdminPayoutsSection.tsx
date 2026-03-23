import { useCallback, useEffect, useState } from 'react';
import { DollarSign, RefreshCw, Send } from 'lucide-react';
import { EmptyState } from '../../../components/shared/EmptyState';
import { Toast } from '../../../components/shared/Toast';
import { apiBase, apiKey } from '../../../lib/config';
import { supabase } from '../../../lib/supabase';

interface Payout {
  id: string;
  payout_log_id: string;
  merchant_id: string;
  merchant_name: string;
  net_amount: number;
  gross_amount: number;
  commission_amount: number;
  currency: string;
  status: string;
  created_at: string;
  orders_count: number;
}

interface ConfirmDialogState {
  isOpen: boolean;
  payout: Payout | null;
}

type PayoutPagination = { page: number; limit: number; total: number; pages: number };

export function AdminPayoutsSection() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [pagination, setPagination] = useState<PayoutPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({ isOpen: false, payout: null });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadPayouts = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const supabaseToken = session?.access_token ?? '';
      if (!supabaseToken) {
        setToast({ message: 'Sign in required to load payouts', type: 'error' });
        return;
      }

      const res = await fetch(`${apiBase}/v1/admin-proxy/payouts?page=1&limit=20`, {
        headers: {
          Authorization: `Bearer ${supabaseToken}`,
          'x-api-key': apiKey,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to load payouts: ${res.status}`);
      }

      const data = (await res.json()) as { payouts?: Payout[]; pagination?: PayoutPagination };
      setPayouts(data.payouts || []);
      setPagination(data.pagination ?? null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load payouts';
      setToast({ message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMorePayouts = useCallback(async () => {
    if (!pagination || pagination.page >= pagination.pages) return;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const supabaseToken = session?.access_token ?? '';
    if (!supabaseToken) return;
    const nextPage = pagination.page + 1;
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/v1/admin-proxy/payouts?page=${nextPage}&limit=20`, {
        headers: {
          Authorization: `Bearer ${supabaseToken}`,
          'x-api-key': apiKey,
        },
      });
      if (!res.ok) return;
      const data = (await res.json()) as { payouts?: Payout[]; pagination?: PayoutPagination };
      setPayouts((prev) => [...prev, ...(data.payouts || [])]);
      setPagination(data.pagination ?? null);
    } finally {
      setLoading(false);
    }
  }, [apiKey, pagination]);

  useEffect(() => {
    loadPayouts();
  }, [loadPayouts]);

  const handleReleaseClick = (payout: Payout) => {
    setConfirmDialog({ isOpen: true, payout });
  };

  const handleConfirmRelease = useCallback(async () => {
    if (!confirmDialog.payout) return;

    const payout = confirmDialog.payout;
    setSubmitting(true);
    setConfirmDialog({ isOpen: false, payout: null });

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const supabaseToken = session?.access_token ?? '';
      if (!supabaseToken) {
        setToast({ message: 'Sign in required to release payouts', type: 'error' });
        return;
      }

      const res = await fetch(`${apiBase}/v1/admin-proxy/payouts/release`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${supabaseToken}`,
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payout_log_id: payout.payout_log_id,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Release failed: ${res.status}`);
      }

      setToast({ message: `Payout of R${(payout.net_amount / 100).toFixed(2)} released to ${payout.merchant_name}`, type: 'success' });
      await loadPayouts();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to release payout';
      setToast({ message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  }, [confirmDialog.payout, loadPayouts]);

  const handleCancel = () => {
    setConfirmDialog({ isOpen: false, payout: null });
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin">
          <RefreshCw className="w-5 h-5" />
        </div>
      </div>
    );
  }

  if (payouts.length === 0) {
    return (
      <div className="p-6">
        <EmptyState icon={<DollarSign className="w-10 h-10 text-[#1a9e4a]" />} title="No Pending Payouts" description="All payouts have been released or there are no payouts pending." />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--ff-ink)]">Pending Payouts</h2>
          <p className="text-sm text-white mt-1">
            Showing {payouts.length}
            {pagination ? ` of ${pagination.total}` : ''} pending payout
            {pagination && pagination.total !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={() => loadPayouts()} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-[var(--ff-cta)] hover:bg-[var(--ff-cta-hover)] disabled:opacity-50 text-[var(--ff-neutral)] rounded-lg transition">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[rgba(255,255,255,0.07)]">
              <th className="text-left py-3 px-4 text-white font-semibold">Merchant</th>
              <th className="text-right py-3 px-4 text-white font-semibold">Net Amount (ZAR)</th>
              <th className="text-center py-3 px-4 text-white font-semibold">Orders</th>
              <th className="text-left py-3 px-4 text-white font-semibold">Date</th>
              <th className="text-right py-3 px-4 text-white font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map((payout) => (
              <tr key={payout.id} className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)] transition">
                <td className="py-4 px-4 text-[var(--ff-ink)]">{payout.merchant_name}</td>
                <td className="py-4 px-4 text-right font-mono text-[var(--ff-ink)]">R{(payout.net_amount / 100).toFixed(2)}</td>
                <td className="py-4 px-4 text-center text-[var(--ff-ink-muted)]">{payout.orders_count}</td>
                <td className="py-4 px-4 text-[var(--ff-ink-muted)] text-xs">
                  {new Date(payout.created_at).toLocaleDateString()}
                </td>
                <td className="py-4 px-4 text-right">
                  <button
                    onClick={() => handleReleaseClick(payout)}
                    disabled={submitting}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1a9e4a] hover:brightness-95 disabled:opacity-50 text-[#0D1B2A] rounded-lg transition font-medium text-xs"
                  >
                    <Send className="w-3 h-3" />
                    Release
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.page < pagination.pages && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => void loadMorePayouts()}
            disabled={loading}
            className="px-4 py-2 rounded-lg border border-[rgba(255,255,255,0.12)] text-[var(--ff-ink)] text-sm hover:bg-[rgba(255,255,255,0.04)] disabled:opacity-50"
          >
            {loading ? 'Loading…' : 'Load more payouts'}
          </button>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog.isOpen && confirmDialog.payout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1A2D42] border border-[rgba(255,255,255,0.07)] rounded-xl p-6 max-w-sm">
            <h3 className="text-lg font-bold text-[var(--ff-ink)] mb-4">Confirm Payout Release</h3>
            <p className="text-[var(--ff-ink-muted)] mb-6">
              Release <span className="font-semibold text-[var(--ff-ink)]">R{(confirmDialog.payout.net_amount / 100).toFixed(2)}</span> to{' '}
              <span className="font-semibold text-[var(--ff-ink)]">{confirmDialog.payout.merchant_name}</span>?
            </p>
            <p className="text-xs text-[var(--ff-ink-muted)] mb-6">
              This will transfer the funds to their configured bank account.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancel}
                disabled={submitting}
                className="px-4 py-2 border border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.12)] text-[var(--ff-ink)] rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRelease}
                disabled={submitting}
                className="flex items-center gap-2 px-4 py-2 bg-[#1a9e4a] hover:brightness-95 disabled:opacity-50 text-[#0D1B2A] rounded-lg transition font-medium"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Releasing...' : 'Release'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
}
