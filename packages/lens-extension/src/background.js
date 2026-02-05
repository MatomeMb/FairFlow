/**
 * Background Service Worker (MV3)
 *
 * - Handles resolve requests from content script with IndexedDB caching (MVP-13).
 * - Cache: store hash -> { gist, thing_url, image_url?, checkout_url?, fetchedAt }.
 */

const DB_NAME = 'lens-matter-cache';
const DB_VERSION = 1;
const STORE_NAME = 'resolve';
const DEFAULT_API_BASE = 'http://localhost:3000';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
      const cached = await cacheGet(hash);
      if (cached) {
        sendResponse({ ok: true, data: cached });
        return;
      }
      const baseUrl = await getApiBaseUrl();
      const data = await fetchResolve(baseUrl, hash);
      await cacheSet(hash, data);
      sendResponse({ ok: true, data });
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      sendResponse({ ok: false, error });
    }
  })();

  return true; // keep channel open for async sendResponse
});

chrome.runtime.onInstalled.addListener(() => {
  console.log('Lens extension installed');
});
