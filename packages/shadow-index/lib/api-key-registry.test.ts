/**
 * API Key Registry — Sprint 4 Week 4 (T4.2) tests
 */
import { isApiKeyValid } from './api-key-registry.js';

describe('api-key-registry', () => {
  const savedKey = process.env.SHADOW_INDEX_API_KEY;
  const savedKeys = process.env.SHADOW_INDEX_API_KEYS;
  const savedRevoked = process.env.SHADOW_INDEX_REVOKED_KEYS;

  afterEach(() => {
    if (savedKey !== undefined) process.env.SHADOW_INDEX_API_KEY = savedKey;
    else delete process.env.SHADOW_INDEX_API_KEY;
    if (savedKeys !== undefined) process.env.SHADOW_INDEX_API_KEYS = savedKeys;
    else delete process.env.SHADOW_INDEX_API_KEYS;
    if (savedRevoked !== undefined) process.env.SHADOW_INDEX_REVOKED_KEYS = savedRevoked;
    else delete process.env.SHADOW_INDEX_REVOKED_KEYS;
  });

  it('returns true when no keys configured (open API), including missing key', () => {
    delete process.env.SHADOW_INDEX_API_KEY;
    delete process.env.SHADOW_INDEX_API_KEYS;
    expect(isApiKeyValid('any')).toBe(true);
    expect(isApiKeyValid(null)).toBe(true);
    expect(isApiKeyValid(undefined)).toBe(true);
  });

  it('returns false for null/empty when keys are configured', () => {
    process.env.SHADOW_INDEX_API_KEY = 'secret';
    expect(isApiKeyValid(null)).toBe(false);
    expect(isApiKeyValid('')).toBe(false);
  });

  it('accepts valid primary key', () => {
    process.env.SHADOW_INDEX_API_KEY = 'secret';
    expect(isApiKeyValid('secret')).toBe(true);
  });

  it('rejects invalid key', () => {
    process.env.SHADOW_INDEX_API_KEY = 'secret';
    expect(isApiKeyValid('wrong')).toBe(false);
  });

  it('rejects revoked key', () => {
    process.env.SHADOW_INDEX_API_KEY = 'secret';
    process.env.SHADOW_INDEX_REVOKED_KEYS = 'secret';
    expect(isApiKeyValid('secret')).toBe(false);
  });

  it('accepts key from SHADOW_INDEX_API_KEYS', () => {
    process.env.SHADOW_INDEX_API_KEY = 'primary';
    process.env.SHADOW_INDEX_API_KEYS = 'extra1,extra2';
    expect(isApiKeyValid('extra1')).toBe(true);
    expect(isApiKeyValid('extra2')).toBe(true);
  });
});
