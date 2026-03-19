const KEY = 'merchantToken';

export const getMerchantToken = (): string | null =>
  sessionStorage.getItem(KEY) ?? localStorage.getItem(KEY);

export const setMerchantToken = (token: string): void => {
  sessionStorage.setItem(KEY, token);
};

export const clearMerchantToken = (): void => {
  sessionStorage.removeItem(KEY);
  localStorage.removeItem(KEY);
};

/**
 * Check if a JWT token should be refreshed.
 * Returns true if the token expires within 24 hours.
 * Returns false if token is invalid or expired.
 */
export const shouldRefreshToken = (token: string | null): boolean => {
  if (!token) return false;

  try {
    // Decode JWT payload (no verification needed here—we just check expiry)
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const payload = JSON.parse(atob(parts[1]));
    const exp = payload.exp;
    if (typeof exp !== 'number') return false;

    const expiryMs = exp * 1000;
    const nowMs = Date.now();
    const hoursUntilExpiry = (expiryMs - nowMs) / (1000 * 60 * 60);

    // Refresh if token expires within 24 hours
    return hoursUntilExpiry < 24 && hoursUntilExpiry > 0;
  } catch {
    // If decode fails, don't refresh
    return false;
  }
};
