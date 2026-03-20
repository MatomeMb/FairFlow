import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FairflowLogo } from "../components/FairflowLogo";
import { supabase } from "../lib/supabase";

const ROLE_HOME: Record<string, string> = {
  ceo: "/dashboard/admin",
  cto: "/dashboard/admin",
  merchant: "/dashboard/merchant",
  investor: "/dashboard/investor",
  consumer: "/shop",
};

/** Safe in-app path only; role-checked for admin vs merchant. */
function postLoginPath(role: string, redirectParam: string | null): string {
  const home = ROLE_HOME[role] ?? "/shop";
  if (!redirectParam || !redirectParam.startsWith("/") || redirectParam.startsWith("//")) {
    return home;
  }
  const path = redirectParam.split("?")[0] ?? redirectParam;
  if (path.startsWith("/dashboard/admin") || path.startsWith("/dashboard/ceo") || path.startsWith("/dashboard/cto")) {
    if (role === "ceo" || role === "cto") return path;
    return home;
  }
  if (path.startsWith("/dashboard/merchant")) {
    if (role === "merchant") return path;
    return home;
  }
  if (path === "/dashboard") return home;
  if (path.startsWith("/dashboard")) return home;
  return home;
}

export function LoginPage() {
  const { signInWithEmail, role } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectParam = useMemo(() => searchParams.get("redirect"), [searchParams]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // After login, wait for the auth state to propagate the role, then navigate.
  useEffect(() => {
    if (loginSuccess && role) {
      navigate(postLoginPath(role, redirectParam), { replace: true });
    }
  }, [loginSuccess, role, navigate, redirectParam]);

  // If already logged in, redirect immediately.
  useEffect(() => {
    if (role) {
      navigate(postLoginPath(role, redirectParam), { replace: true });
    }
  }, [role, navigate, redirectParam]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signInWithEmail(email, password);
      setLoginSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      if (/invalid login credentials/i.test(message)) {
        setError("Invalid email or password. Use Forgot password if needed.");
      } else if (/email not confirmed/i.test(message)) {
        setError("Email not confirmed. Confirm the account in Supabase Auth.");
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMessage(null);
    setResetError(null);

    if (!email.trim()) {
      setResetError("Enter your email first, then request a reset link.");
      return;
    }

    setIsLoading(true);
    try {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/login`,
      });
      if (resetErr) throw resetErr;
      setResetMessage("Password reset link sent. Check your inbox.");
    } catch (err: unknown) {
      setResetError(err instanceof Error ? err.message : "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ff-grain relative min-h-screen overflow-hidden bg-[var(--ff-bg)]">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 12% 8%, var(--ff-accent-light) 0%, rgba(216,243,220,0) 36%), radial-gradient(circle at 88% 12%, rgba(183,121,31,0.12) 0%, rgba(183,121,31,0) 30%), linear-gradient(180deg, var(--ff-bg) 0%, var(--ff-surface) 100%)",
        }}
      />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[#1A2D42] p-8 shadow-[0_8px_40px_rgba(0,0,0,0.10)] backdrop-blur-xl animate-[ff-fade-up_0.4s_ease-out_both]">
          <div className="mb-2">
            <FairflowLogo markHeight={48} variant="light" />
          </div>
          <p className="mb-8 text-sm text-[#8A99AA]">Sign in to your portal</p>

          {/* Email/Password */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full rounded-xl border border-[rgba(255,255,255,0.10)] bg-[#1A2D42] text-white placeholder:text-[#8A99AA] px-4 py-3 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
              />
              <p className="mt-2 text-xs text-[#8A99AA]">Use full email format, e.g. name@fairflow.co.za</p>
            </div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-xl border border-[rgba(255,255,255,0.10)] bg-[#1A2D42] text-white placeholder:text-[#8A99AA] px-4 py-3 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
            />
            {error && <p className="text-[var(--ff-error)] text-sm">{error}</p>}
            {resetError && <p className="text-red-600 text-sm">{resetError}</p>}
            {resetMessage && <p className="text-emerald-700 text-sm">{resetMessage}</p>}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-[var(--ff-cta)] py-3 font-medium text-[var(--ff-on-accent)] transition hover:bg-[var(--ff-cta-hover)] disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-3 text-center text-sm">
            <button
              type="button"
              onClick={() => setShowForgotPassword((prev) => !prev)}
              disabled={isLoading}
              className="text-emerald-600 hover:text-emerald-500 underline disabled:opacity-50"
            >
              {showForgotPassword ? "Hide password reset" : "Forgot password?"}
            </button>
          </div>

          {showForgotPassword && (
            <form onSubmit={handleForgotPassword} className="mt-3 rounded-xl border border-[rgba(255,255,255,0.10)] bg-[#1A2D42] p-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg border border-[var(--ff-success)] bg-[var(--ff-success-subtle)] py-2 text-sm font-medium text-[var(--ff-success-bold)] hover:brightness-95 disabled:opacity-50"
              >
                {isLoading ? "Sending..." : "Send reset link to entered email"}
              </button>
            </form>
          )}

          <div className="mt-4 text-center text-sm text-[#8A99AA]">
            Are you a merchant?{' '}
            <a href="/merchant/login" className="text-[var(--ff-cta)] hover:text-[var(--ff-cta-hover)] underline">
              Sign in here
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
