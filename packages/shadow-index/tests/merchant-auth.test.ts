import { describe, it, expect } from 'vitest';
import app from '../api/index.js';

describe('merchant auth flow', () => {
  const merchant = {
    business_name: 'Test Shop',
    email: `test-${Date.now()}@example.com`,
    password: 'securepassword123',
  };

  let authToken: string;

  it('POST /v1/auth/merchant/register creates a merchant', async () => {
    const res = await app.request('/v1/auth/merchant/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(merchant),
    });
    expect(res.status).toBe(201);

    const body = await res.json();
    expect(body.account.email).toBe(merchant.email.toLowerCase());
    expect(body.token).toBeDefined();
    authToken = body.token;
  });

  it('POST /v1/auth/merchant/login returns a token', async () => {
    const res = await app.request('/v1/auth/merchant/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: merchant.email, password: merchant.password }),
    });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.token).toBeDefined();
    authToken = body.token;
  });

  it('GET /v1/auth/merchant/me returns the authenticated merchant', async () => {
    const res = await app.request('/v1/auth/merchant/me', {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.account.email).toBe(merchant.email.toLowerCase());
  });

  it('POST /v1/auth/merchant/login rejects wrong password', async () => {
    const res = await app.request('/v1/auth/merchant/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: merchant.email, password: 'wrong' }),
    });
    expect(res.status).toBe(401);
  });

  it('POST /v1/auth/merchant/register rejects duplicate email', async () => {
    const res = await app.request('/v1/auth/merchant/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(merchant),
    });
    expect(res.status).toBe(409);
  });

  it('POST /v1/auth/merchant/register validates input', async () => {
    const res = await app.request('/v1/auth/merchant/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ business_name: '', email: 'not-email', password: '123' }),
    });
    expect(res.status).toBe(400);
  });
});
