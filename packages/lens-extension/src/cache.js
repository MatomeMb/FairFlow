/**
 * IndexedDB Cache Module for Lens Extension (MVP-13)
 * 
 * Provides client-side caching of resolve responses to reduce API latency,
 * minimize rate-limit consumption, and support offline access to recently
 * viewed products.
 * 
 * Cache Behavior:
 * - Cache-on-read: Check cache before API call (AC1)
 * - Cache-on-success: Store successful API responses (AC2)
 * - No cache on error: Failed requests are not cached (AC3)
 * - TTL enforcement: Entries >24h are treated as misses (AC4)
 * - Overlay unchanged: Cached data produces identical output (AC5)
 * - Isolation: IndexedDB storage in service worker context (AC6)
 */

// Configuration constants
const DB_NAME = 'lens-matter-cache';
const DB_VERSION = 1;
const STORE_NAME = 'resolve';
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// IndexedDB reference
let db = null;

/**
 * Initialize IndexedDB database and create object store if needed.
 * Safe to call multiple times (idempotent). Resolves when DB is ready.
 * 
 * @returns {Promise<void>}
 * @throws {Error} If IndexedDB is unavailable or quota exceeded
 * 
 * @example
 * await cacheInit();
 * console.log('Cache initialized');
 */
export async function cacheInit() {
  return new Promise((resolve, reject) => {
    if (db) {
      // Already initialized
      resolve();
      return;
    }

    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onerror = () => {
      const error = new Error(`Failed to open IndexedDB: ${req.error?.message || 'unknown error'}`);
      console.error('[cache] Init failed:', error);
      reject(error);
    };

    req.onsuccess = () => {
      db = req.result;
      resolve();
    };

    req.onupgradeneeded = (evt) => {
      const database = evt.target.result;
      
      // Create object store if it doesn't exist
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'hash' });
      }
    };
  });
}

/**
 * Retrieve cached entry by hash. Returns null if not found or stale.
 * TTL validation: entries older than 24 hours are treated as misses.
 * 
 * @param {string} hash - SHA-256 hash of the .thing object
 * @returns {Promise<?Object>} Cache entry object or null if miss/stale
 * @throws {Error} If database transaction fails
 * 
 * Entry shape:
 * {
 *   hash: string,
 *   gist: { title, price, currency, image_url? },
 *   thing_url: string,
 *   image_url?: string,
 *   checkout_url?: string,
 *   fetchedAt: number (Unix timestamp ms)
 * }
 * 
 * @example
 * const entry = await cacheGet('1a5f37...');
 * if (entry) {
 *   console.log(entry.gist.title); // Use cached data
 * }
 */
export async function cacheGet(hash) {
  if (!hash || typeof hash !== 'string') {
    console.warn('[cache] Invalid hash for get:', hash);
    return null;
  }

  if (!db) {
    console.warn('[cache] Database not initialized; call cacheInit() first');
    return null;
  }

  return new Promise((resolve) => {
    try {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.get(hash);

      req.onsuccess = () => {
        const entry = req.result;

        // Check if entry exists
        if (!entry) {
          resolve(null);
          return;
        }

        // Check TTL: if older than 24h, treat as miss
        const ageMs = Date.now() - entry.fetchedAt;
        if (ageMs > TTL_MS) {
          resolve(null);
          return;
        }

        resolve(entry);
      };

      req.onerror = () => {
        console.error('[cache] Get failed for hash:', hash, req.error);
        resolve(null);
      };
    } catch (err) {
      console.error('[cache] Get exception:', err);
      resolve(null);
    }
  });
}

/**
 * Store cache entry in IndexedDB. Automatically injects timestamp.
 * Validates that gist has required fields before storing.
 * 
 * @param {string} hash - SHA-256 hash (primary key)
 * @param {Object} value - Entry data (without fetchedAt; auto-injected)
 * @param {Object} value.gist - Required: { title, price, currency, image_url? }
 * @param {string} value.thing_url - Required: URL to .thing file
 * @param {string} value.image_url - Optional: Product image URL
 * @param {string} value.checkout_url - Optional: Buy Now target
 * @returns {Promise<void>}
 * @throws {TypeError} If gist lacks required fields (title, price)
 * @throws {Error} If database transaction fails
 * 
 * @example
 * await cacheSet('1a5f37...', {
 *   gist: { title: 'Product', price: 1999, currency: 'USD' },
 *   thing_url: 'http://localhost:3000/thing/1a5f37...'
 * });
 */
export async function cacheSet(hash, value) {
  // Validate inputs
  if (!hash || typeof hash !== 'string') {
    throw new TypeError('Hash must be a non-empty string');
  }

  if (!value || typeof value !== 'object') {
    throw new TypeError('Value must be an object');
  }

  if (!value.gist || typeof value.gist !== 'object') {
    throw new TypeError('Value.gist must be an object');
  }

  if (!value.gist.title || !value.gist.price) {
    throw new TypeError('Value.gist must have title and price');
  }

  if (!value.thing_url || typeof value.thing_url !== 'string') {
    throw new TypeError('Value.thing_url is required');
  }

  if (!db) {
    throw new Error('Database not initialized; call cacheInit() first');
  }

  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      // Create entry with auto-injected timestamp
      const entry = {
        ...value,
        hash,
        fetchedAt: Date.now(),
      };

      const req = store.put(entry);

      req.onsuccess = () => {
        resolve();
      };

      req.onerror = () => {
        const error = new Error(`Failed to set cache for ${hash}: ${req.error?.message || 'unknown error'}`);
        console.error('[cache] Set failed:', error);
        reject(error);
      };
    } catch (err) {
      console.error('[cache] Set exception:', err);
      reject(err);
    }
  });
}

/**
 * Delete a single cache entry by hash.
 * 
 * @param {string} hash - SHA-256 hash of the .thing object
 * @returns {Promise<void>}
 * @throws {Error} If database transaction fails
 * 
 * @example
 * await cacheDelete('1a5f37...');
 */
export async function cacheDelete(hash) {
  if (!hash || typeof hash !== 'string') {
    throw new TypeError('Hash must be a non-empty string');
  }

  if (!db) {
    throw new Error('Database not initialized; call cacheInit() first');
  }

  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.delete(hash);

      req.onsuccess = () => {
        resolve();
      };

      req.onerror = () => {
        const error = new Error(`Failed to delete cache for ${hash}`);
        console.error('[cache] Delete failed:', error);
        reject(error);
      };
    } catch (err) {
      console.error('[cache] Delete exception:', err);
      reject(err);
    }
  });
}

/**
 * Clear entire cache store. Used for testing and debugging.
 * Does not delete the database itself, only clears all entries.
 * 
 * @returns {Promise<void>}
 * @throws {Error} If database transaction fails
 * 
 * @example
 * await cacheClear();
 * console.log('Cache cleared');
 */
export async function cacheClear() {
  if (!db) {
    // If DB never initialized, nothing to clear
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.clear();

      req.onsuccess = () => {
        resolve();
      };

      req.onerror = () => {
        const error = new Error('Failed to clear cache');
        console.error('[cache] Clear failed:', error);
        reject(error);
      };
    } catch (err) {
      console.error('[cache] Clear exception:', err);
      reject(err);
    }
  });
}

export default {
  cacheInit,
  cacheGet,
  cacheSet,
  cacheDelete,
  cacheClear,
};
