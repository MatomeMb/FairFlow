import { useState } from 'react';
import { apiBase } from '../../../lib/config';

export interface KYCSubmission {
  id: string;
  businessName: string;
  email: string;
  kycStatus: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  kycData: { id_number: string; date_of_birth: string; phone: string; address: string };
  bankAccount: { account_holder_name: string; bank_name: string; account_number: string; branch_code: string; account_type: string };
}

type ActionType = 'approve' | 'reject';
type ToastType = 'success' | 'error' | 'info';

export function useAdminKYCQueue(token: string, onToast?: (message: string, type: ToastType) => void) {
  const [pendingKYC, setPendingKYC] = useState<KYCSubmission[]>([]);
  const [loadingKYC, setLoadingKYC] = useState(false);
  const [selectedKYC, setSelectedKYC] = useState<KYCSubmission | null>(null);
  const [kycAction, setKYCAction] = useState<ActionType | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');

  const loadKYCQueue = async () => {
    setLoadingKYC(true);
    try {
      const response = await fetch(`${apiBase}/v1/admin/kyc/pending`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (data.ok && data.pending) setPendingKYC(data.pending);
    } catch {
      onToast?.('Failed to fetch pending KYC', 'error');
    } finally {
      setLoadingKYC(false);
    }
  };

  const openKYCAction = (submission: KYCSubmission, action: ActionType) => {
    setSelectedKYC(submission);
    setKYCAction(action);
  };

  const resetKYCAction = () => {
    setSelectedKYC(null);
    setKYCAction(null);
    setRejectionReason('');
    setApprovalNotes('');
  };

  const handleKYCAction = async () => {
    if (!selectedKYC || !kycAction) return;
    if (kycAction === 'reject' && !rejectionReason.trim()) return;
    const path = kycAction === 'approve' ? 'approve' : 'reject';
    const payload = kycAction === 'approve' ? { notes: approvalNotes } : { reason: rejectionReason };
    try {
      const response = await fetch(`${apiBase}/v1/admin/kyc/${path}/${selectedKYC.id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!data.ok) throw new Error(data.error || 'KYC action failed');
      const actionVerb = kycAction === 'approve' ? 'approved' : 'rejected';
      onToast?.(`KYC ${actionVerb} for ${selectedKYC.businessName}`, 'success');
      resetKYCAction();
      await loadKYCQueue();
    } catch {
      onToast?.(`Failed to ${kycAction} KYC`, 'error');
    }
  };

  return {
    pendingKYC,
    loadingKYC,
    selectedKYC,
    kycAction,
    rejectionReason,
    setRejectionReason,
    approvalNotes,
    setApprovalNotes,
    loadKYCQueue,
    openKYCAction,
    resetKYCAction,
    handleKYCAction,
  };
}
