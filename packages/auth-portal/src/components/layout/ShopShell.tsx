import React, { ReactNode } from 'react';
import { FairflowLogo } from '../FairflowLogo';

interface Tab {
  id: string;
  label: string;
}

interface ShopShellProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: ReactNode;
}

export const ShopShell: React.FC<ShopShellProps> = ({ tabs, activeTab, onTabChange, children }) => {
  return (
    <div className="min-h-screen bg-[var(--ff-bg)] text-[var(--ff-ink)]">
      {/* Header */}
      <div className="border-b border-[var(--ff-border)] bg-white/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <FairflowLogo markHeight={36} variant="light" />
          <p className="text-[var(--ff-ink-muted)] text-sm">Ethical Shopping Platform</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-[var(--ff-border)] bg-white/70">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`py-4 px-2 font-medium text-sm transition-colors border-b-2 ${
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
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
