import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FairflowLogo } from "../../components/FairflowLogo";

type DiagnosticResult = {
  ok: boolean;
  status: number;
  errorCode?: string;
  message: string;
  probableCause: string;
};

function toProbableCause(errorCode?: string, message?: string): string {
  const msg = (message || "").toLowerCase();
  switch (errorCode) {
    case "invalid_credentials":
      return "Email exists but password is incorrect, or account does not exist in this Supabase project.";
    case "email_not_confirmed":
      return "Account exists but email confirmation is required before password login.";
    default:
      if (msg.includes("invalid login credentials")) {
        return "Email/password mismatch for this Supabase project.";
      }
      if (msg.includes("email not confirmed")) {
        return "Email confirmation pending in Supabase Auth.";
      }
      return "Unknown auth state. Check Supabase Auth users and logs.";
  }
}

export function AuthDiagnosticsPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);

  const supabaseUrl = useMemo(() => (import.meta.env.VITE_SUPABASE_URL || "").trim(), []);
  const supabaseAnonKey = useMemo(() => (import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim(), []);

  const runDiagnostic = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);

    if (!supabaseUrl || !supabaseAnonKey) {
      setResult({
        ok: false,
        status: 0,
        message: "Missing Supabase env vars in frontend build.",
        probableCause: "VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not configured.",
      });
      return;
    }

    if (!email.trim() || !password) {
      setResult({
        ok: false,
        status: 0,
        message: "Email and password are required.",
        probableCause: "Form validation",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: {
          apikey: supabaseAnonKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      let payload: Record<string, unknown> = {};
      try {
        payload = await res.json();
      } catch {
        payload = {};
      }

      const errorCode = typeof payload.error_code === "string" ? payload.error_code : undefined;
      const message =
        typeof payload.msg === "string"
          ? payload.msg
          : typeof payload.error_description === "string"
            ? payload.error_description
            : typeof payload.error === "string"
              ? payload.error
              : res.ok
                ? "Auth success"
                : "Auth failed";

      if (res.ok && typeof payload.access_token === "string") {
        setResult({
          ok: true,
          status: res.status,
          message: "Password auth success in current production Supabase project.",
          probableCause: "Credentials are valid for this environment.",
        });
      } else {
        setResult({
          ok: false,
          status: res.status,
          errorCode,
          message,
          probableCause: toProbableCause(errorCode, message),
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error";
      setResult({
        ok: false,
        status: 0,
        message,
        probableCause: "Browser could not reach Supabase auth endpoint.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--ff-bg)] px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-[var(--ff-border)] bg-white/80 p-4">
          <FairflowLogo markHeight={42} variant="light" />
          <button
            onClick={() => navigate("/dashboard/admin")}
            className="rounded-lg border border-[var(--ff-border)] px-3 py-2 text-sm text-[var(--ff-ink)] hover:bg-stone-100"
          >
            Back to Admin
          </button>
        </div>

        <div className="rounded-2xl border border-[var(--ff-border)] bg-white/80 p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-[var(--ff-ink)]">Auth Diagnostics</h1>
          <p className="mt-2 text-sm text-[var(--ff-ink-muted)]">
            Restricted tool for CTO/admin debugging. This tests Supabase password auth directly without changing your current portal session.
          </p>

          <form onSubmit={runDiagnostic} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm text-[var(--ff-ink-muted)]">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@fairflow.co.za"
                className="w-full rounded-xl border border-stone-200 px-4 py-3 text-stone-900 placeholder:text-stone-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-[var(--ff-ink-muted)]">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password to test"
                className="w-full rounded-xl border border-stone-200 px-4 py-3 text-stone-900 placeholder:text-stone-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-600 py-3 font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              {loading ? "Testing..." : "Run Auth Check"}
            </button>
          </form>

          {result && (
            <div
              className={`mt-6 rounded-xl border p-4 ${
                result.ok ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"
              }`}
            >
              <p className="text-sm text-[var(--ff-ink)]">
                <strong>Status:</strong> {result.ok ? "SUCCESS" : "FAILED"} (HTTP {result.status})
              </p>
              <p className="mt-1 text-sm text-[var(--ff-ink)]">
                <strong>Message:</strong> {result.message}
              </p>
              {result.errorCode && (
                <p className="mt-1 text-sm text-[var(--ff-ink)]">
                  <strong>Error code:</strong> {result.errorCode}
                </p>
              )}
              <p className="mt-1 text-sm text-[var(--ff-ink)]">
                <strong>Likely cause:</strong> {result.probableCause}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
