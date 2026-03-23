import { useState, useEffect, useRef, useCallback } from 'react';
import {
  consumeOAuthHandoffToStorage,
  getMerchantToken,
  setMerchantToken,
  clearMerchantToken,
} from '../../../lib/merchantTokenStorage';
import { apiBase } from '../../../lib/config';
const REFRESH_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours

function getTokenExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

function shouldRefresh(token: string): boolean {
  const expiry = getTokenExpiry(token);
  if (!expiry) return false;
  return expiry - Date.now() < REFRESH_THRESHOLD_MS && expiry > Date.now();
}

export function useMerchantAuthToken() {
  const [token, setToken] = useState<string | null>(() =>
    getMerchantToken()
  );
  const isRefreshing = useRef(false);

  useEffect(() => {
    const handoff = consumeOAuthHandoffToStorage();
    if (handoff) setToken(handoff);
  }, []);

  const refreshToken = useCallback(async (currentToken: string) => {
    if (isRefreshing.current) return;
    isRefreshing.current = true;
    try {
      const res = await fetch(`${apiBase}/v1/auth/merchant/refresh`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.token) {
          setMerchantToken(data.token);
          setToken(data.token);
        }
      } else {
        clearMerchantToken();
        setToken(null);
      }
    } catch {
      // network error — keep existing token
    } finally {
      isRefreshing.current = false;
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    if (shouldRefresh(token)) {
      void refreshToken(token);
    }
  }, [token, refreshToken]);

  const merchantFetch = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      const currentToken = token ?? getMerchantToken();
      const headers = new Headers(options.headers);
      if (currentToken) {
        headers.set('Authorization', `Bearer ${currentToken}`);
      }
      return fetch(url, { ...options, headers });
    },
    [token]
  );

  const signOut = useCallback(() => {
    clearMerchantToken();
    setToken(null);
  }, []);

  return { token, merchantFetch, signOut };
}
