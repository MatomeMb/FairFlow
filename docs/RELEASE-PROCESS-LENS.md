# Lens Extension Release Process

**Project:** .things that Matter  
**Component:** `packages/lens-extension`  
**Purpose:** Standard, repeatable process for packaging and publishing release builds to Chrome Web Store.

---

## 1. Preconditions

- Working tree is clean or intentionally staged for release.
- `npm ci` completed at repo root.
- Chrome Web Store account access confirmed.
- Privacy policy public URL available and validated: https://storied-semolina-687067.netlify.app/privacy-policy.html

---

## 2. Version and Metadata Update

1. Update extension version in `packages/lens-extension/src/manifest.json` (SemVer).
2. Ensure store descriptions are current:
   - `packages/lens-extension/store/description-short.txt`
   - `packages/lens-extension/store/description-full.md`
3. Confirm icons and screenshots are present:
   - `packages/lens-extension/icons/`
   - `packages/lens-extension/store/screenshots/`

---

## 3. Build and Package

From repo root:

```bash
cd packages/lens-extension
npm run build
```

Create distributable zip (PowerShell example):

```powershell
Compress-Archive -Path dist\* -DestinationPath lens-extension.zip -Force
```

Expected output:
- `packages/lens-extension/dist/`
- `packages/lens-extension/lens-extension.zip`

---

## 4. Validation Checklist (Before Upload)

- [ ] Extension loads in Chrome (`chrome://extensions`, developer mode).
- [ ] `matter://` interception works in demo flow.
- [ ] Overlay renders title, price, image, and Buy action.
- [ ] No console errors in normal user path.
- [ ] Permissions match store disclosure and privacy policy.

---

## 5. Chrome Web Store Submission

1. Open Chrome Web Store Developer Dashboard.
2. Upload `lens-extension.zip`.
3. Update listing metadata (title, short/full description, category).
4. Upload screenshots and verify preview.
5. Set visibility (recommend: **Unlisted** for controlled beta).
6. Submit for review.
7. Record listing URL and submission timestamp in release notes.
8. Capture a dashboard screenshot showing submission state (Draft/Submitted/Published) and store it under `docs/assets/store-submission-status.png`.

---

## 6. Release Record and Tagging

1. Update release notes file (for example `docs/RELEASE-NOTES-v1.0.0.md`).
2. Update `docs/PROGRESS-AND-VERSION.md` with release status.
3. Create and push tag once release candidate is approved:

```bash
git tag v1.0.0
git push origin v1.0.0
```

---

## 7. Rollback / Hotfix Path

- If rejected by store review, fix issues and re-submit with incremented patch version.
- If critical defect is found post-publish:
  1. Reproduce and isolate root cause.
  2. Patch and rebuild.
  3. Re-upload package as update.
  4. Notify beta merchants and document impact.

---

## 8. Ownership

- **CTO:** Build, package, technical validation, issue remediation.
- **Product/CEO:** Listing quality, messaging, rollout visibility choice.

---

## Related Documents

- [CHROME-WEB-STORE-CHECKLIST.md](./CHROME-WEB-STORE-CHECKLIST.md)
- [INSTALL-LENS.md](./INSTALL-LENS.md)
- [SCREENSHOT-GUIDE.md](./SCREENSHOT-GUIDE.md)
- [RELEASE-GATE-SPRINT-6.md](./RELEASE-GATE-SPRINT-6.md)
