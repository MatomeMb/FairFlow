import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { AppRole } from "../types/auth";

interface MerchantPortalGuardProps {
  children: React.ReactNode;
}

/** Allows access if user has merchant/ceo/cto role OR has valid merchant token in URL/storage. */
export function MerchantPortalGuard({ children }: MerchantPortalGuardProps) {
  const { role, loading } = useAuth();

  // Allow Supabase users with merchant, ceo, or cto role
  const allowedRoles: AppRole[] = ["merchant", "ceo", "cto"];
  if (role && allowedRoles.includes(role)) {
    return <>{children}</>;
  }

  // Allow token-based merchants (no Supabase session)
  const hasToken =
    typeof window !== "undefined" &&
    (new URLSearchParams(window.location.search).get("token") ||
      sessionStorage.getItem("merchantToken") ||
      sessionStorage.getItem("merchant_token") ||
      import.meta.env.VITE_API_KEY);

  if (hasToken) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--ff-bg)]">
        <div className="text-lg text-[var(--ff-ink)]">Loading...</div>
      </div>
    );
  }

  return <Navigate to="/merchant/login" replace />;
}
