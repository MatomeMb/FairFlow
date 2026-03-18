import { CheckCircle2, RefreshCw, Clock } from 'lucide-react';

export type StatusType = 'complete' | 'in-progress' | 'upcoming';

export function SprintStatus({ status }: { status: StatusType }) {
  const config = {
    'complete':    { icon: CheckCircle2, label: 'Complete',     className: 'text-ff-success bg-ff-success/10' },
    'in-progress': { icon: RefreshCw,   label: 'In Progress',  className: 'text-ff-warning bg-ff-warning/10' },
    'upcoming':    { icon: Clock,       label: 'Upcoming',     className: 'text-[var(--ff-ink-muted)] bg-[var(--ff-surface)]' },
  };
  const { icon: Icon, label, className } = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${className}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

export type StatusDotType = 'online' | 'offline' | 'degraded';

export function StatusDot({ status }: { status: StatusDotType }) {
  const colors = {
    online:   'bg-ff-success',
    offline:  'bg-ff-error',
    degraded: 'bg-ff-warning',
  };
  
  const labels = {
    online:   'Online',
    offline:  'Offline',
    degraded: 'Degraded',
  };
  
  const textColors = {
    online:   'text-ff-success',
    offline:  'text-ff-error',
    degraded: 'text-ff-warning',
  };
  
  return (
    <span className="inline-flex items-center gap-2 text-sm">
      <span className={`w-2 h-2 rounded-full ${colors[status]} shadow-[0_0_6px_currentColor]`} />
      <span className={textColors[status]}>
        {labels[status]}
      </span>
    </span>
  );
}

export type TalentStatusType = 'potential' | 'contacted' | 'interviewing' | 'hired' | 'rejected';

export function TalentStatusBadge({ status }: { status: TalentStatusType }) {
  const config = {
    'potential':    { label: 'Potential',    className: 'text-[var(--ff-ink-muted)] bg-[var(--ff-surface)] border border-[var(--ff-border)]' },
    'contacted':    { label: 'Contacted',    className: 'text-ff-info bg-ff-info/10 border border-ff-info/20' },
    'interviewing': { label: 'Interviewing', className: 'text-ff-warning bg-ff-warning/10 border border-ff-warning/20' },
    'hired':        { label: 'Hired',        className: 'text-ff-success bg-ff-success/10 border border-ff-success/20' },
    'rejected':     { label: 'Not Moving',   className: 'text-[var(--ff-ink-muted)] bg-[var(--ff-surface)] border border-[var(--ff-border)]' },
  };
  
  const { label, className } = config[status];
  
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

export function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    'ceo':      'text-purple-300 bg-purple-500/10 border-purple-500/20',
    'cto':      'text-ff-info bg-ff-info/10 border-ff-info/20',
    'merchant': 'text-orange-300 bg-orange-500/10 border-orange-500/20',
    'investor': 'text-ff-success bg-ff-success/10 border-ff-success/20',
    'consumer': 'text-[var(--ff-ink-muted)] bg-[var(--ff-surface)] border-[var(--ff-border)]',
  };
  
  return (
    <span className={`
      inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border
      ${styles[role] || 'text-[var(--ff-ink-muted)] bg-[var(--ff-surface)] border-[var(--ff-border)]'}
    `}>
      {role}
    </span>
  );
}

export function SkillTag({ label }: { label: string }) {
  return (
    <span className="inline-block px-1.5 py-0.5 text-xs rounded bg-[var(--ff-surface)] text-[var(--ff-ink-muted)] border border-[var(--ff-border)]">
      {label}
    </span>
  );
}

export function SectionSkeleton() {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="h-4 w-32 rounded bg-[var(--ff-surface)]" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl border border-[var(--ff-border)] bg-white/85" />
        ))}
      </div>
      <div className="h-64 rounded-xl border border-[var(--ff-border)] bg-white/85" />
    </div>
  );
}
