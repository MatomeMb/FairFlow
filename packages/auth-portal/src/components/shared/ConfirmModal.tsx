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
      <div className="mx-4 w-full max-w-md rounded-xl border border-[var(--ff-border)] bg-white p-6 shadow-[0_20px_50px_rgba(27,35,48,0.18)]">
        <h3 className="mb-3 text-xl font-semibold text-[var(--ff-ink)]">{title}</h3>
        <p className="mb-6 text-[var(--ff-ink-muted)]">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="rounded-lg border border-[var(--ff-border)] bg-[var(--ff-surface)] px-4 py-2 text-sm font-medium text-[var(--ff-ink)] transition-colors hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[var(--ff-accent)]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ff-focus)] ${
              danger
                ? 'border border-[var(--ff-error-subtle)] bg-[var(--ff-error-subtle)] text-[var(--ff-error-bold)] hover:brightness-95'
                : 'bg-[var(--ff-cta)] hover:bg-[var(--ff-cta-hover)] text-white'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
