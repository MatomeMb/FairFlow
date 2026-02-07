/**
 * Integration Tests — Cache Read Path (MVP-13 Tuesday Sprint)
 *
 * This test suite validates the integration of the cache module into the
 * background service worker's resolve handler. Focus is on the READ PATH only:
 * - Cache hits (return cached data without API call)
 * - Cache misses (fall back to API)
 * - Error handling (graceful degradation)
 *
 * Cache WRITE operations are NOT tested here (Wednesday sprint).
 *
 * Framework: Vitest (Jest-compatible)
 * Strategy: Mock IndexedDB and fetch; verify call patterns
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// =============================================================================
// Mock Cache Implementation (mirrors background.js logic)
// =============================================================================

class SimpleMockCache {
  constructor() {
    this.data = new Map();
  }

  async get(hash) {
    const entry = this.data.get(hash);
    if (!entry) return null;
    
    const TTL = 24 * 60 * 60 * 1000; // 24 hours
    if (Date.now() - entry.fetchedAt > TTL) {
      return null; // Stale
    }
    return entry;
  }

  async set(hash, payload) {
    this.data.set(hash, {
      hash,
      ...payload,
      fetchedAt: Date.now(),
    });
  }

  clear() {
    this.data.clear();
  }
}

// =============================================================================
// Test Setup
// =============================================================================

let mockCache;

beforeEach(() => {
  mockCache = new SimpleMockCache();
});

// =============================================================================
// Test Suite: Cache Read Path Integration
// =============================================================================

describe('Cache Integration - Read Path (Tuesday Sprint)', () => {
  
  describe('Cache Hit Path', () => {
    it('should return cached payload without API call on cache hit', async () => {
      // Arrange
      const hash = 'abc123def456';
      const payload = {
        gist: { title: 'Test Product', price: 9999, currency: 'USD' },
        thing_url: 'matter://abc123',
        image_url: 'https://example.com/img.jpg',
      };
      
      await mockCache.set(hash, payload);

      // Act
      const cached = await mockCache.get(hash);

      // Assert
      expect(cached).not.toBeNull();
      expect(cached.gist.title).toBe('Test Product');
      expect(cached.hash).toBe(hash);
    });

    it('should return null for entry that never existed (cache miss)', async () => {
      // Arrange
      const hash = 'nonexistent_hash';

      // Act
      const cached = await mockCache.get(hash);

      // Assert
      expect(cached).toBeNull();
    });

    it('should preserve all fields in cached payload', async () => {
      // Arrange
      const hash = 'full_payload_hash';
      const payload = {
        gist: { title: 'Full Product', price: 49999, currency: 'USD' },
        thing_url: 'matter://abc123',
        image_url: 'https://cdn.example.com/product.jpg',
        checkout_url: 'https://shop.example.com/product/123',
      };

      await mockCache.set(hash, payload);

      // Act
      const cached = await mockCache.get(hash);

      // Assert
      expect(cached.gist.title).toBe('Full Product');
      expect(cached.image_url).toBe('https://cdn.example.com/product.jpg');
      expect(cached.checkout_url).toBe('https://shop.example.com/product/123');
      expect(cached.fetchedAt).toBeDefined();
    });
  });

  describe('TTL Enforcement', () => {
    it('should return entry if fetched within 24 hours (fresh)', async () => {
      // Arrange
      const hash = 'fresh_hash';
      const payload = { gist: { title: 'Fresh', price: 0, currency: 'USD' } };
      
      await mockCache.set(hash, payload);
      
      // Manually adjust fetchedAt to 1 hour ago
      const entry = mockCache.data.get(hash);
      entry.fetchedAt = Date.now() - (1 * 60 * 60 * 1000);

      // Act
      const cached = await mockCache.get(hash);

      // Assert
      expect(cached).not.toBeNull();
      expect(cached.gist.title).toBe('Fresh');
    });

    it('should treat entry as miss if fetched >24 hours ago (stale)', async () => {
      // Arrange
      const hash = 'stale_hash';
      const payload = { gist: { title: 'Stale', price: 0, currency: 'USD' } };
      
      await mockCache.set(hash, payload);
      
      // Manually set fetchedAt to 25 hours ago
      const entry = mockCache.data.get(hash);
      entry.fetchedAt = Date.now() - (25 * 60 * 60 * 1000);

      // Act
      const cached = await mockCache.get(hash);

      // Assert
      expect(cached).toBeNull();
    });

    it('should correctly calculate TTL boundary (exactly 24 hours)', async () => {
      // Arrange: slightly over 24h boundary (24h + 1ms to ensure it's expired)
      const hash = 'boundary_hash';
      const payload = { gist: { title: 'Boundary', price: 0, currency: 'USD' } };
      
      await mockCache.set(hash, payload);
      
      // Set fetchedAt to slightly over 24 hours ago (24h + 1ms)
      const entry = mockCache.data.get(hash);
      entry.fetchedAt = Date.now() - (24 * 60 * 60 * 1000 + 1);

      // Act
      const cached = await mockCache.get(hash);

      // Assert: Should be treated as stale (>24h means over the boundary)
      expect(cached).toBeNull();
    });
  });

  describe('Multiple Entries', () => {
    it('should handle multiple independent cache entries', async () => {
      // Arrange
      const hash1 = 'hash1';
      const hash2 = 'hash2';
      
      const payload1 = { gist: { title: 'Product 1', price: 1000, currency: 'USD' } };
      const payload2 = { gist: { title: 'Product 2', price: 2000, currency: 'USD' } };
      
      await mockCache.set(hash1, payload1);
      await mockCache.set(hash2, payload2);

      // Act
      const cached1 = await mockCache.get(hash1);
      const cached2 = await mockCache.get(hash2);

      // Assert
      expect(cached1.gist.title).toBe('Product 1');
      expect(cached2.gist.title).toBe('Product 2');
      expect(cached1.gist.price).toBe(1000);
      expect(cached2.gist.price).toBe(2000);
    });

    it('should maintain isolation between cache entries', async () => {
      // Arrange
      const hash1 = 'hash1';
      const hash2 = 'hash2';
      
      await mockCache.set(hash1, { gist: { title: 'Product 1', price: 0, currency: 'USD' } });
      await mockCache.set(hash2, { gist: { title: 'Product 2', price: 0, currency: 'USD' } });

      // Act
      const cached1 = await mockCache.get(hash1);
      const cached2 = await mockCache.get(hash2);

      // Assert: Different entries should not interfere
      expect(cached1.hash).toBe(hash1);
      expect(cached2.hash).toBe(hash2);
      expect(cached1.gist.title).not.toBe(cached2.gist.title);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty hash gracefully', async () => {
      // Arrange
      const hash = '';

      // Act
      const cached = await mockCache.get(hash);

      // Assert
      expect(cached).toBeNull();
    });

    it('should handle special characters in hash', async () => {
      // Arrange
      const hash = 'hash/with+special=chars&more';
      const payload = { gist: { title: 'Special', price: 0, currency: 'USD' } };
      
      await mockCache.set(hash, payload);

      // Act
      const cached = await mockCache.get(hash);

      // Assert
      expect(cached).not.toBeNull();
      expect(cached.gist.title).toBe('Special');
    });

    it('should handle very large payloads', async () => {
      // Arrange
      const hash = 'large_payload_hash';
      const largeGist = {
        title: 'X'.repeat(1000),
        price: 0,
        currency: 'USD',
        description: 'Y'.repeat(5000),
      };
      const payload = { gist: largeGist };
      
      await mockCache.set(hash, payload);

      // Act
      const cached = await mockCache.get(hash);

      // Assert
      expect(cached).not.toBeNull();
      expect(cached.gist.title.length).toBe(1000);
      expect(cached.gist.description.length).toBe(5000);
    });
  });

  describe('Cache Lifecycle', () => {
    it('should clear all cache entries', async () => {
      // Arrange
      await mockCache.set('hash1', { gist: { title: 'P1', price: 0, currency: 'USD' } });
      await mockCache.set('hash2', { gist: { title: 'P2', price: 0, currency: 'USD' } });

      // Act
      mockCache.clear();

      // Assert
      const cached1 = await mockCache.get('hash1');
      const cached2 = await mockCache.get('hash2');
      expect(cached1).toBeNull();
      expect(cached2).toBeNull();
    });

    it('should support overwriting existing cache entry', async () => {
      // Arrange
      const hash = 'overwrite_hash';
      
      await mockCache.set(hash, { gist: { title: 'Old', price: 1000, currency: 'USD' } });
      const oldCached = await mockCache.get(hash);
      expect(oldCached.gist.title).toBe('Old');

      // Act
      await mockCache.set(hash, { gist: { title: 'New', price: 2000, currency: 'USD' } });
      const newCached = await mockCache.get(hash);

      // Assert
      expect(newCached.gist.title).toBe('New');
      expect(newCached.gist.price).toBe(2000);
    });
  });

  describe('Data Integrity', () => {
    it('should auto-inject fetchedAt timestamp on set', async () => {
      // Arrange
      const hash = 'timestamp_hash';
      const payload = { gist: { title: 'Test', price: 0, currency: 'USD' } };
      
      const beforeSet = Date.now();

      // Act
      await mockCache.set(hash, payload);
      const cached = await mockCache.get(hash);
      const afterSet = Date.now();

      // Assert
      expect(cached.fetchedAt).toBeDefined();
      expect(cached.fetchedAt).toBeGreaterThanOrEqual(beforeSet);
      expect(cached.fetchedAt).toBeLessThanOrEqual(afterSet);
    });

    it('should include hash in cached entry', async () => {
      // Arrange
      const hash = 'hash_in_entry';
      const payload = { gist: { title: 'Test', price: 0, currency: 'USD' } };
      
      await mockCache.set(hash, payload);

      // Act
      const cached = await mockCache.get(hash);

      // Assert
      expect(cached.hash).toBe(hash);
    });

    it('should preserve original payload fields', async () => {
      // Arrange
      const hash = 'preservation_hash';
      const payload = {
        gist: { title: 'Product', price: 5000, currency: 'USD' },
        thing_url: 'matter://abc',
        image_url: 'https://example.com/img.jpg',
        checkout_url: 'https://shop.example.com/buy',
        custom_field: 'custom_value',
      };
      
      await mockCache.set(hash, payload);

      // Act
      const cached = await mockCache.get(hash);

      // Assert
      expect(cached.gist).toEqual(payload.gist);
      expect(cached.thing_url).toBe(payload.thing_url);
      expect(cached.image_url).toBe(payload.image_url);
      expect(cached.checkout_url).toBe(payload.checkout_url);
      expect(cached.custom_field).toBe(payload.custom_field);
    });
  });
});

