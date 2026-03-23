import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'node:crypto';

const ensureOrder = vi.hoisted(() => vi.fn().mockResolvedValue({ id: 'order-1' }));

vi.mock('../api/services/paystack-order-flow.js', () => ({
  ensureOrderFromPaystackChargePayload: (...args: unknown[]) => ensureOrder(...args),
}));

import app from '../api/index.js';

function signPaystackBody(rawBody: string, secret: string): string {
  return crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
}

describe('POST /webhooks/paystack', () => {
  const secret = process.env.PAYSTACK_SECRET_KEY ?? '';

  beforeEach(() => {
    ensureOrder.mockClear();
  });

  it('returns 400 when x-paystack-signature header is missing', async () => {
    const raw = JSON.stringify({ event: 'charge.success', data: { reference: 'r1' } });
    const res = await app.request('/webhooks/paystack', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: raw,
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe('webhook_config_error');
  });

  it('returns 400 when HMAC signature does not match payload', async () => {
    const raw = JSON.stringify({ event: 'charge.success', data: { reference: 'r1' } });
    const res = await app.request('/webhooks/paystack', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-paystack-signature': '00'.repeat(32),
      },
      body: raw,
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe('webhook_signature_invalid');
  });

  it('returns 200 and forwards charge.success to order flow when signature is valid', async () => {
    const payload = {
      event: 'charge.success',
      data: {
        reference: 'paystack-ref-abc',
        metadata: JSON.stringify({ product_id: 'p1', merchant_id: 'm1' }),
        customer: { email: 'buyer@example.com' },
      },
    };
    const raw = JSON.stringify(payload);
    const sig = signPaystackBody(raw, secret);
    const res = await app.request('/webhooks/paystack', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-paystack-signature': sig,
      },
      body: raw,
    });
    expect(res.status).toBe(200);
    expect(ensureOrder).toHaveBeenCalledTimes(1);
    expect(ensureOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        reference: 'paystack-ref-abc',
        customer: { email: 'buyer@example.com' },
      }),
    );
  });

  it('accepts duplicate delivery with same signature twice (handler delegates idempotency to ensureOrder)', async () => {
    const payload = {
      event: 'charge.success',
      data: {
        reference: 'paystack-ref-dup',
        metadata: '{}',
        customer: { email: 'buyer@example.com' },
      },
    };
    const raw = JSON.stringify(payload);
    const sig = signPaystackBody(raw, secret);

    const req = () =>
      app.request('/webhooks/paystack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-paystack-signature': sig,
        },
        body: raw,
      });

    const r1 = await req();
    const r2 = await req();
    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);
    expect(ensureOrder).toHaveBeenCalledTimes(2);
  });
});
