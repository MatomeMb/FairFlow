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
    <div className="min-h-screen bg-stone-950">
      {/* Top Banner */}
      <div className="bg-stone-900 border-b border-stone-800 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <div className="text-lg font-semibold text-white">{title}</div>
            <span className="hidden sm:inline text-stone-500">│</span>
            <span className="text-sm text-stone-400">{subtitle}</span>
            <span className="hidden sm:inline text-stone-500">│</span>
            <span className="text-xs text-stone-500">Read Only</span>
          </div>
          <button
            onClick={onLogout}
            className="px-4 py-2 text-sm font-medium text-stone-300 bg-stone-800 hover:bg-stone-700 rounded-lg border border-stone-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
        <div className="max-w-7xl mx-auto mt-2 text-xs text-stone-500">
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
