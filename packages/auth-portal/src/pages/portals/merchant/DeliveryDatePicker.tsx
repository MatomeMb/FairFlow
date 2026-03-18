import { useState } from 'react';
import { Calendar, Check, Loader2 } from 'lucide-react';
import { apiBase } from '../../../lib/config';

interface DeliveryDatePickerProps {
  orderId: string;
  token: string;
  currentDate?: string | null;
  onSaved?: (date: string) => void;
}

export function DeliveryDatePicker({
  orderId,
  token,
  currentDate,
  onSaved,
}: DeliveryDatePickerProps) {
  const [date, setDate] = useState(currentDate ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!date || !token) return;
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`${apiBase}/v1/merchant/orders/${orderId}/delivery-date`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ estimated_delivery_date: date }),
      });

      if (!res.ok) {
        throw new Error('Failed to save delivery date');
      }

      setSaved(true);
      onSaved?.(date);
      window.setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Could not save delivery date. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-3 border-t border-[var(--ff-border)] pt-3">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--ff-ink-muted)]">
        Estimated delivery date
      </p>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Calendar className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--ff-ink-muted)]" />
          <input
            type="date"
            value={date}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-md border border-[var(--ff-border)] bg-white py-1.5 pl-8 pr-3 text-sm text-stone-900 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={!date || saving || !token}
          className="px-3 py-1.5 text-sm font-medium bg-emerald-600 text-white rounded-md hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 min-w-[80px] justify-center"
        >
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : saved ? (
            <>
              <Check className="w-3.5 h-3.5" /> Saved
            </>
          ) : (
            'Save'
          )}
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
      {currentDate && !saved && (
        <p className="mt-1.5 text-xs text-[var(--ff-ink-muted)]">
          Currently set: {new Date(currentDate).toLocaleDateString('en-ZA', { dateStyle: 'medium' })}
        </p>
      )}
      {!token && (
        <p className="mt-1.5 text-xs text-amber-400">Sign in again to set delivery dates.</p>
      )}
    </div>
  );
}
