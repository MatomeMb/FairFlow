type StatusDotStatus = 'online' | 'offline' | 'degraded' | 'pending';

interface StatusDotProps {
  status: StatusDotStatus;
  label?: string;
  className?: string;
}

const statusMap: Record<StatusDotStatus, string> = {
  online: 'bg-ff-success',
  offline: 'bg-ff-error',
  degraded: 'bg-ff-warning',
  pending: 'bg-ff-info',
};

export function StatusDot({
  status,
  label,
  className = '',
}: StatusDotProps) {
  const color = statusMap[status];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`w-3 h-3 rounded-full ${color} animate-pulse`} />
      {label && <span className="text-sm text-[var(--ff-ink-muted)]">{label}</span>}
    </div>
  );
}
