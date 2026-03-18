import type { AppRole } from "../../types/portal";

interface RoleBadgeProps {
  role: AppRole;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const config: Record<AppRole, { label: string; className: string }> = {
    ceo: {
      label: "CEO",
      className: "bg-[var(--ff-primary)]/15 text-[var(--ff-primary)] border-[var(--ff-primary)]/30",
    },
    cto: {
      label: "CTO",
      className: "bg-[var(--ff-info)]/15 text-[var(--ff-info)] border-[var(--ff-info)]/30",
    },
    merchant: {
      label: "Merchant",
      className: "bg-[var(--ff-warning)]/15 text-[var(--ff-warning)] border-[var(--ff-warning)]/30",
    },
    investor: {
      label: "Investor",
      className: "bg-[var(--ff-success)]/15 text-[var(--ff-success)] border-[var(--ff-success)]/30",
    },
    consumer: {
      label: "Consumer",
      className: "bg-[var(--ff-neutral-subtle)] text-[var(--ff-ink-muted)] border-[var(--ff-border-mid)]",
    },
  };

  const { label, className } = config[role];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${className}`}>
      {label}
    </span>
  );
}
