import { useState, type ReactNode } from 'react';
import SumsubWebSdk from '@sumsub/websdk-react';
import { Leaf, Lock, ShieldCheck } from 'lucide-react';
import type { MerchantAccount } from '../../../types/merchant';

export interface KycStartResponse {
  ok: boolean;
  access_token: string;
  applicant_id: string;
  kyc_status: 'pending';
}

interface KYCStatusPanelProps {
  merchantAccount: MerchantAccount | null;
  submitting: boolean;
  onStartKyc: () => Promise<KycStartResponse>;
  onAfterKycClose: () => void | Promise<void>;
}

export function KYCStatusPanel({
  merchantAccount,
  submitting,
  onStartKyc,
  onAfterKycClose,
}: KYCStatusPanelProps) {
  const [panelError, setPanelError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [kycToken, setKycToken] = useState<string | null>(null);
  const status = merchantAccount?.kyc_status ?? 'not_started';
  const disabled = submitting || busy;

  const handleStart = async () => {
    setPanelError(null);
    setBusy(true);
    try {
      const res = await onStartKyc();
      setKycToken(res.access_token);
    } catch (e) {
      setPanelError(e instanceof Error ? e.message : 'Could not start verification');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-[var(--ff-cta)] shrink-0" aria-hidden />
        <h3 className="font-bold text-[var(--ff-ink)]">Identity verification (Sumsub)</h3>
      </div>

      {panelError && (
        <p className="text-sm text-[var(--ff-error)]" role="alert">
          {panelError}
        </p>
      )}

      {status === 'not_started' && (
        <div className="rounded-xl border border-[var(--ff-border)] bg-[var(--ff-surface)] p-5 space-y-3">
          <p className="text-sm text-[var(--ff-ink-muted)] leading-relaxed">
            We use Sumsub to verify your identity for payouts and compliance. You will need your South African ID book, ID card, or
            passport. This usually takes about two minutes.
          </p>
          <button
            type="button"
            disabled={disabled}
            onClick={() => void handleStart()}
            className="inline-flex items-center justify-center rounded-full bg-[var(--ff-cta)] px-5 py-2.5 text-sm font-semibold text-[var(--ff-on-accent)] transition hover:brightness-95 disabled:opacity-50 min-h-[44px]"
          >
            {disabled ? 'Starting…' : 'Start verification'}
          </button>
        </div>
      )}

      {status === 'pending' && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-5 space-y-2">
          <span className="inline-flex items-center rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-amber-200">
            Verification in progress
          </span>
          <p className="text-sm text-[var(--ff-ink-muted)]">
            We have received your submission and are reviewing it. This usually takes a few minutes. This page refreshes automatically.
          </p>
        </div>
      )}

      {status === 'approved' && (
        <div className="rounded-xl border border-[var(--ff-success-bold)]/35 bg-[var(--ff-success-subtle)] p-5 space-y-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--ff-success-bold)]/20 px-2.5 py-0.5 text-xs font-semibold text-[var(--ff-success-bold)]">
            Verified ✓
          </span>
          {merchantAccount?.kyc_verified_at && (
            <p className="text-sm text-[var(--ff-ink)]">
              Verified on{' '}
              <time dateTime={merchantAccount.kyc_verified_at}>
                {new Date(merchantAccount.kyc_verified_at).toLocaleDateString('en-ZA', { dateStyle: 'long' })}
              </time>
            </p>
          )}
          {merchantAccount?.next_payout_date && (
            <p className="text-sm text-[var(--ff-ink-muted)]">
              Next payout date:{' '}
              {new Date(merchantAccount.next_payout_date).toLocaleDateString('en-ZA', { dateStyle: 'long' })}
            </p>
          )}
        </div>
      )}

      {status === 'rejected' && (
        <div className="rounded-xl border border-[var(--ff-error)]/50 bg-[var(--ff-error-subtle)] p-5 space-y-3">
          <span className="inline-flex items-center rounded-full bg-[var(--ff-error)]/25 px-2.5 py-0.5 text-xs font-semibold text-[var(--ff-error-bold)]">
            Verification failed
          </span>
          {merchantAccount?.kyc_rejection_reason && (
            <p className="text-sm text-[var(--ff-ink)]">{merchantAccount.kyc_rejection_reason}</p>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={disabled}
              onClick={() => void handleStart()}
              className="rounded-full bg-[var(--ff-cta)] px-4 py-2 text-sm font-semibold text-[var(--ff-on-accent)] hover:brightness-95 disabled:opacity-50 min-h-[44px]"
            >
              Try again
            </button>
            <a
              href="mailto:hello@fairflow.co.za?subject=KYC%20verification%20help"
              className="inline-flex items-center rounded-full border border-[var(--ff-border)] px-4 py-2 text-sm text-[var(--ff-ink)] hover:bg-[var(--ff-surface)] min-h-[44px]"
            >
              Contact support
            </a>
          </div>
        </div>
      )}

      {status === 'expired' && (
        <div className="rounded-xl border border-orange-500/40 bg-orange-950/20 p-5 space-y-3">
          <span className="inline-flex items-center rounded-full bg-orange-500/20 px-2.5 py-0.5 text-xs font-semibold text-orange-200">
            Verification expired
          </span>
          <p className="text-sm text-[var(--ff-ink-muted)]">Please complete identity verification again to unlock payouts.</p>
          <button
            type="button"
            disabled={disabled}
            onClick={() => void handleStart()}
            className="rounded-full bg-[var(--ff-cta)] px-4 py-2 text-sm font-semibold text-[var(--ff-on-accent)] hover:brightness-95 disabled:opacity-50 min-h-[44px]"
          >
            Re-verify
          </button>
        </div>
      )}

      {kycToken && (
        <div className="rounded-xl border border-[var(--ff-border)] bg-[var(--ff-surface)] overflow-hidden min-h-[480px]">
          <SumsubWebSdk
            accessToken={kycToken}
            expirationHandler={async () => {
              const res = await onStartKyc();
              return res.access_token;
            }}
            config={{ lang: 'en', country: 'ZAF' }}
            options={{ addViewportTag: false }}
            onMessage={(type: string) => {
              if (type === 'idCheck.onApplicantSubmitted') {
                setKycToken(null);
                void onAfterKycClose();
              }
            }}
            onError={(error: unknown) => {
              console.error('[Sumsub widget]', error);
            }}
          />
        </div>
      )}

      <p className="flex items-start gap-2 text-xs text-[var(--ff-ink-muted)]">
        <Leaf className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[var(--ff-cta)]" aria-hidden />
        <span>Currency: ZAR. Document types supported: SA ID book, SA ID card, passport (via Sumsub).</span>
      </p>
    </div>
  );
}

export function PayoutSectionLock({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      <div className="pointer-events-none select-none opacity-[0.22] blur-[0.3px]" aria-hidden>
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl bg-[#0D1B2A]/88 px-4 text-center">
        <Lock className="w-8 h-8 text-amber-400/90" aria-hidden />
        <p className="text-sm font-medium text-white max-w-xs">Payouts unlock after identity verification is approved.</p>
        <p className="text-xs text-[var(--ff-ink-muted)] max-w-sm">Complete Sumsub verification above. This section will enable automatically.</p>
      </div>
    </div>
  );
}
