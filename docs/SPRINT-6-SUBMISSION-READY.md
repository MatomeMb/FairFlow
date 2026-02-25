# Sprint 6 — Chrome Web Store Submission Ready

**Date:** February 12, 2026  
**Status:** ALL BLOCKERS CLEARED ✅  
**Next Action:** Dashboard submission (CTO or authorized account holder)

---

## Submission Gate Checklist

| Item | Status | Evidence / Location |
|------|--------|-------------------|
| **Extension built** | ✅ DONE | `packages/lens-extension/dist/` |
| **Extension zipped** | ✅ DONE | `packages/lens-extension/extension-v0.3.0.zip` |
| **Icons (16x16, 48x48, 128x128)** | ✅ DONE | `packages/lens-extension/icons/` |
| **Short description (≤132 chars)** | ✅ DONE | `packages/lens-extension/store/description-short.txt` |
| **Full description** | ✅ DONE | `packages/lens-extension/store/description-full.md` |
| **Privacy policy (public HTTPS)** | ✅ DONE | https://storied-semolina-687067.netlify.app/privacy-policy.html |
| **Screenshots (4 captured, 1280x800)** | ✅ DONE | `packages/lens-extension/store/screenshots/` (4 files) |
| **Manifest.json (v3)** | ✅ DONE | `packages/lens-extension/src/manifest.json` |
| **Extension version (0.3.0)** | ✅ DONE | Ready as-is or bump to 1.0.0 if desired |
| **Permissions documented** | ✅ DONE | Privacy policy covers all host_permissions |

---

## What to Submit to Chrome Web Store

### Step 1: Create Developer Account
- Go to: https://chrome.google.com/webstore/devconsole
- Pay $5 one-time fee
- Verify email

### Step 2: Upload Package
- Click "New item" → Upload file
- Select: `packages/lens-extension/extension-v0.3.0.zip`
- Chrome will validate manifest, permissions, structure

### Step 3: Fill Store Listing

**Name:**
```
Lens - .things that Matter
```

**Category:**
```
Productivity
```

**Short description (≤132 chars):**
```
Compile products into matter:// URIs. Share, resolve, and interact 
with e-commerce via the Lens overlay in Chrome.
```
*(Source: packages/lens-extension/store/description-short.txt)*

**Full description:**
*(Copy entire content from packages/lens-extension/store/description-full.md)*

**Language:**
```
English (en)
```

**Privacy policy URL:**
```
https://storied-semolina-687067.netlify.app/privacy-policy.html
```

**Support email:**
```
[Your contact email]
```

### Step 4: Upload Assets

**Icons:**
- 128x128 px (required for store tile)
- 48x48 px (toolbar)
- 16x16 px (favicon)
- Source: `packages/lens-extension/icons/`

**Screenshots:**
Upload all 4 in order:
1. `screenshot-1-overlay.png` — Overlay with product data
2. `screenshot-2-landing.png` — Landing page
3. `screenshot-3-upload.png` — Catalog upload
4. `screenshot-4-demo.png` — Developer demo page

Location: `packages/lens-extension/store/screenshots/`

### Step 5: Set Visibility

Choose ONE:
- **Unlisted** (recommended for beta) — Only accessible via direct URL or email invite
- **Public** — Discoverable in Chrome Web Store search

*Recommendation: Start with Unlisted, promote to Public after 1–2 weeks of beta feedback.*

### Step 6: Submit for Review

Click "Submit for review" → Google will review within 1–3 business days.

---

## What to Do While Google Reviews (1–3 days)

1. Commit final changes:
   ```bash
   git add .
   git commit -m "feat: Sprint 6 submission ready (v0.3.0)"
   git push origin sprint-3-analytics-mvp-14
   ```

2. Tag release:
   ```bash
   git tag v0.6.3 -m "Sprint 6: Chrome Web Store submission"
   git push origin v0.6.3
   ```

3. Update PROGRESS-AND-VERSION.md:
   - Mark "Sprint 6: v0.3.0 submitted to Chrome Web Store"
   - Update next milestone to "v1.0 (store approval + beta 1-2 weeks)"

4. Begin immediate blockers for Sprint 7:
   - CEO sends first beta outreach emails (BETA-OUTREACH-TEMPLATE.md)
   - Update BETA-USER-LIST.md with response tracker

---

## Post-Approval Actions

Once Google approves:
1. Record store URL in PROGRESS-AND-VERSION.md
2. Update INSTALL-LENS.md with direct Chrome Web Store link
3. Send beta merchant onboarding emails with store link + instructions
4. Begin Sprint 7 feedback loop (BETA-FEEDBACK-TEMPLATE.md)

---

## Critical Dates

| Event | Date | Owner | Status |
|-------|------|-------|--------|
| Submission to Google | Feb 12, 2026 | CTO | ⏳ PENDING |
| Google review complete | Feb 13–15, 2026 | Google | ⏳ PENDING |
| First beta merchants invited | Feb 12–14, 2026 | CEO | ⏳ PENDING |
| Sprint 6 closure | Feb 26, 2026 | CTO | ⏳ PENDING |

---

## References

- [CHROME-WEB-STORE-CHECKLIST.md](./CHROME-WEB-STORE-CHECKLIST.md)
- [RELEASE-PROCESS-LENS.md](./RELEASE-PROCESS-LENS.md)
- [BETA-OUTREACH-TEMPLATE.md](./BETA-OUTREACH-TEMPLATE.md)
- [BETA-USER-LIST.md](./BETA-USER-LIST.md)
- [PROGRESS-AND-VERSION.md](./PROGRESS-AND-VERSION.md)

---

**Status:** Ready for CTO to proceed with Chrome Web Store dashboard submission.

*Document: SPRINT-6-SUBMISSION-READY.md*
