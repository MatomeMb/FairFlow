import type { AppRole } from "../../types/portal";

interface RoleBadgeProps {
  role: AppRole;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const config = {
    ceo: { color: "purple", label: "CEO" },
    cto: { color: "blue", label: "CTO" },
    merchant: { color: "orange", label: "Merchant" },
    investor: { color: "green", label: "Investor" },
    consumer: { color: "stone", label: "Consumer" }
  };

  const { color, label } = config[role];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-${color}-500/20 text-${color}-300 border border-${color}-500/30`}>
      {label}
    </span>
  );
}
