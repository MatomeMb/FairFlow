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

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await signInWithEmail(email, password);
      navigate("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = '/v1/auth/google';
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
          className="w-full flex items-center justify-center gap-3 bg-white text-stone-900 font-medium py-3 rounded-xl mb-6 hover:bg-stone-100 transition"
        >
          Sign in with Google
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-stone-800" />
          <span className="text-stone-600 text-xs">or</span>
          <div className="flex-1 h-px bg-stone-800" />
        </div>

        {/* Email/Password */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-stone-800 border border-stone-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-stone-800 border border-stone-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl transition"
          >
            Sign in
          </button>
        </form>

        <div className="mt-6 text-center text-stone-400 text-sm">
          Are you a merchant?{' '}
          <a href="/merchant/register" className="text-emerald-400 hover:text-emerald-300 underline">
            Create your account
          </a>
        </div>
      </div>
    </div>
  );
}
