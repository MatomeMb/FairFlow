import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { RoleGuard } from "../components/RoleGuard";
import { MerchantPortalGuard } from "../components/MerchantPortalGuard";

// Pages
import { LoginPage } from "../pages/LoginPage";
import { UnauthorizedPage } from "../pages/UnauthorizedPage";
import { ProductPage } from "../pages/ProductPage";
import { OrderConfirmation } from "../pages/OrderConfirmation";
import { OrderStatusPage } from "../pages/OrderStatusPage";
import { ConfirmReceipt } from "../pages/ConfirmReceipt";
import { MerchantLogin } from "../pages/MerchantLogin";
import { MerchantRegister } from "../pages/MerchantRegister";
import { LandingPage } from "../pages/LandingPage.tsx";

// Portals
import { AdminPortal } from "../pages/portals/AdminPortal";
import { MerchantPortal } from "../pages/portals/MerchantPortal";
import { InvestorMode } from "../pages/portals/InvestorMode";
import { ConsumerShop } from "../pages/portals/ConsumerShop";
import { AuthDiagnosticsPage } from "../pages/portals/AuthDiagnosticsPage";

// Role → portal path mapping
const ROLE_HOME: Record<string, string> = {
  ceo: "/dashboard/admin",
  cto: "/dashboard/admin",
  merchant: "/dashboard/merchant",
  investor: "/dashboard/investor",
  consumer: "/shop",
};

function AuthRedirect() {
  const { role, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--ff-bg)]">
        <div className="text-lg text-[var(--ff-ink)]">Loading...</div>
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
        <Route path="/merchant/login" element={<MerchantLogin />} />
        <Route path="/merchant/register" element={<MerchantRegister />} />
        
        {/* Public Product & Order Pages */}
        <Route path="/product/:hash" element={<ProductPage />} />
        <Route path="/order/success" element={<OrderConfirmation />} />
        <Route path="/order/confirmation" element={<OrderConfirmation />} />
        <Route path="/order/:orderId" element={<OrderStatusPage />} />
        <Route path="/order/:id/confirm" element={<ConfirmReceipt />} />

        {/* Public Landing */}
        <Route path="/" element={<LandingPage />} />

        {/* Unified Admin Portal (CEO & CTO) */}
        <Route
          path="/dashboard/admin"
          element={
            <RoleGuard allowedRoles={["ceo", "cto"]}>
              <AdminPortal />
            </RoleGuard>
          }
        />

        {/* Legacy CEO Portal (backward compatibility) */}
        <Route
          path="/dashboard/ceo"
          element={
            <RoleGuard allowedRoles={["ceo"]}>
              <AdminPortal />
            </RoleGuard>
          }
        />

        {/* Legacy CTO Portal (backward compatibility) */}
        <Route
          path="/dashboard/cto"
          element={
            <RoleGuard allowedRoles={["cto"]}>
              <AdminPortal />
            </RoleGuard>
          }
        />

        {/* Hidden auth diagnostics tool for CTO/admin incident debugging */}
        <Route
          path="/dashboard/cto/auth-diagnostics"
          element={
            <RoleGuard allowedRoles={["ceo", "cto"]}>
              <AuthDiagnosticsPage />
            </RoleGuard>
          }
        />

        {/* Merchant Portal (role or token-based auth) */}
        <Route
          path="/dashboard/merchant"
          element={
            <MerchantPortalGuard>
              <MerchantPortal />
            </MerchantPortalGuard>
          }
        />

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
