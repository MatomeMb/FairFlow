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
    <div className="min-h-screen bg-stone-950 text-white">
      {/* Header */}
      <div className="bg-stone-900 border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <FairflowLogo markHeight={36} variant="dark" />
          <p className="text-stone-400 text-sm">Ethical Shopping Platform</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-stone-900/50 border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`py-4 px-2 font-medium text-sm transition-colors border-b-2 ${
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
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
