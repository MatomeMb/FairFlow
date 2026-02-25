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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onKeyDown={handleEscape}>
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
        <p className="text-stone-400 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-stone-300 bg-stone-800 hover:bg-stone-700 rounded-lg border border-stone-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              danger
                ? 'bg-red-900/50 hover:bg-red-900 text-red-400 border border-red-800'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
