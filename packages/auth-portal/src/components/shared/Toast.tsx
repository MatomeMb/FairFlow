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
    success: "bg-green-900/90 border-green-700 text-green-300",
    error: "bg-red-900/90 border-red-700 text-red-300",
    info: "bg-blue-900/90 border-blue-700 text-blue-300"
  };

  return (
    <div className={`fixed bottom-4 right-4 ${colors[type]} border px-4 py-3 rounded-lg shadow-lg z-50 max-w-md`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={onDismiss}
          className="text-stone-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
