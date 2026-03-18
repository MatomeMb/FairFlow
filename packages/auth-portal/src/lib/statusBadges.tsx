import { CheckCircle2, RefreshCw, Clock } from 'lucide-react';
import { Badge } from '../design-system';

export type StatusType = 'complete' | 'in-progress' | 'upcoming';

export function SprintStatus({ status }: { status: StatusType }) {
  const config = {
    'complete':    { icon: CheckCircle2, label: 'Complete',     variant: 'success' as const },
    'in-progress': { icon: RefreshCw,   label: 'In Progress',  variant: 'warning' as const },
    'upcoming':    { icon: Clock,       label: 'Upcoming',     variant: 'neutral' as const },
  };
  const { icon: Icon, label, variant } = config[status];
  return (
    <Badge variant={variant} size="sm">
      <Icon className="w-3 h-3" />
      {label}
    </Badge>
  );
}

export type StatusDotType = 'online' | 'offline' | 'degraded';

export function StatusDot({ status }: { status: StatusDotType }) {
  const variants = {
    online:   'success' as const,
    offline:  'danger' as const,
    degraded: 'warning' as const,
  };
  
  const labels = {
    online:   'Online',
    offline:  'Offline',
    degraded: 'Degraded',
  };
  
  return (
    <Badge variant={variants[status]} size="sm">
      {labels[status]}
    </Badge>
  );
}

export type TalentStatusType = 'potential' | 'contacted' | 'interviewing' | 'hired' | 'rejected';

export function TalentStatusBadge({ status }: { status: TalentStatusType }) {
  const variants = {
    'potential':    'neutral' as const,
    'contacted':    'info' as const,
    'interviewing': 'warning' as const,
    'hired':        'success' as const,
    'rejected':     'danger' as const,
  };

  const labels = {
    'potential':    'Potential',
    'contacted':    'Contacted',
    'interviewing': 'Interviewing',
    'hired':        'Hired',
    'rejected':     'Not Moving',
  };
  
  return (
    <Badge variant={variants[status]} size="sm">
      {labels[status]}
    </Badge>
  );
}

export function RoleBadge({ role }: { role: string }) {
  const variants: Record<string, 'neutral' | 'info' | 'warning' | 'success' | 'danger' | 'primary'> = {
    'ceo':      'primary',
    'cto':      'info',
    'merchant': 'warning',
    'investor': 'success',
    'consumer': 'neutral',
  };
  
  return (
    <Badge variant={variants[role] || 'neutral'} size="sm">
      {role}
    </Badge>
  );
}

export function SkillTag({ label }: { label: string }) {
  return (
    <Badge variant="neutral" size="sm">
      {label}
    </Badge>
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
