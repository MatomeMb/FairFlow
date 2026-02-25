# Chrome Web Store Submission Checklist

**Sprint 5**  
**Purpose:** Pre-submission checklist for Lens extension  
**Reference:** [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)

---

## Required Assets

| Asset | Location | Status |
|-------|----------|--------|
| **Icons** | 128x128, 48x48, 16x16 px | [OK] packages/lens-extension/icons/ |
| **Screenshots** | 1280x800 or 640x400 (min 1) | [OK] 4 screenshots captured: overlay, landing, upload, demo |
| **Promotional tile** | 440x280 (small), 920x680 (marquee) | [ ] Optional |
| **Short description** | 132 chars max | [OK] store/description-short.txt |
| **Full description** | Detailed | [OK] store/description-full.md |
| **Privacy policy URL** | Hosted, publicly accessible | [OK] https://storied-semolina-687067.netlify.app/privacy-policy.html |

---

## Manifest and Metadata

| Item | Requirement | Status |
|------|-------------|--------|
| manifest.json | Manifest v3 | [OK] |
| version | Semver (e.g. 0.3.0) | [OK] 0.3.0 (bump optional before publish) |
| name | Extension name | [OK] "Lens - .things that Matter" |
| description | Matches store | [OK] |
| Permissions | Minimal; justified | [OK] storage, activeTab, scripting |
| host_permissions | Documented in privacy policy | [OK] |

---

## Pre-Submission Steps

1. [x] Build production extension: `cd packages/lens-extension && npm run build`
2. [x] Zip the `dist/` folder (or output directory) (`extension-v0.3.0.zip`)
3. [x] Host privacy policy at a public URL (Netlify: https://storied-semolina-687067.netlify.app/privacy-policy.html)
4. [x] Create 1–5 screenshots showing extension in action
5. [ ] Create developer account ($5 one-time fee) if not exists
6. [ ] Upload zip and fill store listing
7. [ ] Submit for review (unlisted option available for beta)

---

## Sprint 6 Execution Log (Feb 12, 2026)

| Item | State | Evidence |
|------|-------|----------|
| Build package | Done | `packages/lens-extension/dist/` |
| Zip package | Done | `packages/lens-extension/extension-v0.3.0.zip` |
| Screenshot folder | Ready | `packages/lens-extension/store/screenshots/` — 4 files captured |
| Public privacy URL | Done | https://storied-semolina-687067.netlify.app/privacy-policy.html |
| Submission status | Pending | Chrome Developer Dashboard action required |

---

## Post-Submission

| Step | Action |
|------|--------|
| Review | Chrome typically reviews within 1–3 business days |
| Unlisted | Use unlisted for beta to limit visibility |
| Update | Use same package ID for updates; bump version |

---

## References

- [Chrome Web Store publishing](https://developer.chrome.com/docs/webstore/publish/)
- [Manifest v3 migration](https://developer.chrome.com/docs/extensions/mv3/)
- [store/](./packages/lens-extension/store/) — Description and privacy policy drafts
- [SCREENSHOT-GUIDE.md](./SCREENSHOT-GUIDE.md) — Screenshot capture steps and dimensions

---

*Document: CHROME-WEB-STORE-CHECKLIST.md. Sprint 5.*
