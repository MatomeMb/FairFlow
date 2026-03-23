import { describe, it, expect, vi, beforeEach } from 'vitest';

const supabaseState = vi.hoisted(() => ({
  user: { id: 'staff-user-1' } as { id: string } | null,
  userError: null as { message: string } | null,
  roles: [] as { role: string }[],
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      getUser: () =>
        Promise.resolve({
          data: { user: supabaseState.user },
          error: supabaseState.userError,
        }),
    },
    from: (table: string) => {
      if (table !== 'user_roles') {
        return {
          select: () => ({
            eq: () => Promise.resolve({ data: [], error: null }),
          }),
        };
      }
      return {
        select: () => ({
          eq: () => Promise.resolve({ data: supabaseState.roles, error: null }),
        }),
      };
    },
  }),
}));

vi.mock('../api/services/admin-kyc-service.js', () => ({
  getPendingKycSubmissions: vi.fn().mockResolvedValue({
    ok: true,
    pending: [{ id: 'm1', business_name: 'Test Co', email: 'm@example.com', kyc_status: 'pending' }],
    count: 1,
    pagination: { page: 1, limit: 20, total: 1, pages: 1 },
  }),
}));

import app from '../api/index.js';
import { getPendingKycSubmissions } from '../api/services/admin-kyc-service.js';

describe('GET /v1/admin-proxy/kyc/pending', () => {
  beforeEach(() => {
    supabaseState.user = { id: 'staff-user-1' };
    supabaseState.userError = null;
    supabaseState.roles = [];
    vi.mocked(getPendingKycSubmissions).mockClear();
  });

  it('returns 403 when no Authorization header is provided', async () => {
    const res = await app.request('/v1/admin-proxy/kyc/pending');
    expect(res.status).toBe(403);
  });

  it('returns 403 when Authorization is not a valid Supabase session', async () => {
    supabaseState.user = null;
    supabaseState.userError = { message: 'Invalid JWT' };
    const res = await app.request('/v1/admin-proxy/kyc/pending', {
      headers: { Authorization: 'Bearer not-a-real-supabase-jwt' },
    });
    expect(res.status).toBe(403);
  });

  it('returns 403 when the user is not ceo or cto', async () => {
    supabaseState.user = { id: 'staff-user-1' };
    supabaseState.userError = null;
    supabaseState.roles = [{ role: 'merchant' }];
    const res = await app.request('/v1/admin-proxy/kyc/pending', {
      headers: { Authorization: 'Bearer fake-but-valid-shaped-token' },
    });
    expect(res.status).toBe(403);
  });

  it('returns 200 with pending KYC payload when caller has ceo role', async () => {
    supabaseState.user = { id: 'staff-user-1' };
    supabaseState.userError = null;
    supabaseState.roles = [{ role: 'ceo' }];
    const res = await app.request('/v1/admin-proxy/kyc/pending?page=1&limit=20', {
      headers: { Authorization: 'Bearer fake-but-valid-shaped-token' },
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok?: boolean; pending?: unknown[] };
    expect(body.ok).toBe(true);
    expect(Array.isArray(body.pending)).toBe(true);
    expect(getPendingKycSubmissions).toHaveBeenCalled();
  });
});
