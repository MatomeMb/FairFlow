import { useState } from 'react';

export function useAdminShellState() {
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);

  return {
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar: () => setSidebarOpen((prev) => !prev),
    closeSidebar: () => setSidebarOpen(false),
  };
}
