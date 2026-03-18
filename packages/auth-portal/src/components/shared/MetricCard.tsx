import { Card } from "../../design-system";

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "neutral";
  color?: "green" | "red" | "blue" | "amber";
}

export function MetricCard({ label, value, unit, trend, color }: MetricCardProps) {
  const colorClasses = {
    green: "text-emerald-700",
    red: "text-red-700",
    blue: "text-blue-700",
    amber: "text-amber-700"
  };

  const trendSymbols = {
    up: "↗",
    down: "↘",
    neutral: "→"
  };

  return (
    <Card variant="default" className="p-5">
      <div className="mb-2 text-xs font-medium uppercase tracking-widest text-[var(--ff-ink-muted)]">
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-bold tabular-nums ${color ? colorClasses[color] : 'text-[var(--ff-ink)]'}`}>
          {value}
        </span>
        {unit && <span className="text-sm text-[var(--ff-ink-muted)]">{unit}</span>}
        {trend && <span className="text-sm text-[var(--ff-ink-muted)]">{trendSymbols[trend]}</span>}
      </div>
    </Card>
  );
}
