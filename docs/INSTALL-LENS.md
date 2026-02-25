# Install Lens Extension (Beta)

**Sprint 5**  
**Audience:** Beta users and developers

---

## Prerequisites

- Chrome 88 or later
- Node.js 18+ (for building)

---

## Build the Extension

```bash
cd packages/lens-extension
npm install
npm run build
```

Output is in `dist/` (or the configured output directory).

---

## Load in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `dist/` folder (or `packages/lens-extension` if no separate build output)
5. Verify "Lens - .things that Matter" appears

---

## Verify

1. Navigate to [Matter Demo](http://localhost:5177/matter-demo.html) (with API running)
2. Click a matter:// link
3. Overlay should display product info

---

## Production API

For production use, configure the extension to point to your deployed Shadow Index API. Default is localhost:3000 for development.

---

## Chrome Web Store

Lens will be published to the Chrome Web Store in a future sprint. Until then, use Load unpacked for beta access.

---

*Document: INSTALL-LENS.md. Sprint 5.*
