import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface MerchantPortalGuardProps {
  children: React.ReactNode;
}

/** Allows access if a merchant token (or API key) is present in URL/storage/env. */
export function MerchantPortalGuard({ children }: MerchantPortalGuardProps) {
  const { loading } = useAuth();

  // Merchant API requires a merchant token (or API key), so gate entry on it.
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
