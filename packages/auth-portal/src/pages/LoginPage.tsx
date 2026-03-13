import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FairflowLogo } from "../components/FairflowLogo";

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
      await signInWithEmail(email, password);
      navigate("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
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
        <div className="w-full max-w-md rounded-2xl border border-white/60 bg-white/70 p-8 shadow-[0_8px_40px_rgba(0,0,0,0.10)] backdrop-blur-xl animate-[ff-fade-up_0.4s_ease-out_both]">
          <div className="mb-2">
            <FairflowLogo markHeight={48} variant="light" />
          </div>
          <p className="mb-8 text-sm text-stone-500">Sign in to your portal</p>

          {/* Email/Password */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 px-4 py-3 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
              />
              <p className="mt-2 text-xs text-stone-500">Use full email format, e.g. name@fairflow.co.za</p>
            </div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 px-4 py-3 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-emerald-600 py-3 font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-stone-500">
            Are you a merchant?{' '}
            <a href="/merchant/login" className="text-emerald-600 hover:text-emerald-500 underline">
              Sign in here
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
