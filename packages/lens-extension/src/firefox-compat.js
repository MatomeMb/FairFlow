/**
 * Firefox WebExtensions API Compatibility Layer
 *
 * Use this file ONLY if the extension fails to load or message passing breaks in Firefox.
 * Firefox 121+ typically provides chrome.* namespace for compatibility; this shim handles
 * edge cases where chrome is undefined or APIs behave differently.
 *
 * To enable: Add "src/firefox-compat.js" as the FIRST script in background and content_scripts
 * in manifest.json (or manifest_v2.json for Firefox).
 *
 * @see docs/MVP-13-CROSS-BROWSER.md
 * @see docs/FRIDAY-CROSS-BROWSER-SPRINT-ANALYSIS.md
 */
(function () {
  'use strict';

  // Firefox provides browser.* namespace; some builds may not alias chrome.*
  if (typeof globalThis.chrome === 'undefined' && typeof globalThis.browser !== 'undefined') {
    const b = globalThis.browser;

    // Create chrome namespace from browser (callback-style wrappers where needed)
    globalThis.chrome = {
      runtime: {
        sendMessage: function (msg, optionsOrCb, cb) {
          const callback = typeof optionsOrCb === 'function' ? optionsOrCb : cb;
          b.runtime.sendMessage(msg).then(
            (response) => {
              globalThis.chrome.runtime.lastError = null;
              callback && callback(response);
            },
            (err) => {
              globalThis.chrome.runtime.lastError = err;
              callback && callback(undefined);
            }
          );
        },
        onMessage: b.runtime.onMessage,
        onInstalled: b.runtime.onInstalled,
        lastError: null,
        getURL: b.runtime.getURL?.bind(b.runtime),
      },
      storage: {
        local: {
          get: function (keys, cb) {
            b.storage.local.get(keys).then(cb);
          },
          set: function (items, cb) {
            (cb ? b.storage.local.set(items).then(cb) : b.storage.local.set(items));
          },
        },
      },
    };
  }
})();
