import { ReactNode } from "react";

interface Tab {
  id: string;
  label: string;
}

interface TabShellProps {
  title: ReactNode;
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  onLogout: () => void;
  headerActions?: ReactNode;
  children: ReactNode;
}

export function TabShell({ title, tabs, activeTab, onTabChange, onLogout, headerActions, children }: TabShellProps) {
  return (
    <div className="min-h-screen bg-[var(--ff-bg)] text-[var(--ff-ink)]">
      {/* Header */}
      <div className="border-b border-[var(--ff-border)] bg-white/90 backdrop-blur-sm">
        <div className="px-4 md:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-xl font-semibold text-[var(--ff-ink)]">{title}</div>
          <div className="flex items-center gap-3">
            {headerActions}
            <button
              onClick={onLogout}
              className="rounded-lg border border-[var(--ff-border)] bg-[var(--ff-surface)] px-4 py-2 text-sm font-medium text-[var(--ff-ink)] transition-colors hover:brightness-95"
            >
              Sign Out
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="px-4 md:px-6 flex gap-1 border-t border-[var(--ff-border)] overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[var(--ff-accent)] text-[var(--ff-ink)]'
                  : 'border-transparent text-[var(--ff-ink-muted)] hover:text-[var(--ff-ink)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
