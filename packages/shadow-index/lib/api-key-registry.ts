/**
 * API Key Registry — Sprint 4 Week 4 (T4.2)
 * Supports multiple valid keys and revocation.
 * When SHADOW_INDEX_API_KEY is set, it remains the primary key.
 * SHADOW_INDEX_API_KEYS (comma-separated) adds optional keys.
 * SHADOW_INDEX_REVOKED_KEYS (comma-separated) revokes keys immediately.
 */

const REVOKED_ENV = 'SHADOW_INDEX_REVOKED_KEYS';
const KEYS_ENV = 'SHADOW_INDEX_API_KEYS';

function getRevokedSet(): Set<string> {
  const val = process.env[REVOKED_ENV];
  if (!val?.trim()) return new Set();
  return new Set(val.split(',').map((k) => k.trim()).filter(Boolean));
}

function getValidKeys(): string[] {
  const primary = process.env.SHADOW_INDEX_API_KEY;
  const extra = process.env[KEYS_ENV];
  const keys: string[] = [];
  if (primary) keys.push(primary);
  if (extra?.trim()) {
    keys.push(...extra.split(',').map((k) => k.trim()).filter(Boolean));
  }
  return keys;
}

/** Check if API key is valid and not revoked */
export function isApiKeyValid(key: string | null | undefined): boolean {
  if (!key?.trim()) return false;
  const revoked = getRevokedSet();
  if (revoked.has(key)) return false;
  const valid = getValidKeys();
  if (valid.length === 0) return true; // No keys configured = open
  return valid.includes(key);
}

/** Get list of revoked key prefixes (for logging, not full keys) */
export function getRevokedCount(): number {
  return getRevokedSet().size;
}
