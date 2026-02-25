/**
 * MVP-14: Analytics event ingestion tests
 * POST /v1/analytics/event — view and click events
 */

import app from './index';

const BASE = 'http://localhost';

async function request(path: string, init?: RequestInit): Promise<Response> {
  return app.request(new Request(`${BASE}${path}`, init));
}

type ErrorResponse = { code?: string; message?: string; details?: unknown; [k: string]: unknown };

describe('POST /v1/analytics/event (MVP-14)', () => {
  const validHash = 'bfefe5574ca167f98378ef37a123ed07bf00f6bd622c2283e19ac3fbd598ba96';

  it('valid view event → 201', async () => {
    const res = await request('/v1/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'view',
        hash: validHash,
        source_url: 'https://example.com/catalog',
      }),
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as { ok?: boolean };
    expect(body.ok).toBe(true);
  });

  it('valid click event → 201', async () => {
    const res = await request('/v1/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'click',
        hash: validHash,
        source_url: 'https://example.com/catalog',
        target_action: 'checkout_initiated',
      }),
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as { ok?: boolean };
    expect(body.ok).toBe(true);
  });

  it('invalid event type → 400', async () => {
    const res = await request('/v1/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'invalid',
        hash: validHash,
        source_url: 'https://example.com/catalog',
      }),
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as ErrorResponse;
    expect(body.code).toBe('invalid_event');
  });

  it('invalid hash (wrong length) → 400', async () => {
    const res = await request('/v1/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'view',
        hash: 'short',
        source_url: 'https://example.com/catalog',
      }),
    });
    expect(res.status).toBe(400);
  });
});
