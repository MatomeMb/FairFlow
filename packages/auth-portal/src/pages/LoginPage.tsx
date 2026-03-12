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
    <div className="min-h-screen flex items-center justify-center bg-stone-950">
      <div className="w-full max-w-md p-8 bg-stone-900 rounded-2xl border border-stone-800">
        <div className="mb-2">
          <FairflowLogo markHeight={48} variant="dark" />
        </div>
        <p className="text-stone-400 mb-8 text-sm">Sign in to your portal</p>

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
          </div>
          <input
            type="password"
            placeholder="Password"
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

        <div className="mt-4 text-center text-stone-400 text-sm">
          Are you a merchant?{' '}
          <a href="/merchant/login" className="text-emerald-400 hover:text-emerald-300 underline">
            Sign in here
          </a>
        </div>
      </div>
    </div>
  );
}
