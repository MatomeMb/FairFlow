import { FormEvent, useEffect, useMemo, useState } from 'react';
import type { FormState, FormErrors, SuccessPayload, ProductTemplate } from '../types/productCreation';
import type { MerchantProductApi } from '../../../types/merchant';
import { INITIAL_STATE } from '../config/productTemplates';
import { validateProductForm } from '../validation/createProductValidation';
import { submitProductForm, uploadProductImage } from '../services/createProductApi';
import { getMerchantToken } from '../../../lib/merchantTokenStorage';

interface UseCreateProductFormParams {
  isOpen: boolean;
  onCreated: (product: MerchantProductApi) => void;
  onClose: () => void;
  token?: string | null;
}

export function useCreateProductForm({ isOpen, onCreated, onClose, token }: UseCreateProductFormParams) {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');
  const [selectedImageName, setSelectedImageName] = useState('');
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [successPayload, setSuccessPayload] = useState<SuccessPayload | null>(null);
  const [createdProduct, setCreatedProduct] = useState<MerchantProductApi | null>(null);
  const [copiedField, setCopiedField] = useState<'matter' | 'page' | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setForm(INITIAL_STATE);
      setErrors({});
      setSubmitError('');
      setIsSubmitting(false);
      setIsUploadingImage(false);
      setImageUploadError('');
      setSelectedImageName('');
      setStep('form');
      setSuccessPayload(null);
      setCreatedProduct(null);
      setCopiedField(null);
      setSelectedTemplateId(null);
    }
  }, [isOpen]);

  const prettyPrice = useMemo(() => {
    if (form.price_cents === null) return 'R0.00';
    return `R${(form.price_cents / 100).toFixed(2)}`;
  }, [form.price_cents]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePriceChange = (value: string) => {
    if (value === '') {
      setField('priceRands', '');
      setField('price_cents', null);
      return;
    }
    if (!/^\d*(\.\d{0,2})?$/.test(value)) return;
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      setField('priceRands', value);
      setField('price_cents', null);
      return;
    }
    setField('priceRands', value);
    setField('price_cents', Math.round(parsed * 100));
  };

  const toggleCertification = (cert: string) => {
    setForm((prev) => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter((c) => c !== cert)
        : [...prev.certifications, cert],
    }));
  };

  const applyTemplate = (template: ProductTemplate) => {
    setSelectedTemplateId(template.id);
    setForm((prev) => ({
      ...prev,
      title: template.title,
      description: template.description,
      priceRands: template.priceRands,
      price_cents: Math.round(Number(template.priceRands) * 100),
      category: template.category,
      stock_count: template.stock_count,
      shipping_available: template.shipping_available,
      certifications: [...template.certifications],
    }));
    setErrors((prev) => ({
      ...prev,
      title: undefined,
      price_cents: undefined,
      category: undefined,
      stock_count: undefined,
    }));
  };

  const handleImageFileUpload = async (file: File) => {
    setImageUploadError('');
    setSubmitError('');
    setSelectedImageName(file.name);
    setIsUploadingImage(true);
    setField('image_url', '');
    setErrors((prev) => ({ ...prev, image_url: undefined }));
    const result = await uploadProductImage(file, token ?? getMerchantToken());
    if (result.success && result.image_url) {
      setField('image_url', result.image_url);
    } else {
      setImageUploadError(result.error ?? 'Upload failed');
    }
    setIsUploadingImage(false);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitError('');
    if (isUploadingImage) {
      setSubmitError('Image is still uploading. Please wait.');
      return;
    }
    const validationErrors = validateProductForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    setIsSubmitting(true);
    const result = await submitProductForm(form, token ?? getMerchantToken());
    if (!result.success) {
      setSubmitError(result.error ?? 'Failed to create product');
      setIsSubmitting(false);
      return;
    }
    if (result.payload) {
      setSuccessPayload(result.payload);
      setCreatedProduct(result.product ?? null);
      setStep('success');
    } else if (result.product) {
      onCreated(result.product);
      onClose();
    }
  };

  const handleCopy = async (value: string, field: 'matter' | 'page') => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      window.setTimeout(() => setCopiedField(null), 1500);
    } catch {
      setSubmitError('Failed to copy to clipboard');
    }
  };

  const clearImageSelection = () => {
    setSelectedImageName('');
    setField('image_url', '');
  };

  const clearTemplateSelection = () => setSelectedTemplateId(null);

  const handleCreateAnother = () => {
    setForm(INITIAL_STATE);
    setErrors({});
    setSubmitError('');
    setIsSubmitting(false);
    setIsUploadingImage(false);
    setImageUploadError('');
    setSelectedImageName('');
    setStep('form');
    setSuccessPayload(null);
    setCreatedProduct(null);
    setCopiedField(null);
    setSelectedTemplateId(null);
  };

  const handleDone = () => {
    if (createdProduct) onCreated(createdProduct);
    onClose();
  };

  return {
    form, errors, submitError, isSubmitting, isUploadingImage,
    imageUploadError, selectedImageName, step, successPayload,
    copiedField, selectedTemplateId, prettyPrice,
    setField, handlePriceChange, toggleCertification, applyTemplate,
    handleImageFileUpload, handleSubmit, handleCopy,
    handleCreateAnother, handleDone,
    clearImageSelection, clearTemplateSelection,
  };
}
