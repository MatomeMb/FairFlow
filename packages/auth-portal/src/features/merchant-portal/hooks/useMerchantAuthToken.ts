import { useCallback, useEffect, useState } from 'react';

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

export function useMerchantAuthToken() {
  const [token, setToken] = useState<string | null>(null);

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
      return;
    }

    const localToken = getTokenFromStorage(localStorage);
    if (localToken) {
      setTokenInStorage(sessionStorage, localToken);
      setToken(localToken);
      return;
    }

    setToken(null);
  }, []);

  const merchantFetch = useCallback(
    (url: string, options: RequestInit = {}): Promise<Response> => {
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
    [token]
  );

  return { token, merchantFetch };
}
