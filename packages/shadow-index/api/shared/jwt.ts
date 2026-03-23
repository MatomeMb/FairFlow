import crypto from 'node:crypto';
import type { MerchantAccount } from './merchant-types.js';

export type JwtPayload = Record<string, unknown>;

const base64UrlEncode = (input: Buffer | string): string => {
  const source = typeof input === 'string' ? Buffer.from(input, 'utf8') : input;
  return source.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
};

const base64UrlDecode = (input: string): Buffer => {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + padding, 'base64');
};

const hmacSha256 = (value: string, secret: string): string =>
  base64UrlEncode(crypto.createHmac('sha256', secret).update(value).digest());

export const signJwt = (payload: Record<string, unknown>, secret: string): string => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${headerB64}.${payloadB64}`;
  const signature = hmacSha256(signingInput, secret);
  return `${signingInput}.${signature}`;
};

/** Canonical JWT verify (HS256) — single implementation for shadow-index + merchant-products */
export const verifyJwt = (token: string, secret: string): JwtPayload | null => {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, signatureB64] = parts;
  const signingInput = `${headerB64}.${payloadB64}`;
  const expected = hmacSha256(signingInput, secret);

  const providedBuf = Buffer.from(signatureB64, 'utf8');
  const expectedBuf = Buffer.from(expected, 'utf8');
  if (providedBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(providedBuf, expectedBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(payloadB64).toString('utf8')) as JwtPayload;
    const exp = payload.exp;
    if (typeof exp === 'number' && Date.now() >= exp * 1000) return null;
    return payload;
  } catch {
    return null;
  }
};

export function issueMerchantToken(account: MerchantAccount, jwtSecret: string): string {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const payload = {
    sub: account.id,
    email: account.email,
    role: 'merchant',
    typ: 'merchant_auth',
    iat: nowSeconds,
    exp: nowSeconds + 60 * 60 * 24 * 7,
  };
  return signJwt(payload, jwtSecret);
}

/** True if JWT expires within 24h but is still valid now (client refresh hint). */
export function shouldRefreshToken(token: string, secret: string): boolean {
  const payload = verifyJwt(token, secret);
  if (!payload) return false;
  const exp = payload.exp;
  if (typeof exp !== 'number') return false;
  const expiryMs = exp * 1000;
  const now = Date.now();
  const hoursLeft = (expiryMs - now) / (1000 * 60 * 60);
  return hoursLeft < 24 && hoursLeft > 0;
}
