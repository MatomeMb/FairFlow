import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function UnauthorizedPage() {
  const navigate = useNavigate();
  const { role, signOut } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-950">
      <div className="w-full max-w-md p-8 bg-stone-900 rounded-2xl border border-stone-800 text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-stone-400 mb-6">
          You don't have permission to access this area.
        </p>
        {role && (
          <p className="text-stone-500 text-sm mb-8">
            Current role: <span className="text-emerald-500 font-mono">{role}</span>
          </p>
        )}
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/")}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl transition"
          >
            Go to Dashboard
          </button>
          <button
            onClick={signOut}
            className="flex-1 bg-stone-800 hover:bg-stone-700 text-white font-medium py-3 rounded-xl transition"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
