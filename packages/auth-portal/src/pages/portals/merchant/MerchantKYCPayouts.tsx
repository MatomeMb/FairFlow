import { Lock } from 'lucide-react';
import { KYCStatusPanel, type KycStartResponse } from '../../../features/merchant-portal/components/KYCStatusPanel';
import { formatZarFromCents } from '../../../lib/currency';
import type { MerchantAccount } from '../../../types/merchant';

interface PayoutLog {
  id: string;
  merchant_id: string;
  orders_included: string[];
  gross_amount: number;
  commission_amount: number;
  net_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
}

interface MerchantKYCPayoutsProps {
  merchantAccount: MerchantAccount | null;
  payoutLogs: PayoutLog[];
  payoutsLoading: boolean;
  accountLoading: boolean;
  accountError: string | null;
  commissionRate: number;
  onDismissAccountError: () => void;
  onStartKyc: () => Promise<KycStartResponse>;
  onAfterKycClose: () => void | Promise<void>;
  formatCents: (value: number | null | undefined) => string;
}

export function MerchantKYCPayouts({
  merchantAccount,
  payoutLogs,
  payoutsLoading,
  accountLoading,
  accountError,
  commissionRate,
  onDismissAccountError,
  onStartKyc,
  onAfterKycClose,
  formatCents,
}: MerchantKYCPayoutsProps) {
  const payoutsUnlocked = merchantAccount?.kyc_status === 'approved';
  const pendingPayout = merchantAccount?.pending_payout ?? 0;
  const totalEarnings = merchantAccount?.total_earnings ?? 0;
  const showNoPendingBalance = payoutsUnlocked && pendingPayout === 0;

  return (
    <div className="space-y-6">
      {accountError && (
        <div className="bg-[var(--ff-error-bold)] border border-[var(--ff-error)] rounded-xl px-4 py-3 text-sm text-white flex items-start justify-between gap-3">
          <p>{accountError}</p>
          <button
            type="button"
            onClick={onDismissAccountError}
            className="leading-none min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--ff-ink)] hover:opacity-80"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      {(accountLoading || payoutsLoading) && (
        <div className="rounded-xl border border-[var(--ff-border)] bg-[#1A2D42] p-4 text-sm text-white flex items-center gap-3">
          <svg className="w-5 h-5 text-emerald-700 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="4" />
            <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
          <span>Loading KYC and payout data...</span>
        </div>
      )}

      <div className="rounded-xl border border-[var(--ff-border)] bg-[#1A2D42] p-6 space-y-4">
        <KYCStatusPanel
          merchantAccount={merchantAccount}
          submitting={false}
          onStartKyc={onStartKyc}
          onAfterKycClose={onAfterKycClose}
        />
      </div>

      <div className="rounded-xl border border-[var(--ff-border)] bg-[#1A2D42] p-6 space-y-4">
        <h3 className="font-bold text-white">KYC & Payouts</h3>
        <p className="text-sm text-[var(--ff-ink-muted)]">Platform commission: {(commissionRate * 100).toFixed(1)}% per order</p>

        {!payoutsUnlocked ? (
          <div className="rounded-xl border border-[var(--ff-border)] bg-[var(--ff-surface)] px-6 py-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(255,255,255,0.06)]">
              <Lock className="h-6 w-6 text-[var(--ff-ink-muted)]" aria-hidden="true" />
            </div>
            <p className="mt-4 text-sm font-medium text-[var(--ff-ink)]">
              Payout details will appear here once your identity is verified.
            </p>
          </div>
        ) : (
          <>
            {!merchantAccount?.bank_account?.account_number && (
              <div className="rounded-lg border border-amber-500/35 bg-amber-950/25 px-4 py-3 text-sm text-amber-100">
                Add your bank details under <strong className="text-white">My Account</strong> so we can pay you in ZAR.
              </div>
            )}

            {merchantAccount?.bank_account && (
              <div className="rounded-lg border border-[var(--ff-border)] bg-[var(--ff-surface)] p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Bank Account on File</h4>
                </div>
                <div className="mt-3 space-y-1 text-sm text-[var(--ff-ink)]">
                  <p>
                    <span className="text-[var(--ff-ink-muted)]">Bank:</span> {merchantAccount.bank_account.bank_name}
                  </p>
                  <p>
                    <span className="text-[var(--ff-ink-muted)]">Account holder:</span> {merchantAccount.bank_account.account_holder_name}
                  </p>
                  <p>
                    <span className="text-[var(--ff-ink-muted)]">Account number:</span> {merchantAccount.bank_account.account_number}
                  </p>
                  <p>
                    <span className="text-[var(--ff-ink-muted)]">Branch code:</span> {merchantAccount.bank_account.branch_code}
                  </p>
                  <p>
                    <span className="text-[var(--ff-ink-muted)]">Account type:</span> {merchantAccount.bank_account.account_type}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-4">
              <div className="rounded-lg border border-[var(--ff-border)] bg-[var(--ff-surface)] p-3">
                <p className="text-[var(--ff-ink-muted)]">Pending payout</p>
                <p className="font-semibold text-[var(--ff-ink)]">{formatZarFromCents(pendingPayout)}</p>
              </div>
              <div className="rounded-lg border border-[var(--ff-border)] bg-[var(--ff-surface)] p-3">
                <p className="text-[var(--ff-ink-muted)]">Total earnings</p>
                <p className="font-semibold text-[var(--ff-ink)]">{formatZarFromCents(totalEarnings)}</p>
              </div>
              <div className="rounded-lg border border-[var(--ff-border)] bg-[var(--ff-surface)] p-3">
                <p className="text-[var(--ff-ink-muted)]">Commission rate</p>
                <p className="font-semibold text-[var(--ff-ink)]">{(commissionRate * 100).toFixed(1)}%</p>
              </div>
              <div className="rounded-lg border border-[var(--ff-border)] bg-[var(--ff-surface)] p-3">
                <p className="text-[var(--ff-ink-muted)]">Payout frequency</p>
                <p className="font-semibold text-[var(--ff-ink)] capitalize">{merchantAccount?.payout_frequency || 'weekly'}</p>
              </div>
            </div>

            {payoutsLoading ? (
              <div className="rounded-xl border border-[var(--ff-border)] bg-[#1A2D42] p-4 text-sm text-white flex items-center gap-3">
                <svg className="w-5 h-5 text-emerald-700 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="4" />
                  <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
                <span>Loading payouts...</span>
              </div>
            ) : (
              <>
                {showNoPendingBalance && (
                  <p className="text-sm text-[var(--ff-ink-muted)]">
                    No pending balance. Payouts will appear here after your first sale.
                  </p>
                )}

                {!showNoPendingBalance && payoutLogs.length === 0 && (
                  <p className="text-sm text-[var(--ff-ink-muted)]">
                    No payouts yet. Payouts queue after KYC approval and consumer confirmation.
                  </p>
                )}

                {payoutLogs.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-[var(--ff-ink-muted)] border-b border-[var(--ff-border)]">
                        <tr>
                          <th className="py-2 text-left">Date</th>
                          <th className="py-2 text-right">Gross</th>
                          <th className="py-2 text-right">Commission</th>
                          <th className="py-2 text-right">Net</th>
                          <th className="py-2 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payoutLogs.map((payout) => (
                          <tr key={payout.id} className="border-b border-[var(--ff-border)]">
                            <td className="py-2 text-[var(--ff-ink)]">{new Date(payout.created_at).toLocaleDateString('en-ZA')}</td>
                            <td className="py-2 text-right text-[var(--ff-ink)]">{formatCents(payout.gross_amount)}</td>
                            <td className="py-2 text-right text-[var(--ff-ink)]">{formatCents(payout.commission_amount)}</td>
                            <td className="py-2 text-right text-[var(--ff-success-bold)]">{formatCents(payout.net_amount)}</td>
                            <td className="py-2 text-right">
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  payout.status === 'completed'
                                    ? 'bg-[var(--ff-success-subtle)] text-[var(--ff-success-bold)]'
                                    : payout.status === 'processing'
                                      ? 'bg-[var(--ff-info-subtle)] text-[var(--ff-info-bold)]'
                                      : payout.status === 'failed'
                                        ? 'bg-[var(--ff-error-subtle)] text-[var(--ff-error-bold)]'
                                        : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {payout.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--ff-ink-muted)]">
              fairflow charges a <strong className="text-[var(--ff-ink)]">{(commissionRate * 100).toFixed(1)}% platform fee</strong> on each
              sale. Payout amounts in the table above are <strong className="text-[var(--ff-ink)]">net of this fee</strong> (gross minus
              commission).
            </p>
          </>
        )}
      </div>
    </div>
  );
}
