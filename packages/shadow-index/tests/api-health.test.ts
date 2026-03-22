import { describe, it, expect } from 'vitest';
import app from '../api/index.js';

describe('GET /health', () => {
  it('returns 200 with service metadata', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(['ok', 'degraded']).toContain(body.status);
    expect(body).toMatchObject({
      service: 'shadow-index',
      company: 'fairflow',
      version: '0.6.0',
    });
    expect(body.timestamp).toBeDefined();
  });
});
