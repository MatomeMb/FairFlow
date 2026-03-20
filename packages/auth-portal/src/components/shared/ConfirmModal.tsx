interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export function ConfirmModal({ isOpen, title, message, confirmLabel, onConfirm, onCancel, danger }: ConfirmModalProps) {
  if (!isOpen) return null;

  const handleEscape = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(27,35,48,0.34)]" onKeyDown={handleEscape}>
      <div className="mx-4 w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(27,35,48,0.18)] [color-scheme:light]">
        <h3 className="mb-3 text-xl font-semibold text-[#0D1B2A]">{title}</h3>
        <p className="mb-6 text-sm text-slate-600">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-[#0D1B2A] transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[var(--ff-focus)]/50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ff-focus)] ${
              danger
                ? 'border border-[var(--ff-error-subtle)] bg-[var(--ff-error-subtle)] text-[var(--ff-error-bold)] hover:brightness-95'
                : 'bg-[var(--ff-cta)] hover:bg-[var(--ff-cta-hover)] text-[var(--ff-on-accent)] font-semibold'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
