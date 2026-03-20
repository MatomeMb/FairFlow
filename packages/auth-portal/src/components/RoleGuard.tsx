import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { AppRole } from "../types/auth";

interface RoleGuardProps {
  allowedRoles: AppRole[];
  children: React.ReactNode;
  redirectTo?: string;
}

export function RoleGuard({ allowedRoles, children, redirectTo = "/unauthorized" }: RoleGuardProps) {
  const { role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--ff-bg)]">
        <div className="text-lg text-[var(--ff-ink)]">Loading...</div>
      </div>
    );
  }

  if (!role) {
    const next = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?redirect=${encodeURIComponent(next)}`} replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
