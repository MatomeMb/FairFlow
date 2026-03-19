import type { MerchantAccount } from '../../../types/merchant';

export interface BusinessProfile {
  businessName: string;
  contactEmail: string;
  phone: string;
  address: string;
  certifications: string;
  yearEstablished: string;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  branchCode: string;
}

export interface MerchantAccountSectionProps {
  businessProfile: BusinessProfile;
  merchantAccount: MerchantAccount | null;
  onBusinessProfileChange: (updates: Partial<BusinessProfile>) => void;
  onSaveChanges: () => void;
  onUpdateBankDetails: () => void | Promise<void>;
}

export function MerchantAccountSection({
  businessProfile,
  merchantAccount,
  onBusinessProfileChange,
  onSaveChanges,
  onUpdateBankDetails,
}: MerchantAccountSectionProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[var(--ff-border-light)] bg-[var(--ff-neutral)]/70 p-6">
        <h3 className="mb-6 font-bold">Business Profile</h3>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-[var(--ff-ink-muted)]">Business Name</label>
            <input type="text" value={businessProfile.businessName} onChange={(event) => onBusinessProfileChange({ businessName: event.target.value })} className="w-full rounded-lg border border-[var(--ff-border-light)] bg-[var(--ff-neutral-subtle)] px-4 py-3 text-[var(--ff-form-text)]" />
          </div>
          <div>
            <label className="mb-2 block text-sm text-[var(--ff-ink-muted)]">Contact Email</label>
            <input type="email" value={businessProfile.contactEmail} onChange={(event) => onBusinessProfileChange({ contactEmail: event.target.value })} className="w-full rounded-lg border border-[var(--ff-border-light)] bg-[var(--ff-neutral-subtle)] px-4 py-3 text-[var(--ff-form-text)]" />
          </div>
          <div>
            <label className="mb-2 block text-sm text-[var(--ff-ink-muted)]">Phone</label>
            <input type="tel" value={businessProfile.phone} onChange={(event) => onBusinessProfileChange({ phone: event.target.value })} className="w-full rounded-lg border border-[var(--ff-border-light)] bg-[var(--ff-neutral-subtle)] px-4 py-3 text-[var(--ff-form-text)]" />
          </div>
          <div>
            <label className="mb-2 block text-sm text-[var(--ff-ink-muted)]">Business Address</label>
            <textarea value={businessProfile.address} onChange={(event) => onBusinessProfileChange({ address: event.target.value })} className="h-20 w-full rounded-lg border border-[var(--ff-border-light)] bg-[var(--ff-neutral-subtle)] px-4 py-3 text-[var(--ff-form-text)]" />
          </div>
          <div>
            <label className="mb-2 block text-sm text-[var(--ff-ink-muted)]">Certifications</label>
            <input type="text" value={businessProfile.certifications} onChange={(event) => onBusinessProfileChange({ certifications: event.target.value })} className="w-full rounded-lg border border-[var(--ff-border-light)] bg-[var(--ff-neutral-subtle)] px-4 py-3 text-[var(--ff-form-text)]" />
          </div>
          <div>
            <label className="mb-2 block text-sm text-[var(--ff-ink-muted)]">Year Established</label>
            <input type="text" value={businessProfile.yearEstablished} onChange={(event) => onBusinessProfileChange({ yearEstablished: event.target.value })} className="w-full rounded-lg border border-[var(--ff-border-light)] bg-[var(--ff-neutral-subtle)] px-4 py-3 text-[var(--ff-form-text)]" />
          </div>
        </div>
        <button onClick={onSaveChanges} className="mt-6 rounded-xl bg-[#AAFF45] px-6 py-3 font-medium transition hover:bg-[#95E830] text-[#0D1B2A]">
          Save Changes
        </button>
      </div>

      <div className="rounded-xl border border-[var(--ff-border-light)] bg-[var(--ff-neutral)]/70 p-6">
        <h3 className="mb-6 font-bold">Bank Account Details</h3>
        <p className="mb-4 text-sm text-[var(--ff-ink-muted)]">For receiving weekly payouts to your merchant account</p>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-[var(--ff-ink-muted)]">Account Holder Name</label>
            <input type="text" value={businessProfile.accountHolderName} onChange={(event) => onBusinessProfileChange({ accountHolderName: event.target.value })} placeholder="Full name on bank account" className="w-full rounded-lg border border-[var(--ff-border-light)] bg-[var(--ff-neutral-subtle)] px-4 py-3 text-[var(--ff-form-text)]" />
          </div>
          <div>
            <label className="mb-2 block text-sm text-[var(--ff-ink-muted)]">Bank Name</label>
            <input type="text" value={businessProfile.bankName} onChange={(event) => onBusinessProfileChange({ bankName: event.target.value })} placeholder="e.g., Standard Bank" className="w-full rounded-lg border border-[var(--ff-border-light)] bg-[var(--ff-neutral-subtle)] px-4 py-3 text-[var(--ff-form-text)]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm text-[var(--ff-ink-muted)]">Account Number</label>
              <input type="text" value={businessProfile.accountNumber} onChange={(event) => onBusinessProfileChange({ accountNumber: event.target.value })} placeholder="Account number" className="w-full rounded-lg border border-[var(--ff-border-light)] bg-[var(--ff-neutral-subtle)] px-4 py-3 text-[var(--ff-form-text)]" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-[var(--ff-ink-muted)]">Branch Code</label>
              <input type="text" value={businessProfile.branchCode} onChange={(event) => onBusinessProfileChange({ branchCode: event.target.value })} placeholder="Branch code" className="w-full rounded-lg border border-[var(--ff-border-light)] bg-[var(--ff-neutral-subtle)] px-4 py-3 text-[var(--ff-form-text)]" />
            </div>
          </div>
          {merchantAccount?.bank_account?.bank_name && (
            <div className="mt-4 rounded-lg border border-[var(--ff-border-light)]/50 bg-[var(--ff-neutral-subtle)] p-4">
              <p className="mb-2 text-sm text-[var(--ff-ink-muted)]">Current Bank Details:</p>
              <p className="text-sm text-[var(--ff-ink)]">{merchantAccount.bank_account.account_holder_name}</p>
              <p className="text-sm text-[var(--ff-ink-muted)]">{merchantAccount.bank_account.bank_name}</p>
              <p className="text-sm text-[var(--ff-neutral-muted)]">Account: ...{merchantAccount.bank_account.account_number?.slice(-4)}</p>
            </div>
          )}
        </div>
        <button onClick={() => void onUpdateBankDetails()} className="mt-6 rounded-xl bg-[#AAFF45] px-6 py-3 font-medium transition hover:bg-[#95E830] text-[#0D1B2A]">
          Update Bank Details
        </button>
      </div>

      <div className="rounded-xl border border-[var(--ff-border-light)] bg-[var(--ff-neutral)]/70 p-6">
        <h3 className="mb-4 font-bold">Account Settings</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[var(--ff-ink-muted)]">Two-Factor Authentication</span>
            <button className="text-sm rounded-xl bg-[#AAFF45] px-6 py-2 font-medium transition hover:bg-[#95E830] text-[#0D1B2A]">Enable</button>
          </div>
        </div>
      </div>
    </div>
  );
}