/**
 * Query Result Cache — Sprint 4 Week 3 (T3.1)
 * LRU in-memory cache for GET /v1/analytics/report responses
 * TTL, eviction, invalidation on event ingestion
 */

import type { ReportResult } from './analytics-report.js';
import { CACHE_ENABLED, CACHE_TTL_SECONDS, CACHE_MAX_ENTRIES, CACHE_MAX_MBYTES } from './cache-config.js';

export type QueryCacheKey = {
  from: string;
  to: string;
  groupBy: string;
  sortBy: string;
  limit: number;
  offset: number;
};

type CacheEntry = {
  result: ReportResult;
  expiresAt: number;
  sizeBytes: number;
};

/** Build deterministic cache key from query params */
export function buildCacheKey(params: QueryCacheKey): string {
  return `${params.from}|${params.to}|${params.groupBy}|${params.sortBy}|${params.limit}|${params.offset}`;
}

/** Rough size estimate of a ReportResult in bytes */
function estimateSize(result: ReportResult): number {
  return JSON.stringify(result).length * 2; // UTF-16
}

class QueryCache {
  private map = new Map<string, CacheEntry>();
  private lru: string[] = [];
  private hits = 0;
  private misses = 0;
  private evictions = 0;
  private totalSizeBytes = 0;

  get(key: string): ReportResult | null {
    if (!CACHE_ENABLED) return null;

    const entry = this.map.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }
    if (Date.now() >= entry.expiresAt) {
      this.remove(key);
      this.misses++;
      return null;
    }
    this.hits++;
    this.touch(key);
    return entry.result;
  }

  set(key: string, result: ReportResult): void {
    if (!CACHE_ENABLED) return;
    if (!result.ok) return; // Do not cache errors

    const sizeBytes = estimateSize(result);
    const expiresAt = Date.now() + CACHE_TTL_SECONDS * 1000;

    const maxBytes = CACHE_MAX_MBYTES * 1024 * 1024;
    while (
      (this.map.size >= CACHE_MAX_ENTRIES || this.totalSizeBytes + sizeBytes > maxBytes) &&
      this.lru.length > 0
    ) {
      const evictKey = this.lru.shift()!;
      const evicted = this.map.get(evictKey);
      if (evicted) {
        this.map.delete(evictKey);
        this.totalSizeBytes -= evicted.sizeBytes;
        this.evictions++;
      }
    }

    this.remove(key); // Replace if exists
    this.map.set(key, { result, expiresAt, sizeBytes });
    this.totalSizeBytes += sizeBytes;
    this.lru.push(key);
  }

  private touch(key: string): void {
    const idx = this.lru.indexOf(key);
    if (idx >= 0) {
      this.lru.splice(idx, 1);
      this.lru.push(key);
    }
  }

  private remove(key: string): void {
    const entry = this.map.get(key);
    if (entry) {
      this.map.delete(key);
      this.totalSizeBytes -= entry.sizeBytes;
      const idx = this.lru.indexOf(key);
      if (idx >= 0) this.lru.splice(idx, 1);
    }
  }

  invalidateAll(): void {
    this.map.clear();
    this.lru = [];
    this.totalSizeBytes = 0;
  }

  resetStats(): void {
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
  }

  getStats(): {
    enabled: boolean;
    hits: number;
    misses: number;
    evictions: number;
    entries: number;
    hitRate: number;
    sizeBytes: number;
  } {
    const total = this.hits + this.misses;
    return {
      enabled: CACHE_ENABLED,
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
      entries: this.map.size,
      hitRate: total > 0 ? this.hits / total : 0,
      sizeBytes: this.totalSizeBytes,
    };
  }
}

const cache = new QueryCache();

export function getCached(key: string): ReportResult | null {
  return cache.get(key);
}

export function setCached(key: string, result: ReportResult): void {
  cache.set(key, result);
}

export function invalidateCache(): void {
  cache.invalidateAll();
}

/** Reset cache and stats (for tests only) */
export function resetCacheForTesting(): void {
  cache.invalidateAll();
  cache.resetStats();
}

export function getCacheStats() {
  return cache.getStats();
}
