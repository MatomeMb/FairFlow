# Manual E2E Smoke Test — Extension Overlay

Formal sign-off record for the "matter:// link resolves and overlay displays product info" test. Playwright cannot load the Chrome extension in standard mode, so this test is run manually. Use this document as an executable checklist.

---

## 1. Prerequisites

Run these commands so the environment is ready. Use separate terminals and leave them running.

- **Terminal 1:**  
  `cd packages/shadow-index && npm run start`

- **Terminal 2:**  
  `powershell scripts/start-demo-server.ps1`

- **Terminal 3 (Chrome):**  
  Open Chrome → go to `chrome://extensions` → turn **Developer mode** ON (top-right) → click **Load unpacked** → select the folder `packages/lens-extension`

---

## 2. Steps

1. Open a new Chrome tab.
2. Navigate to http://localhost:5177/matter-demo.html
3. Locate the matter:// link on the page.
4. Click it.
5. Wait up to 3 seconds for the overlay to appear.

---

## 3. Expected result

After step 5 you should see:

- An overlay card on top of the page.
- The card contains: a product image (above the title), a product title, a formatted price, and a **Buy Now** button.
- The overlay did not crash, show "Unable to load", or display a broken image.

---

## 4. Pass / Fail criteria

- **PASS:** All expected elements are present (image, title, price, Buy Now) and the overlay did not error.
- **FAIL:** Any expected element is missing, or the overlay crashed, showed "Unable to load", or showed a broken image.

---

## 5. Sign-off

| Sprint | Verified by | Date | Result |
|--------|-------------|------|--------|
| Sprint 1 | CTO / Senior dev | 2026-02-03 | PASS — Full flow verified: overlay displays image, title ($149.99), and Buy Now. Extension loaded; CORS and demo image (Picsum) confirmed. |
| Sprint 2 | CTO | 2026-02-03 | PASS — matter:// link overlay verified. Overlay displays image, title, price, and Buy Now button. No errors or broken images. |
