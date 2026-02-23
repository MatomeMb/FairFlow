interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "neutral";
  color?: "green" | "red" | "blue" | "amber";
}

export function MetricCard({ label, value, unit, trend, color }: MetricCardProps) {
  const colorClasses = {
    green: "text-green-400",
    red: "text-red-400",
    blue: "text-blue-400",
    amber: "text-yellow-400"
  };

  const trendSymbols = {
    up: "↗",
    down: "↘",
    neutral: "→"
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
      <div className="text-xs font-medium text-stone-500 uppercase tracking-widest mb-2">
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-bold tabular-nums ${color ? colorClasses[color] : 'text-white'}`}>
          {value}
        </span>
        {unit && <span className="text-sm text-stone-400">{unit}</span>}
        {trend && <span className="text-stone-500 text-sm">{trendSymbols[trend]}</span>}
      </div>
    </div>
  );
}
