import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, Loader2, Package } from 'lucide-react';
import { FairflowLogo } from '../components/FairflowLogo';
import { apiBase } from '../lib/config';

export function ConfirmReceipt() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/v1/orders/${id}/confirm-receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || data?.code || 'Failed to confirm receipt');
      }
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <FairflowLogo markHeight={32} />
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          {success ? (
            <>
              <div className="w-20 h-20 bg-[var(--ff-success-subtle)] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-12 h-12 text-[var(--ff-success)]" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900 mb-2">Thank you!</h2>
              <p className="text-stone-600">
                Payment has been released to the merchant.
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-[var(--ff-info-subtle)] rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-8 h-8 text-[var(--ff-info)]" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900 mb-2">Confirm received</h2>
              <p className="text-stone-600 mb-6">
                Have you received your order? Click below to confirm and release payment to the merchant.
              </p>
              {error && (
                <div className="mb-4 p-3 bg-[var(--ff-error-subtle)] border border-[var(--ff-error)] rounded-lg text-[var(--ff-error-bold)] text-sm">
                  {error}
                </div>
              )}
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="w-full bg-[var(--ff-cta)] text-white font-semibold py-4 px-6 rounded-lg hover:bg-[var(--ff-cta-hover)] active:bg-[var(--ff-cta-active)] disabled:bg-[var(--ff-neutral-muted)] disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    I received my order ✓
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
