/**
 * Query Cache Configuration — Sprint 4 Week 3 (T3.1)
 * Environment-driven cache settings
 */

export const CACHE_ENABLED = process.env.CACHE_ENABLED !== 'false';
export const CACHE_TTL_SECONDS = Math.max(
  60,
  parseInt(process.env.CACHE_TTL_SECONDS ?? '3600', 10) || 3600
);
export const CACHE_MAX_ENTRIES = Math.max(
  32,
  parseInt(process.env.CACHE_MAX_ENTRIES ?? '512', 10) || 512
);
export const CACHE_MAX_MBYTES = Math.max(
  10,
  parseInt(process.env.CACHE_MAX_MBYTES ?? '50', 10) || 50
);
