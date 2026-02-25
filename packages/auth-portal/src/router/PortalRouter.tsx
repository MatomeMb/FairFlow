import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { RoleGuard } from "../components/RoleGuard";

// Pages
import { LoginPage } from "../pages/LoginPage";
import { UnauthorizedPage } from "../pages/UnauthorizedPage";
import { ProductPage } from "../pages/ProductPage";
import { OrderConfirmation } from "../pages/OrderConfirmation";
import { MerchantRegister } from "../pages/MerchantRegister";
import { MerchantLogin } from "../pages/MerchantLogin";

// Portals
import { CEODashboard } from "../pages/portals/CEODashboard";
import { CTOAdminPanel } from "../pages/portals/CTOAdminPanel";
import { MerchantPortal } from "../pages/portals/MerchantPortal";
import { InvestorMode } from "../pages/portals/InvestorMode";
import { ConsumerShop } from "../pages/portals/ConsumerShop";

// Role → portal path mapping
const ROLE_HOME: Record<string, string> = {
  ceo: "/dashboard/ceo",
  cto: "/dashboard/cto",
  merchant: "/dashboard/merchant",
  investor: "/dashboard/investor",
  consumer: "/shop",
};

function AuthRedirect() {
  const { role, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }
  if (!role) return <Navigate to="/login" replace />;
  return <Navigate to={ROLE_HOME[role] ?? "/shop"} replace />;
}

export function PortalRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        
        {/* Merchant Self-Serve Auth */}
        <Route path="/merchant/register" element={<MerchantRegister />} />
        <Route path="/merchant/login" element={<MerchantLogin />} />
        
        {/* Public Product & Order Pages */}
        <Route path="/product/:hash" element={<ProductPage />} />
        <Route path="/order/success" element={<OrderConfirmation />} />

        {/* Smart redirect based on role */}
        <Route path="/" element={<AuthRedirect />} />

        {/* CEO Portal */}
        <Route
          path="/dashboard/ceo"
          element={
            <RoleGuard allowedRoles={["ceo"]}>
              <CEODashboard />
            </RoleGuard>
          }
        />

        {/* CTO Portal */}
        <Route
          path="/dashboard/cto"
          element={
            <RoleGuard allowedRoles={["cto"]}>
              <CTOAdminPanel />
            </RoleGuard>
          }
        />

        {/* Merchant Portal - accessible via role OR JWT token */}
        <Route
          path="/dashboard/merchant"
          element={
            <RoleGuard allowedRoles={["merchant", "ceo", "cto"]}>
              <MerchantPortal />
            </RoleGuard>
          }
        />
        
        {/* Merchant shorthand route */}
        <Route path="/merchant" element={<MerchantPortal />} />

        {/* Investor Mode — read-only */}
        <Route
          path="/dashboard/investor"
          element={
            <RoleGuard allowedRoles={["investor", "ceo"]}>
              <InvestorMode />
            </RoleGuard>
          }
        />

        {/* Consumer Shop */}
        <Route
          path="/shop"
          element={
            <RoleGuard allowedRoles={["consumer", "ceo", "cto", "merchant", "investor"]}>
              <ConsumerShop />
            </RoleGuard>
          }
        />

        {/* Auth callback (for OAuth redirect) */}
        <Route path="/auth/callback" element={<AuthRedirect />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
