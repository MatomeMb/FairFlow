# Phase 0 Platform Testing - Step-by-Step Walkthrough

This guide will walk you through testing steganography survival across platforms.

---

## Prerequisites Checklist

Before starting, ensure you have:
- [x] Test .thing file created (`test_data/test_thing.bin`)
- [ ] Test product image (JPEG or PNG, minimum 500x500px)
- [x] Testing tools compiled and working
- [x] Test directories created

---

## Step 1: Prepare Your Test Image

### Option A: Use an Existing Image

1. Find any product image on your computer (JPEG or PNG)
2. Copy it to `test_data/` directory
3. Rename it to `test_product.jpg` (or keep original name)

### Option B: Download a Test Image

1. Go to https://unsplash.com/s/photos/product
2. Download any product image
3. Save it to `test_data/test_product.jpg`

### Option C: Use a Simple Test Image

You can create a simple colored square using any image editor (Paint, GIMP, etc.)
- Size: 500x500 pixels minimum
- Format: JPEG or PNG
- Save as: `test_data/test_product.jpg`

**Once you have your image, proceed to Step 2.**

---

## Step 2: Generate Test Polyglot Images

This creates images with embedded commerce data (XMP + EOF layers).

### Run the Command

```powershell
cd packages\matter-core
cargo run --bin platform-test -- create-test-images ..\..\test_data\test_product.jpg ..\..\test_data\test_thing.bin ..\..\test_output\
```

### What This Does

1. Reads your test product image
2. Embeds XMP metadata (Layer A - hash + gist)
3. Appends .thing binary to EOF (Layer B - full data)
4. Creates polyglot images in `test_output/`:
   - `test_jpeg_polyglot.jpg` - JPEG with embedded data
   - `test_png_polyglot.png` - PNG with embedded data (if original was PNG)
   - `test_manifest.json` - Test metadata for reference

### Verify Success

- Check that `test_output/` directory contains the files
- Open the polyglot images - they should display normally
- Note the file sizes (should be slightly larger than originals)

---

## Step 3: Test on Your First Platform

Let's start with **Discord** (high priority, likely to preserve metadata).

### 3.1 Upload to Discord

1. Open Discord (web or desktop app)
2. Go to any server or DM
3. Upload `test_output/test_jpeg_polyglot.jpg`
4. Wait for upload to complete
5. **Note:** If Discord shows any compression warnings, document it

### 3.2 Download from Discord

1. Right-click on the uploaded image in Discord
2. Click "Save Image" or "Download"
3. Save it as: `test_output/discord_jpeg_downloaded.jpg`
4. **Important:** Save it in the `test_output/` directory

### 3.3 Test Extraction

Run the extraction test:

```powershell
cd packages\matter-core
cargo run --bin platform-test -- test-extraction ..\..\test_output\discord_jpeg_downloaded.jpg
```

### 3.4 Record Results

Create or update `test_output/platform_test_results.json`:

```json
{
  "test_date": "2026-01-27",
  "platforms": [
    {
      "name": "Discord",
      "test_date": "2026-01-27",
      "format": "JPEG",
      "xmp_survives": true,
      "eof_survives": true,
      "file_size_original": 245678,
      "file_size_downloaded": 245678,
      "image_quality_changed": false,
      "notes": "Full polyglot works perfectly",
      "test_image": "discord_jpeg_downloaded.jpg"
    }
  ]
}
```

**Fill in the actual values from your test!**

---

## Step 4: Test Additional Platforms

Repeat Step 3 for each platform. Here's the recommended order:

### Priority 1: High-Value Platforms (Test First)
1. Discord (just completed)
2. Telegram
3. Email (Gmail)
4. Email (Outlook)
5. Direct Download (baseline - should always work)

### Priority 2: Social Media
6. Twitter/X
7. Instagram
8. Facebook
9. LinkedIn
10. Reddit

### Priority 3: Messaging
11. WhatsApp
12. Signal
13. Slack
14. Microsoft Teams

### Priority 4: Storage
15. Google Drive
16. Dropbox
17. OneDrive
18. GitHub

---

## Step 5: Document Each Test

For each platform, record:

1. **Platform Name**
2. **Test Date**
3. **Format** (JPEG/PNG)
4. **XMP Survives** (true/false)
5. **EOF Survives** (true/false)
6. **File Size Original** (bytes)
7. **File Size Downloaded** (bytes)
8. **Image Quality Changed** (true/false)
9. **Notes** (any observations)
10. **Test Image Filename**

### Example Entry

```json
{
  "name": "Twitter/X",
  "test_date": "2026-01-27",
  "format": "JPEG",
  "xmp_survives": false,
  "eof_survives": false,
  "file_size_original": 245678,
  "file_size_downloaded": 198234,
  "image_quality_changed": true,
  "notes": "Both XMP and EOF stripped, image recompressed. Use matter:// URI instead.",
  "test_image": "twitter_jpeg_downloaded.jpg"
}
```

---

## Step 6: Calculate Survival Rates

After testing all platforms, calculate:

### XMP Survival Rate
```
(Number of platforms where XMP survived / Total platforms tested) × 100
```

### EOF Survival Rate
```
(Number of platforms where EOF survived / Total platforms tested) × 100
```

### Full Polyglot Survival Rate
```
(Number of platforms where BOTH survived / Total platforms tested) × 100
```

### Example Calculation

If you tested 20 platforms:
- XMP survived on 12 platforms → 60% survival rate
- EOF survived on 8 platforms → 40% survival rate
- Both survived on 7 platforms → 35% survival rate

---

## Step 7: Generate Report

Once all testing is complete:

```powershell
cd packages\matter-core
cargo run --bin platform-test -- generate-report ..\..\test_output\platform_test_results.json
```

This will generate a summary report with:
- Survival rates
- Platform-by-platform breakdown
- Recommendations

---

## Step 8: Make Go/No-Go Decision

Based on survival rates:

| Survival Rate | Decision | Action |
|---------------|----------|--------|
| ≥70% | **GO** | Full steganography approach |
| 50-69% | **HYBRID** | Steg + matter:// URIs |
| <50% | **PIVOT** | matter:// as primary |

Document your decision in `docs/PHASE0_DECISION.md`.

---

## Troubleshooting

### Issue: Extraction test fails

**Check:**
1. Did you download the image correctly?
2. Is the file path correct?
3. Did the platform strip the metadata? (This is expected for some platforms)

**Solution:** This is normal for platforms that strip metadata. Record it as "survives: false".

### Issue: Can't find test image

**Check:**
1. Is the image in `test_data/` directory?
2. Is the filename correct?
3. Is it a valid JPEG or PNG?

**Solution:** Verify file exists and is a valid image format.

### Issue: Polyglot image doesn't display

**Check:**
1. Did the embedding process complete?
2. Check file size (should be larger than original)
3. Try opening in different image viewer

**Solution:** Re-run the create-test-images command.

---

## Testing Tips

1. **Be Consistent:** Use the same test images for all platforms
2. **Document Immediately:** Record results right after each test
3. **Take Screenshots:** Capture any error messages or anomalies
4. **Test Both Formats:** If platform supports both JPEG and PNG, test both
5. **Keep Originals:** Don't delete original test images
6. **Version Control:** Commit results to git regularly

---

## Quick Reference Commands

```powershell
# Generate test images
cd packages\matter-core
cargo run --bin platform-test -- create-test-images ..\..\test_data\test_product.jpg ..\..\test_data\test_thing.bin ..\..\test_output\

# Test extraction
cargo run --bin platform-test -- test-extraction ..\..\test_output\platform_downloaded.jpg

# Generate report
cargo run --bin platform-test -- generate-report ..\..\test_output\platform_test_results.json
```

---

## Next Steps After Testing

1. Complete all 20+ platform tests
2. Calculate survival rates
3. Generate final report
4. Make Go/No-Go decision
5. Update roadmap if needed
6. Begin Foundation Sprint

---

**Good luck with your testing.**
