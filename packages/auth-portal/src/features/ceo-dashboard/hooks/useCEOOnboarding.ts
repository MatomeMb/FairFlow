import { useState } from 'react';

export interface CEOOnboardForm {
  businessName: string;
  contactEmail: string;
  category: string;
  certifications: string[];
}

export type CEOToastType = 'success' | 'error' | 'info';

export interface CEOToastState {
  show: boolean;
  message: string;
  type: CEOToastType;
}

const EMPTY_FORM: CEOOnboardForm = {
  businessName: '',
  contactEmail: '',
  category: '',
  certifications: [],
};

export function useCEOOnboarding() {
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [onboardForm, setOnboardForm] = useState<CEOOnboardForm>(EMPTY_FORM);
  const [toast, setToast] = useState<CEOToastState>({ show: false, message: '', type: 'info' });

  const showToast = (message: string, type: CEOToastType = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 4000);
  };

  const updateField = (field: keyof CEOOnboardForm, value: string) => {
    setOnboardForm((current) => ({ ...current, [field]: value }));
  };

  const toggleCertification = (certification: string, checked: boolean) => {
    setOnboardForm((current) => ({
      ...current,
      certifications: checked
        ? [...current.certifications, certification]
        : current.certifications.filter((value) => value !== certification),
    }));
  };

  const closeModal = () => setShowOnboardModal(false);

  const submitOnboarding = () => {
    if (!onboardForm.businessName || !onboardForm.contactEmail || !onboardForm.category) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    showToast('Invitation queued - email integration coming in Sprint 8', 'success');
    setShowOnboardModal(false);
    setOnboardForm(EMPTY_FORM);
  };

  return {
    showOnboardModal,
    setShowOnboardModal,
    onboardForm,
    toast,
    setToast,
    updateField,
    toggleCertification,
    closeModal,
    submitOnboarding,
  };
}
