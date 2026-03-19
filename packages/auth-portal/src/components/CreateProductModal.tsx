import type { CreateProductModalProps, FormState } from '../features/product-creation/types/productCreation';
import { PRODUCT_TEMPLATES, CATEGORY_OPTIONS, CERTIFICATION_OPTIONS } from '../features/product-creation/config/productTemplates';
import { useCreateProductForm } from '../features/product-creation/hooks/useCreateProductForm';

export default function CreateProductModal({ isOpen, onClose, onCreated }: CreateProductModalProps) {
  const {
    form, errors, submitError, isSubmitting, isUploadingImage,
    imageUploadError, selectedImageName, step, successPayload,
    copiedField, selectedTemplateId, prettyPrice,
    setField, handlePriceChange, toggleCertification, applyTemplate,
    handleImageFileUpload, handleSubmit, handleCopy,
    handleCreateAnother, handleDone,
    clearImageSelection, clearTemplateSelection,
  } = useCreateProductForm({ isOpen, onCreated, onClose });

  const productPageUrl = `${window.location.origin}/product/${successPayload?.hash}`;

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(13,27,42,0.85)] p-4">
      <div className="w-full max-w-2xl rounded-xl border border-[var(--ff-border)] bg-[#0D1B2A] shadow-xl max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 flex items-center justify-between border-b border-[rgba(255,255,255,0.10)]">
          <h2 className="text-lg font-semibold text-white">Create Product</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm text-[#8A99AA] transition-colors hover:bg-[#1A2D42] hover:text-white"
            disabled={isSubmitting}
          >
            Close
          </button>
        </div>

        {step === 'form' ? (
          <form id="create-product-form" onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-4 space-y-5">
          <div className="rounded-xl border border-[rgba(255,255,255,0.10)] bg-[#1A2D42] p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Start from a product template</p>
              <button
                type="button"
                onClick={clearTemplateSelection}
                className="text-xs font-medium text-[#8A99AA] hover:text-white"
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
                        ? 'border-ff-success bg-ff-success-subtle'
                        : 'border-[rgba(255,255,255,0.10)] bg-[#0D1B2A] hover:bg-[#1A2D42]'
                    }`}
                  >
                    <p className="text-xs uppercase tracking-[0.12em] text-[#8A99AA]">{template.subtitle}</p>
                    <p className="mt-1 text-sm font-semibold text-white">{template.label}</p>
                    <p className="mt-1 text-xs text-[#8A99AA]">R {template.priceRands}</p>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-[#8A99AA]">
              Templates prefill title, description, category, price, stock, shipping, and certifications. You can still edit every field.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-white">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              maxLength={255}
              className="w-full rounded-lg border border-[rgba(255,255,255,0.10)] bg-[#1A2D42] px-3 py-2 text-sm text-white placeholder-[#8A99AA] outline-none transition-colors focus:border-emerald-500"
              placeholder="Product title"
            />
            {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-white">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-[rgba(255,255,255,0.10)] bg-[#1A2D42] px-3 py-2 text-sm text-white placeholder-[#8A99AA] outline-none transition-colors focus:border-emerald-500"
              placeholder="Describe your product"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-white">Price (Rands) *</label>
              <input
                type="text"
                inputMode="decimal"
                value={form.priceRands}
                onChange={(e) => handlePriceChange(e.target.value)}
                className="w-full rounded-lg border border-[rgba(255,255,255,0.10)] bg-[#1A2D42] px-3 py-2 text-sm text-white placeholder-[#8A99AA] outline-none transition-colors focus:border-emerald-500"
                placeholder="125.00"
              />
              <p className="mt-1 text-xs text-[#8A99AA]">Price preview: {prettyPrice}</p>
              {errors.price_cents && <p className="mt-1 text-xs text-red-400">{errors.price_cents}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-white">Stock Count *</label>
              <input
                type="number"
                min={0}
                step={1}
                value={form.stock_count}
                onChange={(e) => setField('stock_count', e.target.value)}
                className="w-full rounded-lg border border-[rgba(255,255,255,0.10)] bg-[#1A2D42] px-3 py-2 text-sm text-white placeholder-[#8A99AA] outline-none transition-colors focus:border-emerald-500"
              />
              {errors.stock_count && <p className="mt-1 text-xs text-red-400">{errors.stock_count}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-white">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setField('category', e.target.value as FormState['category'])}
                className="w-full rounded-lg border border-[rgba(255,255,255,0.10)] bg-[#1A2D42] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-emerald-500"
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
              <label className="mb-1 block text-sm font-medium text-white">Product Image *</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    void handleImageFileUpload(file);
                  } else {
                    clearImageSelection();
                  }
                }}
                className="w-full rounded-lg border border-[rgba(255,255,255,0.10)] bg-[#1A2D42] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-emerald-500"
              />
              <p className="mt-1 text-xs text-[#8A99AA]">
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
                  className="mt-2 h-24 w-24 rounded-md object-cover border border-[rgba(255,255,255,0.10)]"
                />
              )}
              {imageUploadError && <p className="mt-1 text-xs text-red-400">{imageUploadError}</p>}
              {errors.image_url && <p className="mt-1 text-xs text-red-400">{errors.image_url}</p>}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-white">
              <input
                type="checkbox"
                checked={form.shipping_available}
                onChange={(e) => setField('shipping_available', e.target.checked)}
                className="h-4 w-4 rounded border-[rgba(255,255,255,0.10)] bg-[#1A2D42] text-emerald-500 focus:ring-emerald-500"
              />
              Shipping available
            </label>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-white">Certifications</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {CERTIFICATION_OPTIONS.map((certification) => (
                <label key={certification} className="flex items-center gap-2 text-sm text-white">
                  <input
                    type="checkbox"
                    checked={form.certifications.includes(certification)}
                    onChange={() => toggleCertification(certification)}
                    className="h-4 w-4 rounded border-[rgba(255,255,255,0.10)] bg-[#1A2D42] text-emerald-500 focus:ring-emerald-500"
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
              <p className="text-sm text-[#8A99AA]">R{((successPayload?.price_cents ?? 0) / 100).toFixed(2)}</p>
            </div>

            <div>
              <p className="mb-1 text-xs text-[#8A99AA]">
                Your portable product link — share this anywhere. It works even if your website changes.
              </p>
              <div className="flex items-center gap-2 rounded-lg border border-[rgba(255,255,255,0.10)] bg-[#1A2D42] px-3 py-2">
                <code className="flex-1 text-xs text-emerald-400 break-all">{successPayload?.matter_uri}</code>
                <button
                  type="button"
                  onClick={() => handleCopy(successPayload?.matter_uri ?? '', 'matter')}
                  className="min-h-[44px] rounded-md border border-[rgba(255,255,255,0.10)] bg-[#1A2D42] px-3 py-2 text-xs text-white hover:bg-[#0D1B2A]"
                >
                  {copiedField === 'matter' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div>
              <p className="mb-1 text-xs text-[#8A99AA]">
                Direct product page — share this link for consumers to buy immediately.
              </p>
              <p className="text-xs text-[#8A99AA] mb-2">Product page:</p>
              <div className="flex items-center gap-2 rounded-lg border border-[rgba(255,255,255,0.10)] bg-[#1A2D42] px-3 py-2">
                <code className="flex-1 text-xs text-blue-400 break-all">{productPageUrl}</code>
                <button
                  type="button"
                  onClick={() => handleCopy(productPageUrl, 'page')}
                  className="min-h-[44px] rounded-md border border-[rgba(255,255,255,0.10)] bg-[#1A2D42] px-3 py-2 text-xs text-white hover:bg-[#0D1B2A]"
                >
                  {copiedField === 'page' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="px-6 py-4 border-t border-[rgba(255,255,255,0.10)] flex justify-end gap-3 flex-shrink-0">
          {step === 'form' ? (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-lg border border-[rgba(255,255,255,0.10)] bg-[#1A2D42] px-4 py-2 text-sm font-medium text-white transition-colors hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="create-product-form"
                disabled={isSubmitting || isUploadingImage}
                className="rounded-lg bg-[#AAFF45] px-4 py-2 text-sm font-semibold text-[#0D1B2A] transition-colors hover:bg-[#95E830] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUploadingImage ? 'Uploading image...' : isSubmitting ? 'Creating product...' : 'Create Product'}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCreateAnother}
                className="rounded-lg border border-[rgba(255,255,255,0.10)] bg-[#1A2D42] px-4 py-2 text-sm font-medium text-white transition-colors hover:brightness-95"
              >
                Create Another
              </button>
              <button
                type="button"
                onClick={handleDone}
                className="rounded-lg bg-[#AAFF45] px-4 py-2 text-sm font-semibold text-[#0D1B2A] transition-colors hover:bg-[#95E830]"
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
