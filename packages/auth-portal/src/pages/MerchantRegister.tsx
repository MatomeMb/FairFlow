import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FairflowLogo } from "../components/FairflowLogo";

export function MerchantRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    business_name: "",
    email: "",
    password: "",
    confirm_password: "",
    terms_accepted: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  const validateForm = (): boolean => {
    if (!formData.business_name.trim()) {
      setError("Business name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!formData.password) {
      setError("Password is required");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match");
      return false;
    }
    if (!formData.terms_accepted) {
      setError("You must accept the terms and conditions");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${apiBase}/v1/auth/merchant/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: formData.business_name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      // Store token in memory (sessionStorage would also work, but memory is safer for this MVP)
      sessionStorage.setItem("merchantToken", data.token);

      // Redirect to merchant portal
      navigate("/dashboard/merchant");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
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
        <p className="text-stone-400 mb-8 text-sm">Create your merchant account</p>

        <a
          href={`${apiBase}/v1/auth/google`}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-stone-700 bg-stone-800 px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-700 min-h-[44px]"
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
          Continue with Google
        </a>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-700" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-stone-900 px-2 text-stone-500">or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-stone-300 text-sm font-medium mb-2">
              Business Name
            </label>
            <input
              type="text"
              placeholder="Your business name"
              value={formData.business_name}
              onChange={(e) =>
                setFormData({ ...formData, business_name: e.target.value })
              }
              className="w-full bg-stone-800 border border-stone-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-stone-300 text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-stone-800 border border-stone-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-stone-300 text-sm font-medium mb-2">
              Password (min 8 characters)
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full bg-stone-800 border border-stone-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-stone-300 text-sm font-medium mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={formData.confirm_password}
              onChange={(e) =>
                setFormData({ ...formData, confirm_password: e.target.value })
              }
              className="w-full bg-stone-800 border border-stone-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              checked={formData.terms_accepted}
              onChange={(e) =>
                setFormData({ ...formData, terms_accepted: e.target.checked })
              }
              className="mt-1 cursor-pointer"
            />
            <label htmlFor="terms" className="text-stone-400 text-sm">
              I accept the terms and conditions
            </label>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-700 text-white font-medium py-3 rounded-xl transition"
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center text-stone-400 text-sm">
          Already have an account?{" "}
          <Link to="/merchant/login" className="text-emerald-400 hover:text-emerald-300">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
