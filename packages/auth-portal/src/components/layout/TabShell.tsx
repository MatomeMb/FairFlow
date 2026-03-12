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
    <div className="min-h-screen bg-stone-950">
      {/* Header */}
      <div className="bg-stone-900 border-b border-stone-800">
        <div className="px-4 md:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-xl font-semibold text-white">{title}</div>
          <div className="flex items-center gap-3">
            {headerActions}
            <button
              onClick={onLogout}
              className="px-4 py-2 text-sm font-medium text-stone-300 bg-stone-800 hover:bg-stone-700 rounded-lg border border-stone-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="px-4 md:px-6 flex gap-1 border-t border-stone-800 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-white'
                  : 'border-transparent text-stone-400 hover:text-white'
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
