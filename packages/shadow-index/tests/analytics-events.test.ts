import { describe, it, expect } from 'vitest';
import app from '../api/index.js';

describe('analytics event ingestion', () => {
  const HASH = 'a'.repeat(64);

  it('POST /v1/analytics/event accepts a view event', async () => {
    const res = await app.request('/v1/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'view',
        hash: HASH,
        source_url: 'https://example.com/page',
      }),
    });
    expect(res.status).toBe(201);

    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  it('POST /v1/analytics/event accepts a click event', async () => {
    const res = await app.request('/v1/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'click',
        hash: HASH,
        source_url: 'https://example.com/page',
        target_action: 'checkout_initiated',
      }),
    });
    expect(res.status).toBe(201);
  });

  it('POST /v1/analytics/event rejects invalid event type', async () => {
    const res = await app.request('/v1/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'invalid',
        hash: HASH,
        source_url: 'https://example.com',
      }),
    });
    expect(res.status).toBe(400);
  });

  it('POST /v1/analytics/event rejects malformed hash', async () => {
    const res = await app.request('/v1/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'view',
        hash: 'not-a-valid-hash',
        source_url: 'https://example.com',
      }),
    });
    expect(res.status).toBe(400);
  });
});
