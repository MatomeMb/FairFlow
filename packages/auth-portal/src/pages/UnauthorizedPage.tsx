import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROLE_HOME: Record<string, string> = {
  ceo: "/dashboard/admin",
  cto: "/dashboard/admin",
  merchant: "/dashboard/merchant",
  investor: "/dashboard/investor",
  consumer: "/shop",
};

export function UnauthorizedPage() {
  const navigate = useNavigate();
  const { role, signOut } = useAuth();
  const homeForRole = role ? (ROLE_HOME[role] ?? "/") : "/";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--ff-bg)] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--ff-border)] bg-white/85 p-8 text-center shadow-[0_8px_40px_rgba(0,0,0,0.08)]">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="mb-2 text-2xl font-bold text-[var(--ff-ink)]">Access Denied</h1>
        <p className="mb-6 text-[var(--ff-ink-muted)]">
          You don't have permission to access this area.
        </p>
        {role && (
          <p className="mb-8 text-sm text-[var(--ff-ink-muted)]">
            Current role: <span className="text-emerald-500 font-mono">{role}</span>
          </p>
        )}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(homeForRole)}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl transition"
          >
            {role ? "Go to your portal" : "Home"}
          </button>
          <button
            type="button"
            onClick={signOut}
            className="flex-1 rounded-xl border border-[var(--ff-border)] bg-[var(--ff-surface)] py-3 font-medium text-[var(--ff-ink)] transition hover:brightness-95"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
