# Phase 0: Platform Validation Testing Guide

## Overview

This guide outlines the process for testing steganography survival across 20+ platforms to determine the Go/No-Go decision for Phase 0.

## Testing Workflow

### Step 1: Create Test Images

```bash
cd packages/matter-core
cargo run --bin platform-test -- create-test-images test.jpg thing.bin test_output/
```

This creates:
- `test_jpeg_polyglot.jpg` - JPEG with embedded data
- `test_png_polyglot.png` - PNG with embedded data
- `test_manifest.json` - Test metadata

### Step 2: Upload to Platforms

Upload each test image to the platforms listed below. For each platform:

1. Upload the image
2. Download the image after upload
3. Save with platform name: `{platform}_downloaded.jpg`

### Step 3: Test Extraction

```bash
cargo run --bin platform-test -- test-extraction discord_downloaded.jpg
```

This will test:
- ✓ XMP extraction (Layer A)
- ✓ EOF extraction (Layer B)

### Step 4: Record Results

Create a `results.json` file with your findings:

```json
{
  "platforms": [
    {
      "name": "Discord",
      "xmp_survives": true,
      "eof_survives": true,
      "notes": "Full polyglot works"
    },
    {
      "name": "Twitter/X",
      "xmp_survives": false,
      "eof_survives": false,
      "notes": "Both stripped, use matter:// URI"
    }
  ]
}
```

### Step 5: Generate Report

```bash
cargo run --bin platform-test -- generate-report results.json
```

## Platform Testing Matrix

### Social Media Platforms

| Platform | Expected XMP | Expected EOF | Test Status |
|----------|--------------|--------------|-------------|
| Discord | ✅ Yes | ✅ Yes | ⏳ Pending |
| Telegram | ✅ Yes | ✅ Yes | ⏳ Pending |
| Twitter/X | ❌ No | ❌ No | ⏳ Pending |
| Instagram | ❌ No | ❌ No | ⏳ Pending |
| Facebook | ❌ No | ❌ No | ⏳ Pending |
| LinkedIn | ⚠️ Partial | ❌ No | ⏳ Pending |
| Reddit | ⚠️ Partial | ❌ No | ⏳ Pending |
| Pinterest | ❌ No | ❌ No | ⏳ Pending |
| Tumblr | ⚠️ Partial | ❌ No | ⏳ Pending |

### Messaging Platforms

| Platform | Expected XMP | Expected EOF | Test Status |
|----------|--------------|--------------|-------------|
| WhatsApp | ⚠️ Partial | ❌ No | ⏳ Pending |
| Signal | ✅ Yes | ✅ Yes | ⏳ Pending |
| iMessage | ⚠️ Partial | ❌ No | ⏳ Pending |
| Slack | ✅ Yes | ✅ Yes | ⏳ Pending |
| Microsoft Teams | ✅ Yes | ✅ Yes | ⏳ Pending |

### Other Platforms

| Platform | Expected XMP | Expected EOF | Test Status |
|----------|--------------|--------------|-------------|
| Email (Gmail) | ✅ Yes | ✅ Yes | ⏳ Pending |
| Email (Outlook) | ✅ Yes | ✅ Yes | ⏳ Pending |
| Google Drive | ✅ Yes | ✅ Yes | ⏳ Pending |
| Dropbox | ✅ Yes | ✅ Yes | ⏳ Pending |
| GitHub | ✅ Yes | ✅ Yes | ⏳ Pending |
| Direct Download | ✅ Yes | ✅ Yes | ⏳ Pending |

## Decision Matrix

Based on survival rates:

| Survival Rate | Decision | Action Plan |
|---------------|----------|-------------|
| ≥70% | ✅ **GO** | Full steganography approach |
| 50-69% | ⚠️ **HYBRID** | Steg + matter:// URIs |
| <50% | 🔄 **PIVOT** | matter:// as primary, steg secondary |

## Testing Checklist

- [ ] Create test images (JPEG + PNG)
- [ ] Upload to 20+ platforms
- [ ] Download images from each platform
- [ ] Test XMP extraction for each
- [ ] Test EOF extraction for each
- [ ] Record results in JSON
- [ ] Calculate survival rates
- [ ] Generate validation report
- [ ] Make Go/No-Go decision
- [ ] Update roadmap if pivot needed

## Notes

- Test both JPEG and PNG formats
- Test with different image sizes
- Document any platform-specific behaviors
- Note compression/quality changes
- Record any error messages

---

**Target Completion:** Feb 28, 2026  
**Go/No-Go Decision Date:** Feb 28, 2026
