# Chrome Web Store Screenshot Guide

**Sprint 5 Week 2**  
**Purpose:** Capture screenshots for Lens extension store listing

---

## Requirements

| Size | Minimum | Recommended |
|------|---------|--------------|
| **Small** | 640 x 400 px | 1280 x 800 px |
| **Count** | 1 | 3–5 |

---

## Screenshots to Capture

| # | Scene | Steps |
|---|-------|-------|
| 1 | **Matter link click** | Open matter-demo.html; click matter:// link; capture overlay visible |
| 2 | **Product overlay** | Overlay showing title, price, image, Buy Now button |
| 3 | **Catalog upload** | catalog-upload.html with file selected and result displayed |
| 4 | **Landing page** | landing.html hero section |

---

## Capture Steps

1. Start demo: `npm run demo`
2. Install Lens (Load unpacked from packages/lens-extension dist)
3. Open http://localhost:5177/matter-demo.html
4. Click a matter:// link to trigger overlay
5. Use Chrome DevTools device toolbar (Ctrl+Shift+M) or full window
6. Screenshot: Win+Shift+S (Windows) or Cmd+Shift+4 (Mac) or browser extension
7. Crop to 1280x800 or 640x400
8. Save as PNG: `screenshot-1-overlay.png`, etc.

---

## File Location

Save screenshots to `packages/lens-extension/store/screenshots/` for submission.

---

## Privacy Policy URL

When demo is deployed: `https://your-domain/privacy-policy.html`

Local: `http://localhost:5177/privacy-policy.html`

---

*Document: SCREENSHOT-GUIDE.md. Sprint 5 Week 2.*
