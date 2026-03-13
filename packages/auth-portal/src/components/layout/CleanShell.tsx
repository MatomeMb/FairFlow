import { ReactNode } from "react";

interface CleanShellProps {
  title: ReactNode;
  subtitle: string;
  version: string;
  onLogout: () => void;
  children: ReactNode;
}

export function CleanShell({ title, subtitle, version, onLogout, children }: CleanShellProps) {
  return (
    <div className="min-h-screen bg-[var(--ff-bg)] text-[var(--ff-ink)]">
      {/* Top Banner */}
      <div className="border-b border-[var(--ff-border)] bg-white/90 px-6 py-4 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <div className="text-lg font-semibold text-[var(--ff-ink)]">{title}</div>
            <span className="hidden sm:inline text-[var(--ff-ink-muted)]">│</span>
            <span className="text-sm text-[var(--ff-ink-muted)]">{subtitle}</span>
            <span className="hidden sm:inline text-[var(--ff-ink-muted)]">│</span>
            <span className="text-xs text-[var(--ff-ink-muted)]">Read Only</span>
          </div>
          <button
            onClick={onLogout}
            className="rounded-lg border border-[var(--ff-border)] bg-[var(--ff-surface)] px-4 py-2 text-sm font-medium text-[var(--ff-ink)] transition-colors hover:brightness-95"
          >
            Sign Out
          </button>
        </div>
        <div className="max-w-7xl mx-auto mt-2 text-xs text-[var(--ff-ink-muted)]">
          Ethical Shopping Platform · {version} · Feb 2026
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto py-8 px-6">
        {children}
      </div>
    </div>
  );
}
