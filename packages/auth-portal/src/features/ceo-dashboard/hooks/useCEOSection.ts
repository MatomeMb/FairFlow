import { useState } from 'react';

export type CEOSection =
  | 'overview'
  | 'platform-health'
  | 'users-roles'
  | 'merchants'
  | 'financials'
  | 'investor-view'
  | 'settings';

export interface CEONavigationItem {
  id: CEOSection;
  label: string;
  icon: 'BarChart2' | 'Activity' | 'Users' | 'Store' | 'DollarSign' | 'TrendingUp' | 'Settings2';
}

const NAVIGATION: CEONavigationItem[] = [
  { id: 'overview', label: 'Overview', icon: 'BarChart2' },
  { id: 'platform-health', label: 'Platform Health', icon: 'Activity' },
  { id: 'users-roles', label: 'Users & Roles', icon: 'Users' },
  { id: 'merchants', label: 'Merchants', icon: 'Store' },
  { id: 'financials', label: 'Financials', icon: 'DollarSign' },
  { id: 'investor-view', label: 'Investor View', icon: 'TrendingUp' },
  { id: 'settings', label: 'Settings', icon: 'Settings2' },
];

export function useCEOSection(initialSection: CEOSection = 'overview') {
  const [activeSection, setActiveSection] = useState<CEOSection>(initialSection);
  return { navigation: NAVIGATION, activeSection, setActiveSection };
}
