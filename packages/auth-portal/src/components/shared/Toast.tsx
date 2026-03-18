import { useEffect } from "react";
import { X } from "lucide-react";

interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
  onDismiss: () => void;
}

export function Toast({ message, type, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const colors = {
    success: "bg-ff-success-subtle border-ff-success text-ff-success-bold",
    error: "bg-ff-error-subtle border-ff-error text-ff-error-bold",
    info: "bg-ff-info-subtle border-ff-info text-ff-info-bold"
  };

  return (
    <div className={`fixed bottom-4 right-4 ${colors[type]} border px-4 py-3 rounded-lg shadow-lg z-50 max-w-md`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={onDismiss}
          className="text-[var(--ff-ink-muted)] transition-colors hover:text-[var(--ff-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-accent)]/40 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
