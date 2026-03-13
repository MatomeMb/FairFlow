/**
 * Per-worker test setup to keep env-dependent modules deterministic.
 * This runs before each test file is loaded.
 */
const setIfMissing = (key: string, value: string): void => {
  if (!process.env[key]) {
    process.env[key] = value;
  }
};

setIfMissing('NODE_ENV', 'test');
setIfMissing('SUPABASE_URL', 'https://example.supabase.co');
setIfMissing('SUPABASE_SERVICE_KEY', 'test-supabase-service-key');
setIfMissing('SHADOW_INDEX_API_KEY', 'test-shadow-index-api-key');
setIfMissing('JWT_SECRET', 'test-jwt-secret');
setIfMissing('ADMIN_SECRET_KEY', 'test-admin-secret');
setIfMissing('GOOGLE_CLIENT_ID', 'test-google-client-id');
setIfMissing('GOOGLE_CLIENT_SECRET', 'test-google-client-secret');
setIfMissing('GOOGLE_REDIRECT_URI', 'http://localhost:5178/auth/google/callback');
setIfMissing('AUTH_PORTAL_BASE_URL', 'http://localhost:5178');
setIfMissing('PAYSTACK_SECRET_KEY', 'test-paystack-secret-key');
