# Chrome Web Store Submission Checklist

**Sprint 5**  
**Purpose:** Pre-submission checklist for Lens extension  
**Reference:** [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)

---

## Required Assets

| Asset | Location | Status |
|-------|----------|--------|
| **Icons** | 128x128, 48x48, 16x16 px | [OK] packages/lens-extension/icons/ |
| **Screenshots** | 1280x800 or 640x400 (min 1) | [ ] Create |
| **Promotional tile** | 440x280 (small), 920x680 (marquee) | [ ] Optional |
| **Short description** | 132 chars max | [OK] store/description-short.txt |
| **Full description** | Detailed | [OK] store/description-full.md |
| **Privacy policy URL** | Hosted, publicly accessible | [ ] Host privacy-policy.html |

---

## Manifest and Metadata

| Item | Requirement | Status |
|------|-------------|--------|
| manifest.json | Manifest v3 | [OK] |
| version | Semver (e.g. 0.3.0) | [ ] Update for store |
| name | Extension name | [OK] "Lens - .things that Matter" |
| description | Matches store | [OK] |
| Permissions | Minimal; justified | [OK] storage, activeTab, scripting |
| host_permissions | Documented in privacy policy | [OK] |

---

## Pre-Submission Steps

1. [ ] Build production extension: `cd packages/lens-extension && npm run build`
2. [ ] Zip the `dist/` folder (or output directory)
3. [ ] Host privacy policy at a public URL (e.g. thingsthatmatter.com/privacy or GitHub Pages)
4. [ ] Create 1–5 screenshots showing extension in action
5. [ ] Create developer account ($5 one-time fee) if not exists
6. [ ] Upload zip and fill store listing
7. [ ] Submit for review (unlisted option available for beta)

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

---

*Document: CHROME-WEB-STORE-CHECKLIST.md. Sprint 5.*
