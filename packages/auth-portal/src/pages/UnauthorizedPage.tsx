import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function UnauthorizedPage() {
  const navigate = useNavigate();
  const { role, signOut } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--ff-bg)] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--ff-border)] bg-[#1A2D42] p-8 text-center shadow-[0_8px_40px_rgba(0,0,0,0.08)]">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="mb-2 text-2xl font-bold text-white">Access Denied</h1>
        <p className="mb-6 text-[#8A99AA]">
          You don't have permission to access this area.
        </p>
        {role && (
          <p className="mb-8 text-sm text-[var(--ff-ink-muted)]">
            Current role: <span className="text-[var(--ff-cta)] font-mono">{role}</span>
          </p>
        )}
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/")}
            className="flex-1 bg-[var(--ff-cta)] hover:bg-[var(--ff-cta-hover)] text-[var(--ff-on-accent)] font-medium py-3 rounded-xl transition"
          >
            Go to Dashboard
          </button>
          <button
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
