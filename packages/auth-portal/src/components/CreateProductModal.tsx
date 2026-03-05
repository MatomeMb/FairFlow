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

const CATEGORY_OPTIONS = ['coffee', 'textiles', 'food', 'crafts', 'beauty', 'other'] as const;
const CERTIFICATION_OPTIONS = ['fair-trade', 'organic', 'b-corp', 'handmade'] as const;

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
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [successPayload, setSuccessPayload] = useState<SuccessPayload | null>(null);
  const [createdProduct, setCreatedProduct] = useState<MerchantProductApi | null>(null);
  const [copiedField, setCopiedField] = useState<'matter' | 'page' | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setForm(INITIAL_STATE);
      setErrors({});
      setSubmitError('');
      setIsSubmitting(false);
      setStep('form');
      setSuccessPayload(null);
      setCreatedProduct(null);
      setCopiedField(null);
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

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitError('');

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
    setStep('form');
    setSuccessPayload(null);
    setCreatedProduct(null);
    setCopiedField(null);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-stone-800 bg-stone-900 shadow-xl max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Create Product</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm text-stone-300 transition-colors hover:bg-stone-800 hover:text-white"
            disabled={isSubmitting}
          >
            Close
          </button>
        </div>

        {step === 'form' ? (
          <form id="create-product-form" onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-300">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              maxLength={255}
              className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-emerald-500"
              placeholder="Product title"
            />
            {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-stone-300">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-emerald-500"
              placeholder="Describe your product"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-300">Price (Rands) *</label>
              <input
                type="text"
                inputMode="decimal"
                value={form.priceRands}
                onChange={(e) => handlePriceChange(e.target.value)}
                className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-emerald-500"
                placeholder="125.00"
              />
              <p className="mt-1 text-xs text-stone-400">Price preview: {prettyPrice}</p>
              {errors.price_cents && <p className="mt-1 text-xs text-red-400">{errors.price_cents}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-stone-300">Stock Count *</label>
              <input
                type="number"
                min={0}
                step={1}
                value={form.stock_count}
                onChange={(e) => setField('stock_count', e.target.value)}
                className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-emerald-500"
              />
              {errors.stock_count && <p className="mt-1 text-xs text-red-400">{errors.stock_count}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-300">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setField('category', e.target.value as FormState['category'])}
                className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-emerald-500"
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
              <label className="mb-1 block text-sm font-medium text-stone-300">Image URL *</label>
              <input
                type="url"
                value={form.image_url}
                onChange={(e) => setField('image_url', e.target.value)}
                className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-emerald-500"
                placeholder="https://example.com/image.jpg"
                required
              />
              {errors.image_url && <p className="mt-1 text-xs text-red-400">{errors.image_url}</p>}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-stone-300">
              <input
                type="checkbox"
                checked={form.shipping_available}
                onChange={(e) => setField('shipping_available', e.target.checked)}
                className="h-4 w-4 rounded border-stone-600 bg-stone-800 text-emerald-500 focus:ring-emerald-500"
              />
              Shipping available
            </label>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-stone-300">Certifications</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {CERTIFICATION_OPTIONS.map((certification) => (
                <label key={certification} className="flex items-center gap-2 text-sm text-stone-300">
                  <input
                    type="checkbox"
                    checked={form.certifications.includes(certification)}
                    onChange={() => toggleCertification(certification)}
                    className="h-4 w-4 rounded border-stone-600 bg-stone-800 text-emerald-500 focus:ring-emerald-500"
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
              <p className="text-lg font-semibold text-white">{successPayload?.title}</p>
              <p className="text-sm text-stone-400">R{((successPayload?.price_cents ?? 0) / 100).toFixed(2)}</p>
            </div>

            <div>
              <p className="mb-1 text-xs text-stone-400">
                Your portable product link — share this anywhere. It works even if your website changes.
              </p>
              <div className="flex items-center gap-2 rounded-lg border border-stone-700 bg-stone-800 px-3 py-2">
                <code className="flex-1 text-xs text-emerald-400 break-all">{successPayload?.matter_uri}</code>
                <button
                  type="button"
                  onClick={() => handleCopy(successPayload?.matter_uri ?? '', 'matter')}
                  className="rounded-md bg-stone-700 hover:bg-stone-600 px-3 py-2 text-xs text-white min-h-[44px]"
                >
                  {copiedField === 'matter' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div>
              <p className="mb-1 text-xs text-stone-400">
                Direct product page — share this link for consumers to buy immediately.
              </p>
              <p className="text-xs text-stone-500 mb-2">Product page:</p>
              <div className="flex items-center gap-2 rounded-lg border border-stone-700 bg-stone-800 px-3 py-2">
                <code className="flex-1 text-xs text-blue-400 break-all">{productPageUrl}</code>
                <button
                  type="button"
                  onClick={() => handleCopy(productPageUrl, 'page')}
                  className="rounded-md bg-stone-700 hover:bg-stone-600 px-3 py-2 text-xs text-white min-h-[44px]"
                >
                  {copiedField === 'page' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="px-6 py-4 border-t border-stone-200 flex justify-end gap-3 flex-shrink-0">
          {step === 'form' ? (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-lg bg-stone-800 hover:bg-stone-700 px-4 py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="create-product-form"
                disabled={isSubmitting}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Creating product...' : 'Create Product'}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCreateAnother}
                className="rounded-lg bg-stone-800 hover:bg-stone-700 px-4 py-2 text-sm font-medium text-white transition-colors"
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
