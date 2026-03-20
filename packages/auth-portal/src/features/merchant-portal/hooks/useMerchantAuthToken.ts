import { useCallback, useEffect, useState } from 'react';
import { shouldRefreshToken, setMerchantToken, clearMerchantToken } from '../../../lib/merchantTokenStorage';
import { apiBase } from '../../../lib/config';

const TOKEN_KEYS = ['merchantToken', 'merchant_token'] as const;

function getTokenFromStorage(storage: Storage): string | null {
  for (const key of TOKEN_KEYS) {
    const value = storage.getItem(key);
    if (value) return value;
  }
  return null;
}

function setTokenInStorage(storage: Storage, token: string): void {
  for (const key of TOKEN_KEYS) {
    storage.setItem(key, token);
  }
}

  const [token, setToken] = useState<string | null>(() =>
    getTokenFromStorage(sessionStorage) ?? getTokenFromStorage(localStorage)
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Attempt to refresh the token silently
  const refreshToken = useCallback(async (currentToken: string) => {
    if (isRefreshing) return; // Prevent multiple concurrent refresh attempts
    setIsRefreshing(true);

    try {
      const response = await fetch(`${apiBase}/v1/auth/merchant/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Refresh failed—likely expired or invalid. Clear token and redirect to login.
        clearMerchantToken();
        setToken(null);
        window.location.href = '/login?session=expired';
        return;
      }

      const data = await response.json();
      if (data.token) {
        setMerchantToken(data.token);
        setTokenInStorage(sessionStorage, data.token);
        setTokenInStorage(localStorage, data.token);
        setToken(data.token);
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      // On network error, don't clear the token—rely on it being invalid when it actually expires
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');

    if (urlToken) {
      setTokenInStorage(sessionStorage, urlToken);
      setTokenInStorage(localStorage, urlToken);
      setToken(urlToken);
      window.history.replaceState({}, '', '/dashboard/merchant');
      return;
    }

    const sessionToken = getTokenFromStorage(sessionStorage);
    if (sessionToken) {
      setToken(sessionToken);
      // Check if refresh is needed
      if (shouldRefreshToken(sessionToken)) {
        refreshToken(sessionToken);
      }
      return;
    }

    const localToken = getTokenFromStorage(localStorage);
    if (localToken) {
      setTokenInStorage(sessionStorage, localToken);
      setToken(localToken);
      // Check if refresh is needed
      if (shouldRefreshToken(localToken)) {
        refreshToken(localToken);
      }
      return;
    }

    setToken(null);
  }, [refreshToken]);

  const merchantFetch = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      if (!token) {
        return fetch(url, options); // No token, proceed without auth
      }

      // Check if token needs refreshing before making the request
      if (shouldRefreshToken(token)) {
        await refreshToken(token);
      }

      const headers: Record<string, string> = {
        ...(options.headers as Record<string, string> | undefined),
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      if (import.meta.env.VITE_API_KEY) {
        headers['x-api-key'] = import.meta.env.VITE_API_KEY;
      }

      return fetch(url, { ...options, headers });
    },
    [token, refreshToken]
  );

  return { token, merchantFetch };
}
