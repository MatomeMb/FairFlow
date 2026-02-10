import { describe, it, expect, vi } from 'vitest';
import app from './index';
import { promises as fs } from 'node:fs';

vi.mock('node:fs', () => ({
  promises: {
    appendFile: vi.fn().mockResolvedValue(undefined),
    mkdir: vi.fn().mockResolvedValue(undefined),
  }
}));

const BASE = 'http://localhost';

async function request(path: string, init?: RequestInit): Promise<Response> {
  return app.request(new Request(`${BASE}${path}`, init));
}

describe('POST /v1/analytics/event', () => {
  it('should accept a valid view event', async () => {
    const payload = {
      event: 'view',
      hash: 'abc1234567890123456789012345678901234567890123456789012345678901',
      timestamp: new Date().toISOString(),
      source_url: 'https://example.com/item'
    };

    const res = await request('/v1/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ ok: true });
    expect(fs.appendFile).toHaveBeenCalled();
  });

  it('should accept a valid click event', async () => {
    const payload = {
      event: 'click',
      hash: 'abc1234567890123456789012345678901234567890123456789012345678901',
      timestamp: new Date().toISOString(),
      source_url: 'https://example.com/item',
      target_action: 'checkout_initiated'
    };

    const res = await request('/v1/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ ok: true });
    expect(fs.appendFile).toHaveBeenCalled();
  });

  it('should reject an invalid event type', async () => {
    const payload = {
      event: 'hover', // Invalid type
      hash: 'abc1234567890123456789012345678901234567890123456789012345678901',
      timestamp: new Date().toISOString(),
      source_url: 'https://example.com/item'
    };

    const res = await request('/v1/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(400);
  });

  it('should reject an invalid hash length', async () => {
    const payload = {
      event: 'view',
      hash: 'too-short',
      timestamp: new Date().toISOString(),
      source_url: 'https://example.com/item'
    };

    const res = await request('/v1/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(400);
  });
});
