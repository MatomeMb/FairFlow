/** Bearer token must exactly match server-side ADMIN_SECRET_KEY */
export function validateAdminAuth(authHeader: string | undefined): boolean {
  const configuredSecret = process.env.ADMIN_SECRET_KEY;
  if (!configuredSecret || !authHeader) return false;
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  return token === configuredSecret;
}
