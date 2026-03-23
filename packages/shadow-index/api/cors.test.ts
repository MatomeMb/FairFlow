import { describe, expect, it } from 'vitest';
import app from './index.js';

describe('CORS middleware', () => {
  const allowedOrigin = 'https://portal.fairflow.co.za';

  it('handles preflight OPTIONS with allow headers', async () => {
    const res = await app.request('/v1/merchant/orders', {
      method: 'OPTIONS',
      headers: {
        Origin: allowedOrigin,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'authorization,content-type',
      },
    });

    expect(res.status).toBe(204);
    expect(res.headers.get('access-control-allow-origin')).toBe(allowedOrigin);
    expect(res.headers.get('access-control-allow-credentials')).toBe('true');
    expect(res.headers.get('access-control-allow-methods')).toContain('OPTIONS');
    expect(res.headers.get('access-control-allow-headers')?.toLowerCase()).toContain('authorization');
  });

  it('includes CORS headers on normal responses', async () => {
    const res = await app.request('/health', {
      method: 'GET',
      headers: {
        Origin: allowedOrigin,
      },
    });

    expect(res.status).toBe(200);
    expect(res.headers.get('access-control-allow-origin')).toBe(allowedOrigin);
    expect(res.headers.get('access-control-expose-headers')).toContain('x-request-id');
  });

  it('rejects preflight from unallowed origin', async () => {
    const res = await app.request('/v1/merchant/orders', {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://evil.com',
        'Access-Control-Request-Method': 'GET',
      },
    });

    expect(res.status).toBe(403);
    expect(res.headers.get('access-control-allow-origin')).toBeNull();
  });
});
