# matter-core

Commerce Compiler - Rust library for transforming product data into Universal Commerce Containers (.thing files).

## Overview

This is the core compiler library that:
- Validates and processes product data
- Generates CLIP semantic vectors
- Serializes to FlatBuffers binary format
- Signs with Ed25519 cryptography
- Embeds into polyglot images (steganography)

## Building

```bash
cargo build
cargo test
```

## Building for WASM

```bash
# Install wasm-pack if not already installed
cargo install wasm-pack

# Build for web target
wasm-pack build --target web
```

## Usage

### Library API

```rust
use matter_core::steg::{embed_thing_in_image, extract_thing_from_image, extract_xmp_beacon, ProductGist};

// Create polyglot image with embedded .thing file
let gist = ProductGist {
    title: "Product Name".to_string(),
    price: 2999,
    currency: "USD".to_string(),
    image_url: Some("https://example.com/image.jpg".to_string()),
};

let polyglot = embed_thing_in_image(&image_data, &thing_data, "hash123", &gist)?;

// Extract .thing file from polyglot
let thing = extract_thing_from_image(&polyglot)?;

// Extract XMP beacon (fast discovery)
let xmp = extract_xmp_beacon(&polyglot)?;
```

### Testing Binaries

**Steganography Testing:**
```bash
# Test individual operations
cargo run --bin steg-test -- inject-xmp image.jpg "hash123" '{"title":"Product","price":2999}' output.jpg
cargo run --bin steg-test -- extract-xmp polyglot.jpg
cargo run --bin steg-test -- full-embed image.jpg thing.bin "hash123" '{"title":"Product","price":2999}' output.jpg
```

**Platform Validation:**
```bash
# Create test images for platform testing
cargo run --bin platform-test -- create-test-images test.jpg thing.bin test_output/

# Test extraction from downloaded images
cargo run --bin platform-test -- test-extraction downloaded_image.jpg

# Generate validation report
cargo run --bin platform-test -- generate-report results.json
```

See [../../docs/PHASE0_PLATFORM_TESTING.md](../../docs/PHASE0_PLATFORM_TESTING.md) for complete platform testing workflow.

## Project Structure

```
src/
├── lib.rs              # Main library entry point
├── bin/
│   ├── steg-test.rs    # Steganography testing tool
│   └── platform-test.rs # Platform validation testing tool
├── compiler/           # Compilation pipeline (in progress)
├── crypto/             # Ed25519 signing (in progress)
├── schema/             # FlatBuffers definitions (in progress)
├── steg/               # Steganography engine ✅ Complete
│   ├── mod.rs          # Main steganography API
│   ├── xmp.rs          # XMP metadata injection/extraction
│   └── eof.rs          # EOF binary append/extraction
└── clip/               # CLIP integration (in progress)
```

## Dependencies

- `flatbuffers` - Binary serialization
- `ed25519-dalek` - Cryptographic signing
- `image` - Image processing
- `reqwest` - HTTP client for CLIP API
- `zstd` - Compression

## Status

✅ **Phase 0 Implementation Complete** - Steganography module fully implemented with XMP metadata injection/extraction and EOF binary append/extraction. Ready for platform validation testing.

**Implemented Features:**
- ✅ XMP metadata injection/extraction (JPEG & PNG)
- ✅ EOF binary append/extraction
- ✅ Polyglot image embedding (combined XMP + EOF)
- ✅ Image format detection
- ✅ Testing binaries (`steg-test`, `platform-test`)

See [PHASE0_IMPLEMENTATION.md](./PHASE0_IMPLEMENTATION.md) for complete implementation details.
