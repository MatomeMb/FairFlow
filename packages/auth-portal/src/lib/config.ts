export const apiBase =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "http://localhost:3000" : "https://api.fairflow.co.za");
export const apiKey = import.meta.env.VITE_API_KEY || "";

/**
 * Admin secret for KYC approval API calls.
 * 
 * CRITICAL: Must exactly match shadow-index ADMIN_SECRET_KEY environment variable.
 * In production, set VITE_ADMIN_SECRET to a strong random value (>32 chars).
 * 
 * ⚠️  Default value is for LOCAL DEVELOPMENT ONLY.
 * DO NOT use default 'mor-admin-secret-local' in production.
 * 
 * Generate production secret with: openssl rand -hex 16
 */
export const adminSecret =
  import.meta.env.VITE_ADMIN_SECRET || "mor-admin-secret-local";

/** Check if using default insecure secret. Warn admins if so. */
export const isUsingDefaultAdminSecret = adminSecret === "mor-admin-secret-local";