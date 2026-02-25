import { CheckCircle2, RefreshCw, Clock } from 'lucide-react';

export type StatusType = 'complete' | 'in-progress' | 'upcoming';

export function SprintStatus({ status }: { status: StatusType }) {
  const config = {
    'complete':    { icon: CheckCircle2, label: 'Complete',     className: 'text-emerald-400 bg-emerald-400/10' },
    'in-progress': { icon: RefreshCw,   label: 'In Progress',  className: 'text-yellow-400 bg-yellow-400/10' },
    'upcoming':    { icon: Clock,       label: 'Upcoming',     className: 'text-stone-400 bg-stone-800' },
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
    online:   'bg-emerald-400',
    offline:  'bg-red-500',
    degraded: 'bg-yellow-400',
  };
  
  const labels = {
    online:   'Online',
    offline:  'Offline',
    degraded: 'Degraded',
  };
  
  const textColors = {
    online:   'text-emerald-400',
    offline:  'text-red-400',
    degraded: 'text-yellow-400',
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
    'potential':    { label: 'Potential',    className: 'text-stone-400 bg-stone-800 border border-stone-700' },
    'contacted':    { label: 'Contacted',    className: 'text-blue-300 bg-blue-500/10 border border-blue-500/20' },
    'interviewing': { label: 'Interviewing', className: 'text-yellow-300 bg-yellow-500/10 border border-yellow-500/20' },
    'hired':        { label: 'Hired',        className: 'text-emerald-300 bg-emerald-500/10 border border-emerald-500/20' },
    'rejected':     { label: 'Not Moving',   className: 'text-stone-600 bg-stone-900 border border-stone-800' },
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
    'cto':      'text-blue-300 bg-blue-500/10 border-blue-500/20',
    'merchant': 'text-orange-300 bg-orange-500/10 border-orange-500/20',
    'investor': 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
    'consumer': 'text-stone-400 bg-stone-800 border-stone-700',
  };
  
  return (
    <span className={`
      inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border
      ${styles[role] || 'text-stone-400 bg-stone-800 border-stone-700'}
    `}>
      {role}
    </span>
  );
}

export function SkillTag({ label }: { label: string }) {
  return (
    <span className="inline-block px-1.5 py-0.5 text-xs rounded bg-stone-800 text-stone-400 border border-stone-700">
      {label}
    </span>
  );
}

export function SectionSkeleton() {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="h-4 w-32 bg-stone-800 rounded" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-stone-900 border border-stone-800 rounded-xl" />
        ))}
      </div>
      <div className="h-64 bg-stone-900 border border-stone-800 rounded-xl" />
    </div>
  );
}
