import { describe, it, expect, vi, beforeEach } from 'vitest';

/** In-memory stand-in for Supabase `merchant_accounts` — real project has no test DB in CI. */
const rows: Record<string, unknown>[] = [];

vi.mock('../api/db.js', () => ({
  db: {
    from: (table: string) => {
      if (table !== 'merchant_accounts') {
        return {
          select: () => ({
            order: () =>
              Promise.resolve({
                data: null,
                error: { message: `merchant-auth test mock: unexpected table ${table}` },
              }),
          }),
        };
      }
      const selectChain = () => ({
        order: () => Promise.resolve({ data: [...rows], error: null }),
        eq: (col: string, val: unknown) => ({
          maybeSingle: () => {
            const row = rows.find((r) => (r as Record<string, unknown>)[col] === val) ?? null;
            return Promise.resolve({ data: row, error: null });
          },
        }),
        ilike: (col: string, val: unknown) => ({
          maybeSingle: () => {
            const pattern = String(val).replace(/\\([\\%_])/g, '$1').toLowerCase();
            const row =
              rows.find((r) => String((r as Record<string, unknown>)[col]).toLowerCase() === pattern) ??
              null;
            return Promise.resolve({ data: row, error: null });
          },
        }),
      });
      return {
        select: () => selectChain(),
        upsert: (data: Record<string, unknown> | Record<string, unknown>[]) => {
          const list = Array.isArray(data) ? data : [data];
          for (const row of list) {
            const id = row.id as string;
            const idx = rows.findIndex((r) => (r as { id: string }).id === id);
            if (idx >= 0) rows[idx] = { ...rows[idx], ...row };
            else rows.push({ ...row });
          }
          return Promise.resolve({ error: null });
        },
      };
    },
  },
}));

import app from '../api/index.js';

describe('merchant auth flow', () => {
  const merchant = {
    business_name: 'Test Shop',
    email: `test-${Date.now()}@example.com`,
    password: 'securepassword123',
  };

  let authToken: string;

  beforeEach(() => {
    rows.length = 0;
  });

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
    const res = await app.request('/v1/auth/merchant/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(merchant),
    });
    expect(res.status).toBe(201);

    const res2 = await app.request('/v1/auth/merchant/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: merchant.email, password: merchant.password }),
    });
    expect(res2.status).toBe(200);

    const body = await res2.json();
    expect(body.token).toBeDefined();
    authToken = body.token;
  });

  it('GET /v1/auth/merchant/me returns the authenticated merchant', async () => {
    const reg = await app.request('/v1/auth/merchant/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(merchant),
    });
    expect(reg.status).toBe(201);
    const regBody = await reg.json();
    authToken = regBody.token;

    const res = await app.request('/v1/auth/merchant/me', {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.account.email).toBe(merchant.email.toLowerCase());
  });

  it('POST /v1/auth/merchant/login rejects wrong password', async () => {
    await app.request('/v1/auth/merchant/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(merchant),
    });

    const res = await app.request('/v1/auth/merchant/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: merchant.email, password: 'wrong' }),
    });
    expect(res.status).toBe(401);
  });

  it('POST /v1/auth/merchant/register rejects duplicate email', async () => {
    await app.request('/v1/auth/merchant/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(merchant),
    });

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
