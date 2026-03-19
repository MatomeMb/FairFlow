import { ReactNode, useEffect, useRef, useState } from "react";

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
  const tabRowRef = useRef<HTMLDivElement | null>(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [showLeftCue, setShowLeftCue] = useState(false);
  const [showRightCue, setShowRightCue] = useState(false);

  const updateScrollCues = () => {
    const node = tabRowRef.current;
    if (!node) return;

    const overflow = node.scrollWidth > node.clientWidth + 2;
    const canScrollLeft = node.scrollLeft > 2;
    const canScrollRight = node.scrollLeft + node.clientWidth < node.scrollWidth - 2;

    setHasOverflow(overflow);
    setShowLeftCue(overflow && canScrollLeft);
    setShowRightCue(overflow && canScrollRight);
  };

  useEffect(() => {
    updateScrollCues();
    const onResize = () => updateScrollCues();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [tabs.length]);

  return (
    <div className="min-h-screen bg-[var(--ff-bg)] text-[var(--ff-ink)]">
      {/* Header */}
      <div className="border-b border-[var(--ff-border)] bg-[#1A2D42] backdrop-blur-sm">
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
        <div className="relative border-t border-[var(--ff-border)]">
          <div
            className={`pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-8 bg-gradient-to-r from-[#1A2D42]/95 to-transparent transition-opacity sm:hidden ${
              showLeftCue ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden="true"
          />
          <div
            className={`pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-8 bg-gradient-to-l from-[#1A2D42]/95 to-transparent transition-opacity sm:hidden ${
              showRightCue ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden="true"
          />
          <div
            ref={tabRowRef}
            onScroll={updateScrollCues}
            className="px-4 md:px-6 flex gap-1 overflow-x-auto"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`shrink-0 whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-[var(--ff-accent)] text-[var(--ff-ink)]'
                    : 'border-transparent text-[var(--ff-ink-muted)] hover:text-[var(--ff-ink)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {hasOverflow && (
            <p className="px-4 pb-2 text-[11px] font-medium tracking-wide text-[var(--ff-ink-muted)] sm:hidden">
              Swipe left or right to see all tabs
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
