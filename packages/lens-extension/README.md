# lens-extension

Browser extension for discovering and interacting with .thing commerce objects.

## Overview

The Lens extension:
- Detects .thing objects embedded in images (XMP beacons)
- Intercepts `matter://` protocol links
- Displays product overlays on hover/click
- Verifies Ed25519 signatures
- Caches .thing files locally

## Development

```bash
# Install dependencies
pnpm install

# Build extension
pnpm build

# Watch mode
pnpm dev
```

## Loading in Browser

### Chrome/Edge
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist/` folder

### Firefox
1. Open `about:debugging`
2. Click "This Firefox"
3. Click "Load Temporary Add-on"
4. Select `manifest.json` from the `dist/` folder

## Project Structure

```
src/
├── manifest.json    # Extension manifest
├── content.js       # Content script (runs on pages)
├── background.js    # Service worker
├── popup.html      # Extension popup UI
└── content.css     # Overlay styles
```

## Features

- Image detection (XMP beacons)
- matter:// link interception
- Product overlay UI
- Ed25519 signature verification (WASM)
- Local caching (IndexedDB; planned Sprint 5)

## Status

Core functionality (matter:// intercept, overlay, XMP beacon) is implemented. Caching (IndexedDB) planned for Sprint 5.
