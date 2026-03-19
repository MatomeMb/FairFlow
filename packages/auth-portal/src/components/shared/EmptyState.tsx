import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && <div className="text-6xl mb-4">{icon}</div>}
      <h3 className="text-xl font-semibold text-[var(--ff-ink)] mb-2">{title}</h3>
      <p className="text-[var(--ff-ink-muted)] mb-6 max-w-md">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 h-9 px-4 bg-[var(--ff-cta)] hover:bg-[var(--ff-cta-hover)] text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ff-focus)]/50"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
