const isProduction = process.env.NODE_ENV === 'production';

export const authPortalBaseUrl =
  process.env.AUTH_PORTAL_BASE_URL ??
  (isProduction
    ? (() => {
        throw new Error('AUTH_PORTAL_BASE_URL must be set in production');
      })()
    : 'http://localhost:5178');

export const publicApiBase =
  process.env.PUBLIC_API_BASE_URL ||
  (isProduction
    ? (() => {
        throw new Error('PUBLIC_API_BASE_URL must be set in production');
      })()
    : `http://localhost:${process.env.PORT || 3000}`);

export function getJwtSecret(): string {
  return (
    process.env.JWT_SECRET ??
    process.env.SHADOW_INDEX_API_KEY ??
    (isProduction
      ? (() => {
          throw new Error('JWT_SECRET or SHADOW_INDEX_API_KEY must be set in production');
        })()
      : 'dev-jwt-secret-change-me')
  );
}
