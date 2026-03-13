import { FormEvent, useEffect, useMemo, useState } from 'react';
import { apiBase, apiKey } from '../lib/config';
import type { MerchantProductApi } from '../types/merchant';

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (product: MerchantProductApi) => void;
}

type FormState = {
  title: string;
  description: string;
  priceRands: string;
  price_cents: number | null;
  category: '' | 'coffee' | 'textiles' | 'food' | 'crafts' | 'beauty' | 'other';
  stock_count: string;
  image_url: string;
  shipping_available: boolean;
  certifications: string[];
};

type FormErrors = {
  title?: string;
  price_cents?: string;
  category?: string;
  stock_count?: string;
  image_url?: string;
};

type SuccessPayload = {
  title: string;
  price_cents: number;
  matter_uri: string;
  thing_url: string;
  hash: string;
};

type ProductTemplate = {
  id: string;
  label: string;
  subtitle: string;
  title: string;
  description: string;
  category: FormState['category'];
  priceRands: string;
  stock_count: string;
  shipping_available: boolean;
  certifications: string[];
};

const CATEGORY_OPTIONS = ['coffee', 'textiles', 'food', 'crafts', 'beauty', 'other'] as const;
const CERTIFICATION_OPTIONS = ['fair-trade', 'organic', 'b-corp', 'handmade'] as const;

const PRODUCT_TEMPLATES: ProductTemplate[] = [
  {
    id: 'coffee-kit',
    label: 'Coffee Starter Kit',
    subtitle: 'Coffee',
    title: 'Single-Origin Starter Kit',
    description: 'Freshly roasted single-origin beans with brew guide and reusable filter.',
    category: 'coffee',
    priceRands: '299.00',
    stock_count: '25',
    shipping_available: true,
    certifications: ['fair-trade', 'organic'],
  },
  {
    id: 'artisan-textile',
    label: 'Artisan Textile',
    subtitle: 'Textiles',
    title: 'Handwoven Table Runner',
    description: 'Locally handwoven textile with natural dyes and premium finishing.',
    category: 'textiles',
    priceRands: '420.00',
    stock_count: '14',
    shipping_available: true,
    certifications: ['handmade'],
  },
  {
    id: 'beauty-bundle',
    label: 'Beauty Bundle',
    subtitle: 'Beauty',
    title: 'Botanical Skin Bundle',
    description: 'Daily cleanser, hydration mist, and moisturizer made with plant-based ingredients.',
    category: 'beauty',
    priceRands: '365.00',
    stock_count: '18',
    shipping_available: true,
    certifications: ['organic'],
  },
];

const INITIAL_STATE: FormState = {
  title: '',
  description: '',
  priceRands: '',
  price_cents: null,
  category: '',
  stock_count: '0',
  image_url: '',
  shipping_available: false,
  certifications: [],
};

export default function CreateProductModal({ isOpen, onClose, onCreated }: CreateProductModalProps) {
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

  const productPageUrl = `${window.location.origin}/product/${successPayload?.hash}`;

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev: FormState) => ({ ...prev, [key]: value }));
  };

  const handlePriceChange = (value: string) => {
    if (value === '') {
      setField('priceRands', '');
      setField('price_cents', null);
      return;
    }

    if (!/^\d*(\.\d{0,2})?$/.test(value)) {
      return;
    }

    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      setField('priceRands', value);
      setField('price_cents', null);
      return;
    }

    setField('priceRands', value);
    setField('price_cents', Math.round(parsed * 100));
  };

  const toggleCertification = (certification: string) => {
    setForm((prev: FormState) => {
      const exists = prev.certifications.includes(certification);
      return {
        ...prev,
        certifications: exists
          ? prev.certifications.filter((cert: string) => cert !== certification)
          : [...prev.certifications, certification],
      };
    });
  };

  const applyTemplate = (template: ProductTemplate) => {
    setSelectedTemplateId(template.id);
    setForm((prev: FormState) => ({
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

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};

    const trimmedTitle = form.title.trim();
    if (!trimmedTitle) {
      nextErrors.title = 'Title is required';
    } else if (trimmedTitle.length > 255) {
      nextErrors.title = 'Title must be 255 characters or less';
    }

    if (form.price_cents === null || !Number.isInteger(form.price_cents) || form.price_cents <= 0) {
      nextErrors.price_cents = 'Price must be greater than 0';
    }

    if (!form.category) {
      nextErrors.category = 'Category is required';
    }

    const stockCountParsed = Number(form.stock_count);
    if (!Number.isInteger(stockCountParsed) || stockCountParsed < 0) {
      nextErrors.stock_count = 'Stock count must be 0 or greater';
    }

    const trimmedImageUrl = form.image_url.trim();
    if (!trimmedImageUrl) {
      nextErrors.image_url = 'Product image is required';
    } else {
      try {
        const parsed = new URL(trimmedImageUrl);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          nextErrors.image_url = 'Image URL must start with http:// or https://';
        }
      } catch {
        nextErrors.image_url = 'Enter a valid image URL';
      }
    }

    return nextErrors;
  };

  const handleImageFileUpload = async (file: File) => {
    setImageUploadError('');
    setSubmitError('');
    setSelectedImageName(file.name);
    setIsUploadingImage(true);
    setField('image_url', '');
    setErrors((prev) => ({ ...prev, image_url: undefined }));

    try {
      const headers: HeadersInit = { 'x-merchant-id': 'dev-merchant-001' };
      if (apiKey) {
        headers['x-api-key'] = apiKey;
      }

      const payload = new FormData();
      payload.append('image', file);

      const response = await fetch(`${apiBase}/v1/merchant/uploads/image`, {
        method: 'POST',
        headers,
        body: payload,
      });
      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.image_url || typeof data.image_url !== 'string') {
        setImageUploadError(data?.message || 'Failed to upload image');
        return;
      }

      setField('image_url', data.image_url);
    } catch {
      setImageUploadError('Network error while uploading image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitError('');

    if (isUploadingImage) {
      setSubmitError('Image is still uploading. Please wait.');
      return;
    }

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBase}/v1/merchant/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-merchant-id': 'dev-merchant-001',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          price_cents: form.price_cents,
          category: form.category,
          stock_count: Number(form.stock_count),
          image_url: form.image_url.trim(),
          shipping_available: form.shipping_available,
          certifications: form.certifications,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSubmitError(data?.message || 'Failed to create product');
        setIsSubmitting(false);
        return;
      }

      const thing = data?.thing_file;
      if (thing?.matter_uri && thing?.thing_url && thing?.hash) {
        setSuccessPayload({
          title: data.title,
          price_cents: data.price_cents,
          matter_uri: thing.matter_uri,
          thing_url: thing.thing_url,
          hash: thing.hash,
        });
        setCreatedProduct(data as MerchantProductApi);
        setStep('success');
      } else {
        onCreated(data as MerchantProductApi);
        onClose();
      }
    } catch {
      setSubmitError('Network error while creating product');
      setIsSubmitting(false);
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
    if (createdProduct) {
      onCreated(createdProduct);
    }
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(27,35,48,0.34)] p-4">
      <div className="w-full max-w-2xl rounded-xl border border-[var(--ff-border)] bg-white shadow-xl max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--ff-ink)]">Create Product</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm text-[var(--ff-ink-muted)] transition-colors hover:bg-[var(--ff-surface)] hover:text-[var(--ff-ink)]"
            disabled={isSubmitting}
          >
            Close
          </button>
        </div>

        {step === 'form' ? (
          <form id="create-product-form" onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-4 space-y-5">
          <div className="rounded-xl border border-[var(--ff-border)] bg-[var(--ff-surface)] p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-[var(--ff-ink)]">Start from a product template</p>
              <button
                type="button"
                onClick={() => setSelectedTemplateId(null)}
                className="text-xs font-medium text-[var(--ff-ink-muted)] hover:text-[var(--ff-ink)]"
              >
                Clear selection
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {PRODUCT_TEMPLATES.map((template) => {
                const isActive = selectedTemplateId === template.id;
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => applyTemplate(template)}
                    className={`rounded-lg border px-3 py-3 text-left transition ${
                      isActive
                        ? 'border-emerald-500 bg-emerald-50/70'
                        : 'border-[var(--ff-border)] bg-white hover:bg-[var(--ff-surface)]'
                    }`}
                  >
                    <p className="text-xs uppercase tracking-[0.12em] text-[var(--ff-ink-muted)]">{template.subtitle}</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--ff-ink)]">{template.label}</p>
                    <p className="mt-1 text-xs text-[var(--ff-ink-muted)]">R {template.priceRands}</p>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-[var(--ff-ink-muted)]">
              Templates prefill title, description, category, price, stock, shipping, and certifications. You can still edit every field.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--ff-ink)]">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              maxLength={255}
              className="w-full rounded-lg border border-[var(--ff-border)] bg-white px-3 py-2 text-sm text-[var(--ff-ink)] outline-none transition-colors focus:border-emerald-500"
              placeholder="Product title"
            />
            {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--ff-ink)]">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-[var(--ff-border)] bg-white px-3 py-2 text-sm text-[var(--ff-ink)] outline-none transition-colors focus:border-emerald-500"
              placeholder="Describe your product"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--ff-ink)]">Price (Rands) *</label>
              <input
                type="text"
                inputMode="decimal"
                value={form.priceRands}
                onChange={(e) => handlePriceChange(e.target.value)}
                className="w-full rounded-lg border border-[var(--ff-border)] bg-white px-3 py-2 text-sm text-[var(--ff-ink)] outline-none transition-colors focus:border-emerald-500"
                placeholder="125.00"
              />
              <p className="mt-1 text-xs text-[var(--ff-ink-muted)]">Price preview: {prettyPrice}</p>
              {errors.price_cents && <p className="mt-1 text-xs text-red-400">{errors.price_cents}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--ff-ink)]">Stock Count *</label>
              <input
                type="number"
                min={0}
                step={1}
                value={form.stock_count}
                onChange={(e) => setField('stock_count', e.target.value)}
                className="w-full rounded-lg border border-[var(--ff-border)] bg-white px-3 py-2 text-sm text-[var(--ff-ink)] outline-none transition-colors focus:border-emerald-500"
              />
              {errors.stock_count && <p className="mt-1 text-xs text-red-400">{errors.stock_count}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--ff-ink)]">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setField('category', e.target.value as FormState['category'])}
                className="w-full rounded-lg border border-[var(--ff-border)] bg-white px-3 py-2 text-sm text-[var(--ff-ink)] outline-none transition-colors focus:border-emerald-500"
              >
                <option value="">Select category</option>
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-xs text-red-400">{errors.category}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--ff-ink)]">Product Image *</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    void handleImageFileUpload(file);
                  } else {
                    setSelectedImageName('');
                    setField('image_url', '');
                  }
                }}
                className="w-full rounded-lg border border-[var(--ff-border)] bg-white px-3 py-2 text-sm text-[var(--ff-ink)] outline-none transition-colors focus:border-emerald-500"
              />
              <p className="mt-1 text-xs text-[var(--ff-ink-muted)]">
                {isUploadingImage
                  ? `Uploading ${selectedImageName || 'image'}...`
                  : form.image_url
                    ? `Uploaded from disk: ${selectedImageName || 'image'}`
                    : 'Choose an image file from your device'}
              </p>
              {form.image_url && (
                <img
                  src={form.image_url}
                  alt="Product preview"
                  className="mt-2 h-24 w-24 rounded-md object-cover border border-[var(--ff-border)]"
                />
              )}
              {imageUploadError && <p className="mt-1 text-xs text-red-400">{imageUploadError}</p>}
              {errors.image_url && <p className="mt-1 text-xs text-red-400">{errors.image_url}</p>}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-[var(--ff-ink)]">
              <input
                type="checkbox"
                checked={form.shipping_available}
                onChange={(e) => setField('shipping_available', e.target.checked)}
                className="h-4 w-4 rounded border-[var(--ff-border)] bg-white text-emerald-500 focus:ring-emerald-500"
              />
              Shipping available
            </label>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-[var(--ff-ink)]">Certifications</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {CERTIFICATION_OPTIONS.map((certification) => (
                <label key={certification} className="flex items-center gap-2 text-sm text-[var(--ff-ink)]">
                  <input
                    type="checkbox"
                    checked={form.certifications.includes(certification)}
                    onChange={() => toggleCertification(certification)}
                    className="h-4 w-4 rounded border-[var(--ff-border)] bg-white text-emerald-500 focus:ring-emerald-500"
                  />
                  {certification}
                </label>
              ))}
            </div>
          </div>

          </form>
        ) : (
          <div className="overflow-y-auto flex-1 px-6 py-6 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <span className="text-lg">✓</span>
              <span className="text-sm font-semibold">Product published</span>
            </div>
            <div>
              <p className="text-lg font-semibold text-[var(--ff-ink)]">{successPayload?.title}</p>
              <p className="text-sm text-[var(--ff-ink-muted)]">R{((successPayload?.price_cents ?? 0) / 100).toFixed(2)}</p>
            </div>

            <div>
              <p className="mb-1 text-xs text-[var(--ff-ink-muted)]">
                Your portable product link — share this anywhere. It works even if your website changes.
              </p>
              <div className="flex items-center gap-2 rounded-lg border border-[var(--ff-border)] bg-[var(--ff-surface)] px-3 py-2">
                <code className="flex-1 text-xs text-emerald-400 break-all">{successPayload?.matter_uri}</code>
                <button
                  type="button"
                  onClick={() => handleCopy(successPayload?.matter_uri ?? '', 'matter')}
                  className="min-h-[44px] rounded-md border border-[var(--ff-border)] bg-white px-3 py-2 text-xs text-[var(--ff-ink)] hover:bg-[var(--ff-surface)]"
                >
                  {copiedField === 'matter' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div>
              <p className="mb-1 text-xs text-[var(--ff-ink-muted)]">
                Direct product page — share this link for consumers to buy immediately.
              </p>
              <p className="text-xs text-[var(--ff-ink-muted)] mb-2">Product page:</p>
              <div className="flex items-center gap-2 rounded-lg border border-[var(--ff-border)] bg-[var(--ff-surface)] px-3 py-2">
                <code className="flex-1 text-xs text-blue-400 break-all">{productPageUrl}</code>
                <button
                  type="button"
                  onClick={() => handleCopy(productPageUrl, 'page')}
                  className="min-h-[44px] rounded-md border border-[var(--ff-border)] bg-white px-3 py-2 text-xs text-[var(--ff-ink)] hover:bg-[var(--ff-surface)]"
                >
                  {copiedField === 'page' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="px-6 py-4 border-t border-[var(--ff-border)] flex justify-end gap-3 flex-shrink-0">
          {step === 'form' ? (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-lg border border-[var(--ff-border)] bg-[var(--ff-surface)] px-4 py-2 text-sm font-medium text-[var(--ff-ink)] transition-colors hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="create-product-form"
                disabled={isSubmitting || isUploadingImage}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUploadingImage ? 'Uploading image...' : isSubmitting ? 'Creating product...' : 'Create Product'}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCreateAnother}
                className="rounded-lg border border-[var(--ff-border)] bg-[var(--ff-surface)] px-4 py-2 text-sm font-medium text-[var(--ff-ink)] transition-colors hover:brightness-95"
              >
                Create Another
              </button>
              <button
                type="button"
                onClick={handleDone}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
              >
                Done
              </button>
            </>
          )}
        </div>
        {submitError && <p className="px-6 pb-4 text-sm text-red-400">{submitError}</p>}
      </div>
    </div>
  );
}
