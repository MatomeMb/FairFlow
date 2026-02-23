import { ReactNode, ComponentType } from "react";

interface NavItem {
  id: string;
  label: string;
  icon?: string | ComponentType<{ className?: string }>;
}

interface PortalShellProps {
  title: ReactNode;
  version: string;
  nav: NavItem[];
  activeSection: string;
  onNavChange: (id: string) => void;
  onLogout: () => void;
  children: ReactNode;
}

export function PortalShell({ title, version, nav, activeSection, onNavChange, onLogout, children }: PortalShellProps) {
  return (
    <div className="flex h-screen bg-stone-950">
      {/* Sidebar */}
      <div className="w-56 bg-stone-900 border-r border-stone-800 flex flex-col">
        <div className="p-6 border-b border-stone-800">
          <div className="text-lg font-semibold text-white">{title}</div>
          <p className="text-xs text-stone-500 mt-1">{version}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((item) => {
            const IconComponent = typeof item.icon === 'function' ? item.icon : null;
            const isStringIcon = typeof item.icon === 'string';
            return (
              <button
                key={item.id}
                onClick={() => onNavChange(item.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeSection === item.id
                    ? 'bg-stone-800 border-l-2 border-emerald-500 text-white'
                    : 'text-stone-400 hover:bg-stone-800 hover:text-white'
                }`}
              >
                {IconComponent ? (
                  <IconComponent className="w-4 h-4 flex-shrink-0" />
                ) : isStringIcon ? (
                  <span className="flex-shrink-0">{item.icon as string}</span>
                ) : null}
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-3 border-t border-stone-800">
          <button
            onClick={onLogout}
            className="w-full px-3 py-2 text-sm font-medium text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
