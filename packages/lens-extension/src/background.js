/**
 * Background Service Worker
 * 
 * Handles .thing file fetching, verification, and caching
 */

console.log('Lens extension background worker loaded');

// TODO: Implement .thing file fetching
// TODO: Implement Ed25519 signature verification (WASM)
// TODO: Implement IndexedDB caching
// TODO: Implement matter:// protocol handler

// Placeholder: Listen for extension install
chrome.runtime.onInstalled.addListener(() => {
  console.log('Lens extension installed');
});
