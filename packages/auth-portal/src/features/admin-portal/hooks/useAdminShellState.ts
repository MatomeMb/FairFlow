import { useEffect, useState } from 'react';
import type { LogoStyle } from '../../../components/FairflowLogo';
import { LOGO_STYLES } from '../../../components/FairflowLogo';

function isValidLogoStyle(value: string | null): value is LogoStyle {
  return Boolean(value && LOGO_STYLES.some((entry) => entry.id === value));
}

export function useAdminShellState() {
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);
  const [logoStyle, setLogoStyle] = useState<LogoStyle>('geo-tech');
  const [logoMenuOpen, setLogoMenuOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('logoStyle');
    if (isValidLogoStyle(fromUrl)) {
      setLogoStyle(fromUrl);
      window.localStorage.setItem('fairflowLogoStyle', fromUrl);
      return;
    }
    const fromStorage = window.localStorage.getItem('fairflowLogoStyle');
    if (isValidLogoStyle(fromStorage)) setLogoStyle(fromStorage);
  }, []);

  const applyLogoStyle = (style: LogoStyle) => {
    setLogoStyle(style);
    setLogoMenuOpen(false);
    window.localStorage.setItem('fairflowLogoStyle', style);
    const url = new URL(window.location.href);
    url.searchParams.set('logoStyle', style);
    window.history.replaceState({}, '', url.toString());
  };

  return {
    sidebarOpen,
    setSidebarOpen,
    logoStyle,
    logoMenuOpen,
    setLogoMenuOpen,
    toggleSidebar: () => setSidebarOpen((prev) => !prev),
    closeSidebar: () => setSidebarOpen(false),
    toggleLogoMenu: () => setLogoMenuOpen((prev) => !prev),
    applyLogoStyle,
  };
}
