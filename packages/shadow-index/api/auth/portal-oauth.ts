import crypto from 'node:crypto';
import { signJwt, verifyJwt } from '../shared/jwt.js';
import { authPortalBaseUrl, getJwtSecret } from '../shared/runtime-config.js';

export const normalizePortalBaseUrl = (baseUrl: string): string =>
  baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

export const inferPortalBaseUrl = (c: { req: { header: (name: string) => string | undefined } }): string => {
  const explicit = c.req.header('x-auth-portal-base-url');
  if (explicit) {
    try {
      const parsed = new URL(explicit);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.origin;
      }
    } catch {
      // ignore invalid override
    }
  }

  const referer = c.req.header('referer');
  if (referer) {
    try {
      const parsed = new URL(referer);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.origin;
      }
    } catch {
      // ignore invalid referer
    }
  }

  return authPortalBaseUrl;
};

export const buildPortalUrl = (pathName: string, params?: Record<string, string>, portalBaseUrl?: string): string => {
  const baseUrl = normalizePortalBaseUrl(portalBaseUrl ?? authPortalBaseUrl);
  const target = new URL(pathName, baseUrl);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      target.searchParams.set(key, value);
    }
  }
  return target.toString();
};

export const extractBearerToken = (authHeader: string | undefined): string | null => {
  if (!authHeader) return null;
  if (!authHeader.startsWith('Bearer ')) return null;
  return authHeader.slice(7).trim() || null;
};

export const getGoogleOAuthConfig = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const redirectUri = process.env.GOOGLE_REDIRECT_URI?.trim();
  if (!clientId || !clientSecret || !redirectUri) return null;
  return { clientId, clientSecret, redirectUri };
};

export const exchangeGoogleCode = async (
  code: string,
  config: { clientId: string; clientSecret: string; redirectUri: string }
): Promise<{ access_token?: string } | null> => {
  const body = new URLSearchParams({
    code,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.redirectUri,
    grant_type: 'authorization_code',
  });

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => 'unable to read error body');
    console.error('[OAuth] Token exchange failed:', response.status, errBody);
    return null;
  }
  return (await response.json()) as { access_token?: string };
};

export const fetchGoogleProfile = async (accessToken: string): Promise<{ email?: string; name?: string } | null> => {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) return null;
  return (await response.json()) as { email?: string; name?: string };
};

export const buildGoogleState = (portalBaseUrl: string): string => {
  const nowSeconds = Math.floor(Date.now() / 1000);
  return signJwt(
    {
      typ: 'google_oauth_state',
      nonce: crypto.randomUUID(),
      return_to: portalBaseUrl,
      iat: nowSeconds,
      exp: nowSeconds + 60 * 10,
    },
    getJwtSecret()
  );
};

export const parseGoogleState = (state: string | null): Record<string, unknown> | null => {
  if (!state) return null;
  const payload = verifyJwt(state, getJwtSecret());
  if (payload?.typ !== 'google_oauth_state') return null;
  return payload;
};
