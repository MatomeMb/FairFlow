import { beforeAll, describe, expect, it, vi } from 'vitest';
import { Hono } from 'hono';

describe('rate-limit abuse protection on public endpoints', () => {
  const app = new Hono();

  beforeAll(async () => {
    process.env.RATE_LIMIT_WINDOW_MS = '60000';
    process.env.RATE_LIMIT_MAX = '2';
    vi.resetModules();
    const { rateLimitMiddleware } = await import('../api/middleware/rateLimit.js');
    app.use('*', rateLimitMiddleware);
    app.post('/v1/auth/merchant/login', (c) => c.json({ ok: true }));
    app.post('/checkout/create-session', (c) => c.json({ ok: true }));
    app.post('/webhooks/paystack', (c) => c.json({ ok: true }));
  });

  async function post(path: string, ip: string): Promise<Response> {
    return app.request(path, {
      method: 'POST',
      headers: {
        'x-forwarded-for': ip,
        'content-type': 'application/json',
      },
      body: '{}',
    });
  }

  it('blocks repeated auth requests from same IP', async () => {
    const ip = '198.51.100.10';
    expect((await post('/v1/auth/merchant/login', ip)).status).toBe(200);
    expect((await post('/v1/auth/merchant/login', ip)).status).toBe(200);
    expect((await post('/v1/auth/merchant/login', ip)).status).toBe(429);
  });

  it('blocks repeated checkout requests from same IP', async () => {
    const ip = '198.51.100.11';
    expect((await post('/checkout/create-session', ip)).status).toBe(200);
    expect((await post('/checkout/create-session', ip)).status).toBe(200);
    expect((await post('/checkout/create-session', ip)).status).toBe(429);
  });

  it('blocks repeated webhook deliveries from same IP', async () => {
    const ip = '198.51.100.12';
    expect((await post('/webhooks/paystack', ip)).status).toBe(200);
    expect((await post('/webhooks/paystack', ip)).status).toBe(200);
    expect((await post('/webhooks/paystack', ip)).status).toBe(429);
  });
});
