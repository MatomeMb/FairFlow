import { Check, RefreshCw, X } from 'lucide-react';
import { EmptyState } from '../../../components/shared/EmptyState';
import type { KYCSubmission } from '../hooks/useAdminKYCQueue';

export interface AdminKYCSectionProps {
  loadingKYC: boolean;
  pendingKYC: KYCSubmission[];
  onRefresh: () => void;
  onOpenKYCAction: (submission: KYCSubmission, action: 'approve' | 'reject') => void;
}

export function AdminKYCSection({ loadingKYC, pendingKYC, onRefresh, onOpenKYCAction }: AdminKYCSectionProps) {
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
        <EmptyState icon={<Check className="w-10 h-10 text-green-400" />} title="No Pending KYC Submissions" description="All merchants have been verified!" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--ff-ink)]">KYC Approvals</h2>
          <p className="text-sm text-stone-700 mt-1">
            {pendingKYC.length} pending submission{pendingKYC.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={onRefresh} className="flex items-center gap-2 px-4 py-2 bg-[var(--ff-cta)] hover:bg-[var(--ff-cta-hover)] text-[var(--ff-neutral)] rounded-lg transition">
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
                    <p className="text-sm text-stone-700">{kyc.email}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-stone-700">ID Number</p>
                    <p className="text-[var(--ff-ink)] font-mono">{kyc.kycData?.id_number || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-stone-700">DOB</p>
                    <p className="text-[var(--ff-ink)]">{kyc.kycData?.date_of_birth || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-stone-700">Bank</p>
                    <p className="text-[var(--ff-ink)]">{kyc.bankAccount?.bank_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-stone-700">Account</p>
                    <p className="text-[var(--ff-ink)] font-mono">****{kyc.bankAccount?.account_number?.slice(-4) || 'N/A'}</p>
                  </div>
                </div>
                <p className="text-xs text-stone-700 mt-3">
                  Submitted: {new Date(kyc.submittedAt).toLocaleDateString()} at {new Date(kyc.submittedAt).toLocaleTimeString()}
                </p>
              </div>
              <div className="flex gap-2 ml-4">
                <button onClick={() => onOpenKYCAction(kyc, 'approve')} className="flex items-center gap-2 px-4 py-2 bg-[var(--ff-success)] hover:bg-[var(--ff-success-bold)] text-[var(--ff-neutral)] rounded-lg transition">
                  <Check className="w-4 h-4" />
                  Approve
                </button>
                <button onClick={() => onOpenKYCAction(kyc, 'reject')} className="flex items-center gap-2 px-4 py-2 bg-[var(--ff-error)] hover:bg-[var(--ff-error-bold)] text-[var(--ff-neutral)] rounded-lg transition">
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
}
