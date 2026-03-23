const KEY = 'merchantToken';
const OAUTH_COOKIE = 'ff_merchant_oauth';

function readCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return m?.[1] ?? null;
}

function clearOAuthCookie(): void {
  if (typeof document === 'undefined') return;
  const domain = (import.meta.env.VITE_MERCHANT_OAUTH_COOKIE_DOMAIN as string | undefined)?.trim();
  const base = `${OAUTH_COOKIE}=; Path=/; Max-Age=0`;
  if (domain) {
    document.cookie = `${base}; Domain=${domain}; Secure`;
  }
  document.cookie = base;
}

/** True if OAuth may still deliver a token (URL or short-lived cookie) before sessionStorage is populated. */
export const hasPendingMerchantOAuthHandoff = (): boolean => {
  if (typeof window === 'undefined') return false;
  if (getMerchantToken()) return false;
  if (new URLSearchParams(window.location.search).get('token')) return true;
  const hs = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
  if (new URLSearchParams(hs).get('token')) return true;
  return document.cookie.split(';').some((c) => c.trim().startsWith(`${OAUTH_COOKIE}=`));
};

/** Move token from OAuth cookie or URL into sessionStorage (call once on app load). */
export const consumeOAuthHandoffToStorage = (): string | null => {
  if (typeof window === 'undefined') return null;
  if (getMerchantToken()) return null;

  const rawCookie = readCookieValue(OAUTH_COOKIE);
  if (rawCookie) {
    clearOAuthCookie();
    try {
      const t = decodeURIComponent(rawCookie);
      setMerchantToken(t);
      return t;
    } catch {
      return null;
    }
  }

  const q = new URLSearchParams(window.location.search).get('token');
  if (q) {
    const url = new URL(window.location.href);
    url.searchParams.delete('token');
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    setMerchantToken(q);
    return q;
  }

  const hs = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
  const ht = new URLSearchParams(hs).get('token');
  if (ht) {
    window.history.replaceState({}, '', `${window.location.pathname}${window.location.search}`);
    setMerchantToken(ht);
    return ht;
  }

  return null;
};

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
