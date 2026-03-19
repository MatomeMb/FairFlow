import { useEffect } from "react";
import { X } from "lucide-react";
import { Card } from "../../design-system";

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
    success: "bg-[var(--ff-success-subtle)] border-[var(--ff-success)] text-[var(--ff-success-bold)]",
    error: "bg-[var(--ff-error-subtle)] border-[var(--ff-error)] text-[var(--ff-error-bold)]",
    info: "bg-[var(--ff-info-subtle)] border-[var(--ff-info)] text-[var(--ff-info-bold)]"
  };

  return (
    <Card variant="bordered" className={`fixed bottom-4 right-4 ${colors[type]} px-4 py-3 shadow-lg z-50 max-w-md`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={onDismiss}
          className="text-[var(--ff-ink-muted)] transition-colors hover:text-[var(--ff-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-accent)]/40 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </Card>
  );
}
