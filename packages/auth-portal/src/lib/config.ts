export const apiBase =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "http://localhost:3000" : "https://api.fairflow.co.za");
export const apiKey = import.meta.env.VITE_API_KEY || "";
/** Admin secret for KYC approval API calls. Must match shadow-index ADMIN_SECRET_KEY. */
export const adminSecret =
  import.meta.env.VITE_ADMIN_SECRET || "mor-admin-secret-local";