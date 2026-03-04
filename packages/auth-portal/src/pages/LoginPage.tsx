import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FairflowLogo } from "../components/FairflowLogo";

// Dev mode admin emails that bypass authentication
const DEV_ADMIN_EMAILS = new Set([
  "matome@fairflow.dev",
  "sobuhle@fairflow.dev",
  "matome.mb@fairflow.dev",
  "sobuhle.n@fairflow.dev",
  "matome",
  "sobuhle",
]);

export function LoginPage() {
  const { signInWithEmail } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Dev mode: Check if this is an admin email
      if (DEV_ADMIN_EMAILS.has(email.toLowerCase())) {
        // Bypass authentication for dev admin users
        // Create a mock session that identifies them as admin
        sessionStorage.setItem("devAdminEmail", email.toLowerCase());
        navigate("/");
        return;
      }

      // Otherwise, use Supabase auth
      await signInWithEmail(email, password);
      navigate("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
    window.location.href = `${apiBase}/v1/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-950">
      <div className="w-full max-w-md p-8 bg-stone-900 rounded-2xl border border-stone-800">
        <div className="mb-2">
          <FairflowLogo markHeight={48} variant="dark" />
        </div>
        <p className="text-stone-400 mb-8 text-sm">Sign in to your portal</p>

        {/* Google OAuth */}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-white text-stone-900 font-medium py-3 rounded-xl mb-6 hover:bg-stone-100 transition disabled:opacity-50"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Sign in with Google
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-stone-800" />
          <span className="text-stone-600 text-xs">or</span>
          <div className="flex-1 h-px bg-stone-800" />
        </div>

        {/* Email/Password */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full bg-stone-800 border border-stone-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
            />
            <p className="text-xs text-stone-500 mt-1">
              {DEV_ADMIN_EMAILS.has(email.toLowerCase()) && email ? "✓ Admin access enabled" : ""}
            </p>
          </div>
          <input
            type="password"
            placeholder="Password (not needed for admin demo)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="w-full bg-stone-800 border border-stone-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl transition disabled:opacity-50"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-6 text-center text-stone-400 text-sm">
          <p className="mb-2">Demo Admin Users (Dev Mode):</p>
          <p className="text-xs text-stone-500">matome@fairflow.dev</p>
          <p className="text-xs text-stone-500">sobuhle@fairflow.dev</p>
        </div>

        <div className="mt-4 text-center text-stone-400 text-sm">
          Are you a merchant?{' '}
          <a href="/merchant/register" className="text-emerald-400 hover:text-emerald-300 underline">
            Create your account
          </a>
        </div>
      </div>
    </div>
  );
}
