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
    return <span className="inline-flex text-xs px-2 py-1 rounded bg-emerald-900/50 text-emerald-400">Approved</span>;
  }
  if (status === 'pending') {
    return <span className="inline-flex text-xs px-2 py-1 rounded bg-amber-900/50 text-amber-400">Pending Review</span>;
  }
  if (status === 'rejected') {
    return <span className="inline-flex text-xs px-2 py-1 rounded bg-red-900/50 text-red-400">Rejected</span>;
  }
  return <span className="inline-flex text-xs px-2 py-1 rounded bg-stone-800 text-stone-300">Not Started</span>;
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
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</div>
      )}

      <input
        type="text"
        placeholder="Business Name"
        value={form.business_name}
        disabled={disabled}
        onChange={(e) => setForm((prev) => ({ ...prev, business_name: e.target.value }))}
        className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-3 text-white text-sm disabled:opacity-60"
      />

      <input
        type="text"
        placeholder="ID Number"
        value={form.id_number}
        disabled={disabled}
        onChange={(e) => setForm((prev) => ({ ...prev, id_number: e.target.value }))}
        className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-3 text-white text-sm disabled:opacity-60"
      />

      <input
        type="date"
        value={form.date_of_birth}
        disabled={disabled}
        onChange={(e) => setForm((prev) => ({ ...prev, date_of_birth: e.target.value }))}
        className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-3 text-white text-sm disabled:opacity-60"
      />

      <input
        type="text"
        placeholder="Residential Address"
        value={form.residential_address}
        disabled={disabled}
        onChange={(e) => setForm((prev) => ({ ...prev, residential_address: e.target.value }))}
        className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-3 text-white text-sm disabled:opacity-60"
      />

      <input
        type="text"
        placeholder="Phone"
        value={form.phone}
        disabled={disabled}
        onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
        className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-3 text-white text-sm disabled:opacity-60"
      />

      <div className="rounded-lg border border-stone-700 bg-stone-800/30 p-4 space-y-3">
        <p className="text-xs uppercase tracking-wide text-stone-400">South African Bank Account</p>

        <input
          type="text"
          placeholder="Account holder name"
          value={form.bank_account.account_holder_name}
          disabled={disabled}
          onChange={(e) => setForm((prev) => ({
            ...prev,
            bank_account: { ...prev.bank_account, account_holder_name: e.target.value },
          }))}
          className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-3 text-white text-sm disabled:opacity-60"
        />

        <select
          value={form.bank_account.bank_name}
          disabled={disabled}
          onChange={(e) => setForm((prev) => ({
            ...prev,
            bank_account: { ...prev.bank_account, bank_name: e.target.value },
          }))}
          className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-3 text-white text-sm disabled:opacity-60"
        >
          {BANK_OPTIONS.map((bank) => (
            <option key={bank} value={bank}>{bank}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Account number (9-11 digits)"
          value={disabled ? (maskedAccountNumber || '') : form.bank_account.account_number}
          disabled={disabled}
          onChange={(e) => setForm((prev) => ({
            ...prev,
            bank_account: { ...prev.bank_account, account_number: e.target.value.replace(/\D/g, '').slice(0, 11) },
          }))}
          className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-3 text-white text-sm disabled:opacity-60"
        />

        <input
          type="text"
          placeholder="Branch code (6 digits)"
          value={form.bank_account.branch_code}
          disabled={disabled}
          onChange={(e) => setForm((prev) => ({
            ...prev,
            bank_account: { ...prev.bank_account, branch_code: e.target.value.replace(/\D/g, '').slice(0, 6) },
          }))}
          className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-3 text-white text-sm disabled:opacity-60"
        />

        <select
          value={form.bank_account.account_type}
          disabled={disabled}
          onChange={(e) => setForm((prev) => ({
            ...prev,
            bank_account: { ...prev.bank_account, account_type: e.target.value as SABankAccountForm['account_type'] },
          }))}
          className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-3 text-white text-sm disabled:opacity-60"
        >
          <option value="cheque">Cheque/Current</option>
          <option value="savings">Savings</option>
          <option value="transmission">Transmission</option>
        </select>
      </div>

      {!disabled && (
        <button
          type="submit"
          disabled={submitting}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-700 px-4 py-3 min-h-[44px] rounded-lg text-sm font-medium"
        >
          {buttonLabel}
        </button>
      )}
    </form>
  );
};

export default KYCForm;
