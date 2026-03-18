import { useState } from 'react';

export type AdminSection =
  | 'overview'
  | 'kyc-management'
  | 'users-roles'
  | 'merchants'
  | 'financials'
  | 'platform-health'
  | 'system'
  | 'settings';

export interface AdminNavigationItem {
  id: AdminSection;
  label: string;
  icon: 'BarChart2' | 'FileCheck' | 'Store' | 'Users' | 'Activity' | 'DollarSign' | 'Zap' | 'Settings2';
}

const NAVIGATION: AdminNavigationItem[] = [
  { id: 'overview', label: 'Dashboard', icon: 'BarChart2' },
  { id: 'kyc-management', label: 'KYC Approvals', icon: 'FileCheck' },
  { id: 'merchants', label: 'Merchants', icon: 'Store' },
  { id: 'users-roles', label: 'Users & Roles', icon: 'Users' },
  { id: 'platform-health', label: 'Platform Health', icon: 'Activity' },
  { id: 'financials', label: 'Financials', icon: 'DollarSign' },
  { id: 'system', label: 'System', icon: 'Zap' },
  { id: 'settings', label: 'Settings', icon: 'Settings2' },
];

export function useAdminNavigation(initialSection: AdminSection = 'overview') {
  const [activeSection, setActiveSection] = useState<AdminSection>(initialSection);
  return { navigation: NAVIGATION, activeSection, setActiveSection };
}
