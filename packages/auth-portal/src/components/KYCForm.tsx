import React, { useMemo, useState } from 'react';

export type KycStatus = 'not_started' | 'pending' | 'approved' | 'rejected';

export interface SABankAccountForm {
  account_holder_name: string;
  bank_name: string;
  account_number: string;
  branch_code: string;
  account_type: 'cheque' | 'savings' | 'transmission';
}

export interface KycSubmitPayload {
  business_name: string;
  id_number: string;
  date_of_birth: string;
  residential_address: string;
  phone: string;
  bank_account: SABankAccountForm;
}

interface KYCFormProps {
  kycStatus: KycStatus;
  initialBusinessName?: string;
  maskedAccountNumber?: string;
  bankAccountOnFile?: Partial<SABankAccountForm>;
  submitting: boolean;
  onSubmit: (payload: KycSubmitPayload) => Promise<void>;
}

const BANK_OPTIONS = [
  'ABSA',
  'FNB',
  'Standard Bank',
  'Nedbank',
  'Capitec',
  'African Bank',
  'Discovery Bank',
  'TymeBank',
  'Other',
] as const;

const statusBadge = (status: KycStatus) => {
  if (status === 'approved') {
    return <span className="inline-flex text-xs px-2 py-1 rounded bg-[var(--ff-success-subtle)] text-[var(--ff-success-bold)]">Approved</span>;
  }
  if (status === 'pending') {
    return <span className="inline-flex text-xs px-2 py-1 rounded bg-amber-100 text-amber-800">Pending Review</span>;
  }
  if (status === 'rejected') {
    return <span className="inline-flex text-xs px-2 py-1 rounded bg-[var(--ff-error-subtle)] text-[var(--ff-error-bold)]">Rejected</span>;
  }
  return <span className="inline-flex text-xs px-2 py-1 rounded bg-[var(--ff-surface)] text-[var(--ff-ink)]">Not Started</span>;
};

export const KYCForm: React.FC<KYCFormProps> = ({
  kycStatus,
  initialBusinessName,
  maskedAccountNumber,
  bankAccountOnFile,
  submitting,
  onSubmit,
}) => {
  const disabled = kycStatus === 'pending' || kycStatus === 'approved';
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<KycSubmitPayload>({
    business_name: initialBusinessName || '',
    id_number: '',
    date_of_birth: '',
    residential_address: '',
    phone: '',
    bank_account: {
      account_holder_name: bankAccountOnFile?.account_holder_name || '',
      bank_name: bankAccountOnFile?.bank_name || 'ABSA',
      account_number: '',
      branch_code: bankAccountOnFile?.branch_code || '',
      account_type: bankAccountOnFile?.account_type || 'cheque',
    },
  });

  const buttonLabel = useMemo(() => {
    if (submitting) return 'Submitting...';
    if (kycStatus === 'rejected') return 'Re-submit KYC';
    return 'Submit KYC';
  }, [kycStatus, submitting]);

  const validate = () => {
    if (!form.business_name.trim()) return 'Business name is required';
    if (!form.id_number.trim()) return 'ID number is required';
    if (!form.date_of_birth.trim()) return 'Date of birth is required';
    if (!form.residential_address.trim()) return 'Residential address is required';
    if (!form.phone.trim()) return 'Phone number is required';
    if (!form.bank_account.account_holder_name.trim()) return 'Account holder name is required';
    if (!/^\d{9,11}$/.test(form.bank_account.account_number)) return 'Account number must be 9–11 digits';
    if (!/^\d{6}$/.test(form.bank_account.branch_code)) return 'Branch code must be exactly 6 digits';
    return null;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    await onSubmit(form);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">KYC Verification</h3>
        {statusBadge(kycStatus)}
      </div>

      {error && (
        <div className="rounded-md border border-[var(--ff-error-subtle)] bg-[var(--ff-error-subtle)] px-3 py-2 text-sm text-[var(--ff-error-bold)]">{error}</div>
      )}

      <div>
        <label htmlFor="kyc-business-name" className="block text-sm text-[var(--ff-ink-muted)] mb-1">Business Name</label>
        <input
          id="kyc-business-name"
          type="text"
          placeholder="Business Name"
          value={form.business_name}
          disabled={disabled}
          onChange={(e) => setForm((prev) => ({ ...prev, business_name: e.target.value }))}
          className="w-full rounded-lg border border-[rgba(255,255,255,0.10)] bg-[#0D1B2A] px-4 py-3 text-sm text-white placeholder:text-[#8A99AA] disabled:opacity-60"
        />
      </div>

      <div>
        <label htmlFor="kyc-id-number" className="block text-sm text-[var(--ff-ink-muted)] mb-1">ID Number</label>
        <input
          id="kyc-id-number"
          type="text"
          placeholder="ID Number"
          value={form.id_number}
          disabled={disabled}
          onChange={(e) => setForm((prev) => ({ ...prev, id_number: e.target.value }))}
          className="w-full rounded-lg border border-[rgba(255,255,255,0.10)] bg-[#0D1B2A] px-4 py-3 text-sm text-white placeholder:text-[#8A99AA] disabled:opacity-60"
        />
      </div>

      <div>
        <label htmlFor="kyc-dob" className="block text-sm text-[var(--ff-ink-muted)] mb-1">Date of Birth</label>
        <input
          id="kyc-dob"
          type="date"
          value={form.date_of_birth}
          disabled={disabled}
          onChange={(e) => setForm((prev) => ({ ...prev, date_of_birth: e.target.value }))}
          className="w-full rounded-lg border border-[rgba(255,255,255,0.10)] bg-[#0D1B2A] px-4 py-3 text-sm text-white disabled:opacity-60"
        />
      </div>

      <div>
        <label htmlFor="kyc-address" className="block text-sm text-[var(--ff-ink-muted)] mb-1">Residential Address</label>
        <input
          id="kyc-address"
          type="text"
          placeholder="Residential Address"
          value={form.residential_address}
          disabled={disabled}
          onChange={(e) => setForm((prev) => ({ ...prev, residential_address: e.target.value }))}
          className="w-full rounded-lg border border-[rgba(255,255,255,0.10)] bg-[#0D1B2A] px-4 py-3 text-sm text-white placeholder:text-[#8A99AA] disabled:opacity-60"
        />
      </div>

      <div>
        <label htmlFor="kyc-phone" className="block text-sm text-[var(--ff-ink-muted)] mb-1">Phone</label>
        <input
          id="kyc-phone"
          type="text"
          placeholder="Phone"
          value={form.phone}
          disabled={disabled}
          onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
          className="w-full rounded-lg border border-[rgba(255,255,255,0.10)] bg-[#0D1B2A] px-4 py-3 text-sm text-white placeholder:text-[#8A99AA] disabled:opacity-60"
        />
      </div>

      <div className="rounded-lg border border-[var(--ff-border)] bg-[var(--ff-surface)] p-4 space-y-3">
        <p className="text-xs uppercase tracking-wide text-[var(--ff-ink-muted)]">South African Bank Account</p>

        <div>
          <label htmlFor="kyc-account-holder" className="block text-sm text-[var(--ff-ink-muted)] mb-1">Account Holder Name</label>
          <input
            id="kyc-account-holder"
            type="text"
            placeholder="Account holder name"
            value={form.bank_account.account_holder_name}
            disabled={disabled}
            onChange={(e) => setForm((prev) => ({
              ...prev,
              bank_account: { ...prev.bank_account, account_holder_name: e.target.value },
            }))}
            className="w-full rounded-lg border border-[rgba(255,255,255,0.10)] bg-[#0D1B2A] px-4 py-3 text-sm text-white placeholder:text-[#8A99AA] disabled:opacity-60"
          />
        </div>

        <div>
          <label htmlFor="kyc-bank-name" className="block text-sm text-[var(--ff-ink-muted)] mb-1">Bank Name</label>
          <select
            id="kyc-bank-name"
            value={form.bank_account.bank_name}
            disabled={disabled}
            onChange={(e) => setForm((prev) => ({
              ...prev,
              bank_account: { ...prev.bank_account, bank_name: e.target.value },
            }))}
            className="w-full rounded-lg border border-[rgba(255,255,255,0.10)] bg-[#0D1B2A] px-4 py-3 text-sm text-white disabled:opacity-60"
          >
            {BANK_OPTIONS.map((bank) => (
              <option key={bank} value={bank}>{bank}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="kyc-account-number" className="block text-sm text-[var(--ff-ink-muted)] mb-1">Account Number</label>
          <input
            id="kyc-account-number"
            type="text"
            placeholder="Account number (9-11 digits)"
            value={disabled ? (maskedAccountNumber || '') : form.bank_account.account_number}
            disabled={disabled}
            onChange={(e) => setForm((prev) => ({
              ...prev,
              bank_account: { ...prev.bank_account, account_number: e.target.value.replace(/\D/g, '').slice(0, 11) },
            }))}
            className="w-full rounded-lg border border-[rgba(255,255,255,0.10)] bg-[#0D1B2A] px-4 py-3 text-sm text-white placeholder:text-[#8A99AA] disabled:opacity-60"
          />
        </div>

        <div>
          <label htmlFor="kyc-branch-code" className="block text-sm text-[var(--ff-ink-muted)] mb-1">Branch Code</label>
          <input
            id="kyc-branch-code"
            type="text"
            placeholder="Branch code (6 digits)"
            value={form.bank_account.branch_code}
            disabled={disabled}
            onChange={(e) => setForm((prev) => ({
              ...prev,
              bank_account: { ...prev.bank_account, branch_code: e.target.value.replace(/\D/g, '').slice(0, 6) },
            }))}
            className="w-full rounded-lg border border-[rgba(255,255,255,0.10)] bg-[#0D1B2A] px-4 py-3 text-sm text-white placeholder:text-[#8A99AA] disabled:opacity-60"
          />
        </div>

        <div>
          <label htmlFor="kyc-account-type" className="block text-sm text-[var(--ff-ink-muted)] mb-1">Account Type</label>
          <select
            id="kyc-account-type"
            value={form.bank_account.account_type}
            disabled={disabled}
            onChange={(e) => setForm((prev) => ({
              ...prev,
              bank_account: { ...prev.bank_account, account_type: e.target.value as SABankAccountForm['account_type'] },
            }))}
            className="w-full rounded-lg border border-[rgba(255,255,255,0.10)] bg-[#0D1B2A] px-4 py-3 text-sm text-white disabled:opacity-60"
          >
            <option value="cheque">Cheque/Current</option>
            <option value="savings">Savings</option>
            <option value="transmission">Transmission</option>
          </select>
        </div>
      </div>

      {!disabled && (
        <button
          type="submit"
          disabled={submitting}
          className="bg-[#AAFF45] hover:bg-[#95E830] disabled:bg-[#95E830]/60 px-4 py-3 min-h-[44px] rounded-lg text-sm font-medium text-[#0D1B2A]"
        >
          {buttonLabel}
        </button>
      )}
    </form>
  );
};

export default KYCForm;
