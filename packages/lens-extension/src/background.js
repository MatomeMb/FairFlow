/**
 * Background Service Worker (MV3)
 *
 * - Handles resolve requests from content script with IndexedDB caching (MVP-13).
 * - Cache: store hash -> { gist, thing_url, image_url?, checkout_url?, fetchedAt }.
 * - Strategy: Cache-first reads (check cache before API), no writes yet (Wednesday sprint).
 */

const DB_NAME = 'lens-matter-cache';
const DB_VERSION = 1;
const STORE_NAME = 'resolve';
const DEFAULT_API_BASE = 'http://localhost:3000';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Logging helpers
const log = {
  cacheHit: (hash, ms = 0) => console.log(`[Cache HIT] Hash: ${hash}${ms ? ` (${ms}ms)` : ''}`),
  cacheMiss: (hash) => console.log(`[Cache MISS] Hash: ${hash}, proceeding to API`),
  cacheWrite: (hash, bytes, ms = 0) => console.log(`[Cache WRITE] Hash: ${hash} (${bytes} bytes${ms ? `, ${ms}ms` : ''})`),
  cacheWriteError: (hash, err) => console.error(`[Cache WRITE FAILED] Hash: ${hash}: ${err.message}`),
  apiError: (hash, status) => console.error(`[API ERROR] Hash: ${hash}: ${status}`),
  error: (msg) => console.error(`[Cache ERROR] ${msg}`),
  init: (msg) => console.log(`[Cache] ${msg}`),
};

/** @returns {Promise<IDBDatabase>} */
function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'hash' });
      }
    };
  });
}

/**
 * Get cached resolve payload for hash. Returns null if missing or stale (past TTL).
 * @param {string} hash
 * @returns {Promise<object|null>}
 */
async function cacheGet(hash) {
  const start = performance.now();
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(hash);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => {
      const row = req.result;
      if (!row) {
        resolve(null);
        return;
      }
      const fetchedAt = row.fetchedAt;
      if (typeof fetchedAt === 'number' && (Date.now() - fetchedAt) > CACHE_TTL_MS) {
        resolve(null);
        return;
      }
      const ms = Math.round(performance.now() - start);
      resolve(row);
    };
  });
}

/**
 * Store resolve payload in cache. Adds hash and fetchedAt if not present.
 * @param {string} hash
 * @param {object} value - Must include gist, thing_url; may include image_url, checkout_url.
 * @returns {Promise<void>}
 */
async function cacheSet(hash, value) {
  const db = await openDb();
  const entry = {
    ...value,
    hash,
    fetchedAt: value.fetchedAt ?? Date.now(),
  };
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(entry);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve();
  });
}

/**
 * Fetch resolve from Shadow Index API.
 * @param {string} baseUrl
 * @param {string} hash
 * @returns {Promise<object>} Resolve response body.
 */
async function fetchResolve(baseUrl, hash) {
  const url = `${baseUrl.replace(/\/$/, '')}/resolve/${encodeURIComponent(hash)}`;
  const res = await fetch(url);
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const message = (errBody && typeof errBody.message === 'string') ? errBody.message : `Resolve failed: ${res.status}`;
    throw new Error(message);
  }
  return res.json();
}

/**
 * Get API base URL from storage or default.
 * @returns {Promise<string>}
 */
async function getApiBaseUrl() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['shadow_index_base_url'], (items) => {
      const url = items.shadow_index_base_url;
      resolve(typeof url === 'string' && url.trim() ? url.trim() : DEFAULT_API_BASE);
    });
  });
}

/**
 * MVP-14: Send analytics event to Shadow Index API (fire-and-forget).
 * @param {string} baseUrl - API base URL
 * @param {object} payload - { event, hash, source_url, target_action? }
 */
function sendEvent(baseUrl, payload) {
  const url = `${baseUrl.replace(/\/$/, '')}/v1/analytics/event`;
  const body = {
    ...payload,
    timestamp: payload.timestamp || new Date().toISOString(),
  };
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => {}); // Fire-and-forget; ignore errors
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // MVP-14: Analytics event (fire-and-forget)
  if (message && message.type === 'analytics:event') {
    const { event, hash, source_url, target_action } = message.payload || {};
    if (event && hash && source_url) {
      getApiBaseUrl().then((baseUrl) => {
        sendEvent(baseUrl, { event, hash, source_url, target_action });
      });
    }
    sendResponse({ ok: true });
    return true;
  }

  if (!message || message.type !== 'resolve' || typeof message.hash !== 'string') {
    sendResponse({ ok: false, error: 'Invalid message' });
    return true;
  }

  const hash = message.hash.trim();
  if (!hash) {
    sendResponse({ ok: false, error: 'Missing hash' });
    return true;
  }

  (async () => {
    try {
      const start = performance.now();
      const cached = await cacheGet(hash);
      
      if (cached) {
        const ms = Math.round(performance.now() - start);
        log.cacheHit(hash, ms);
        sendResponse({ ok: true, data: cached });
        return;
      }
      
      log.cacheMiss(hash);
      const baseUrl = await getApiBaseUrl();
      const data = await fetchResolve(baseUrl, hash);
      
      // Wednesday: Cache write with error boundary
      const payloadSize = JSON.stringify(data).length;
      try {
        const writeStart = performance.now();
        await cacheSet(hash, data);
        const writeMs = Math.round(performance.now() - writeStart);
        log.cacheWrite(hash, payloadSize, writeMs);
      } catch (cacheErr) {
        log.cacheWriteError(hash, cacheErr);
        // Continue — API succeeded, cache write failed (graceful degradation)
      }
      
      sendResponse({ ok: true, data });
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      
      // Categorize error type for better logging
      if (e instanceof TypeError || e.message.includes('fetch') || e.message.includes('Resolve failed')) {
        const status = e.status || e.statusCode || 'NETWORK';
        log.apiError(hash, status);
      } else {
        log.error(error);
      }
      
      sendResponse({ ok: false, error });
    }
  })();

  return true; // keep channel open for async sendResponse
});

// Initialize cache on service worker startup
(async () => {
  try {
    await openDb();
    log.init('IndexedDB initialized successfully');
  } catch (e) {
    log.error(`Failed to initialize IndexedDB: ${e instanceof Error ? e.message : String(e)}`);
    // Continue anyway — service worker will work in degraded mode without cache
  }
})();

chrome.runtime.onInstalled.addListener(() => {
  console.log('Lens extension installed');
});
