# Sprint 2 Demo Recording Guide — Feb 19, 2026

**Purpose:** Practical steps for recording the Sprint 2 demo (video/screen capture).  
**Use case:** Async review, investor pitch, or documentation.

---

## Recording Setup

### Software
- **Windows:** OBS Studio, Xbox Game Bar (Win+G), or built-in Snipping Tool (video)
- **Alternative:** Loom, Otter.ai (with screen share)

### Tips
1. **Resolution:** 1920×1080 or 1280×720; avoid tiny text.
2. **Audio:** Optional narration; mute if demo is self-explanatory.
3. **Clean desktop:** Close unrelated tabs; use incognito/clean profile if needed.
4. **Full-screen browser:** Demo pages in focused tabs.

---

## Recording Checklist

- [ ] Shadow Index API running (localhost:3000)
- [ ] Demo server running (localhost:5178)
- [ ] Lens extension loaded and visible
- [ ] Browser console open (F12) — optional, to show [Lens Perf] / [Cache HIT] logs
- [ ] matter-demo.html pre-loaded with default hash
- [ ] sample-catalog.csv ready for catalog-upload

---

## Suggested Recording Flow (5–8 min)

1. **Intro** (30s): "Sprint 2 demo — matter:// resolution with IndexedDB caching."
2. **Matter URI** (2 min): Paste URI → click link → overlay appears. Second click → faster (cache).
3. **Console** (30s): Show [Lens Perf] and [Cache HIT] logs if visible.
4. **Catalog upload** (2 min): Upload CSV → compile → copy URI → paste in matter-demo → overlay.
5. **Outro** (30s): "Cross-browser validated; Sprint 2 closed. Tag v0.5.0."

---

## Post-Recording

- [ ] Save file: `sprint-2-demo-YYYYMMDD.mp4` (or similar)
- [ ] Optional: Upload to drive/share link for stakeholders
- [ ] Update [PROGRESS-AND-VERSION.md](./PROGRESS-AND-VERSION.md) if reference link added

---

*For live demo script, see [SPRINT-2-DEMO-SCRIPT.md](./SPRINT-2-DEMO-SCRIPT.md).*
