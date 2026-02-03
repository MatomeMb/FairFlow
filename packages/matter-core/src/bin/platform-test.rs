//! Platform validation testing tool
//!
//! Tests steganography survival across multiple platforms.
//! Creates test images, tracks uploads, and measures survival rates.

use anyhow::{Context, Result};
use matter_core::steg::{embed_thing_in_image, ProductGist};
use std::fs;
use std::path::PathBuf;

/// Platform test configuration
#[derive(Debug, Clone)]
struct PlatformTest {
    name: String,
    url: Option<String>,
    expected_xmp_survives: bool,
    expected_eof_survives: bool,
    actual_xmp_survives: Option<bool>,
    actual_eof_survives: Option<bool>,
}

impl PlatformTest {
    fn new(name: &str, expected_xmp: bool, expected_eof: bool) -> Self {
        Self {
            name: name.to_string(),
            url: None,
            expected_xmp_survives: expected_xmp,
            expected_eof_survives: expected_eof,
            actual_xmp_survives: None,
            actual_eof_survives: None,
        }
    }
}

fn main() -> Result<()> {
    let args: Vec<String> = std::env::args().collect();
    
    if args.len() < 2 {
        print_usage();
        std::process::exit(1);
    }
    
    match args[1].as_str() {
        "create-test-images" => {
            if args.len() < 4 {
                eprintln!("Usage: create-test-images <image> <thing-file> <output-dir>");
                std::process::exit(1);
            }
            create_test_images(&args[2], &args[3], &args[4])?;
        }
        "test-extraction" => {
            if args.len() < 3 {
                eprintln!("Usage: test-extraction <polyglot-image> [--output <results.json>]");
                std::process::exit(1);
            }
            let polyglot_path = &args[2];
            let output_path = args
                .iter()
                .position(|a| a == "--output")
                .and_then(|i| args.get(i + 1).map(String::as_str));
            test_extraction(polyglot_path, output_path)?;
        }
        "generate-report" => {
            if args.len() < 3 {
                eprintln!("Usage: generate-report <results-json>");
                std::process::exit(1);
            }
            generate_report(&args[2])?;
        }
        _ => {
            eprintln!("Unknown command: {}", args[1]);
            print_usage();
            std::process::exit(1);
        }
    }
    
    Ok(())
}

fn print_usage() {
    println!("Platform Validation Testing Tool");
    println!();
    println!("Commands:");
    println!("  create-test-images <image> <thing-file> <output-dir>");
    println!("    Create test polyglot images for platform testing");
    println!();
    println!("  test-extraction <polyglot-image> [--output <results.json>]");
    println!("    Test extraction from downloaded image; optionally write JSON results");
    println!();
    println!("  generate-report <results-json>");
    println!("    Generate Phase 0 validation report");
}

fn create_test_images(image_path: &str, thing_path: &str, output_dir: &str) -> Result<()> {
    println!("Creating test images for platform validation...");
    
    // Create output directory
    fs::create_dir_all(output_dir)
        .with_context(|| format!("Failed to create output directory: {}", output_dir))?;
    
    // Read source files
    let image_data = fs::read(image_path)
        .with_context(|| format!("Failed to read image: {}", image_path))?;
    let thing_data = fs::read(thing_path)
        .with_context(|| format!("Failed to read .thing file: {}", thing_path))?;
    
    // Create test product gist
    let gist = ProductGist {
        title: "Phase 0 Test Product".to_string(),
        price: 2999,
        currency: "USD".to_string(),
        image_url: Some("https://example.com/test.jpg".to_string()),
    };
    
    let hash = "phase0_test_hash_12345";
    
    // Create JPEG polyglot
    if image_data.len() >= 2 && image_data[0] == 0xFF && image_data[1] == 0xD8 {
        let jpeg_polyglot = embed_thing_in_image(&image_data, &thing_data, hash, &gist)
            .context("Failed to create JPEG polyglot")?;
        
        let jpeg_path = PathBuf::from(output_dir).join("test_jpeg_polyglot.jpg");
        fs::write(&jpeg_path, jpeg_polyglot)
            .with_context(|| format!("Failed to write JPEG polyglot: {:?}", jpeg_path))?;
        
        println!("✓ Created JPEG polyglot: {:?}", jpeg_path);
    }
    
    // Create PNG polyglot (if source is PNG or create from JPEG)
    let png_polyglot = embed_thing_in_image(&image_data, &thing_data, hash, &gist)
        .context("Failed to create PNG polyglot")?;
    
    let png_path = PathBuf::from(output_dir).join("test_png_polyglot.png");
    fs::write(&png_path, png_polyglot)
        .with_context(|| format!("Failed to write PNG polyglot: {:?}", png_path))?;
    
    println!("✓ Created PNG polyglot: {:?}", png_path);
    
    // Create test manifest
    let manifest = serde_json::json!({
        "test_images": {
            "jpeg": "test_jpeg_polyglot.jpg",
            "png": "test_png_polyglot.png"
        },
        "hash": hash,
        "gist": {
            "title": gist.title,
            "price": gist.price,
            "currency": gist.currency
        },
        "created_at": chrono::Utc::now().to_rfc3339(),
        "instructions": "Upload these images to platforms, download them, then test extraction"
    });
    
    let manifest_path = PathBuf::from(output_dir).join("test_manifest.json");
    fs::write(&manifest_path, serde_json::to_string_pretty(&manifest)?)
        .with_context(|| format!("Failed to write manifest: {:?}", manifest_path))?;
    
    println!("✓ Created test manifest: {:?}", manifest_path);
    println!();
    println!("Next steps:");
    println!("  1. Upload test images to platforms (Discord, Telegram, Twitter, etc.)");
    println!("  2. Download the images after upload");
    println!("  3. Run: cargo run --bin platform-test -- test-extraction <downloaded-image>");
    
    Ok(())
}

fn test_extraction(polyglot_path: &str, output_path: Option<&str>) -> Result<()> {
    println!("Testing extraction from: {}", polyglot_path);
    println!();

    let image_data = fs::read(polyglot_path)
        .with_context(|| format!("Failed to read image: {}", polyglot_path))?;

    let mut xmp_survives = false;
    let mut eof_survives = false;

    // Test XMP extraction
    println!("Testing XMP extraction (Layer A)...");
    match matter_core::steg::extract_xmp_beacon(&image_data)? {
        Some(xmp) => {
            println!("  ✓ XMP metadata found");
            xmp_survives = true;
            match matter_core::steg::parse_xmp_metadata(&xmp) {
                Ok((hash, gist_json)) => {
                    println!("    Hash: {}", hash);
                    println!("    Gist JSON: {}", gist_json);
                }
                Err(e) => {
                    println!("    (Parse error: {})", e);
                }
            }
        }
        None => {
            println!("  ✗ XMP metadata NOT found (platform may have stripped it)");
        }
    }

    println!();
    println!("Testing EOF extraction (Layer B)...");
    match matter_core::steg::extract_thing_from_image(&image_data)? {
        Some(thing_data) => {
            println!("  ✓ .thing binary found at EOF");
            println!("    Size: {} bytes", thing_data.len());
            eof_survives = true;
        }
        None => {
            println!("  ✗ .thing binary NOT found at EOF (platform may have stripped it)");
        }
    }

    if let Some(path) = output_path {
        let name: String = PathBuf::from(polyglot_path)
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("unknown")
            .to_string();
        let results = serde_json::json!({
            "platforms": [
                {
                    "name": name,
                    "file": polyglot_path,
                    "xmp_survives": xmp_survives,
                    "eof_survives": eof_survives
                }
            ],
            "timestamp": chrono::Utc::now().to_rfc3339(),
        });
        fs::write(path, serde_json::to_string_pretty(&results)?)
            .with_context(|| format!("Failed to write results to: {}", path))?;
        println!();
        println!("✓ Wrote results to: {}", path);
    }

    Ok(())
}

fn generate_report(results_path: &str) -> Result<()> {
    println!("Generating Phase 0 validation report...");
    
    let results: serde_json::Value = serde_json::from_str(&fs::read_to_string(results_path)?)
        .context("Failed to parse results JSON")?;
    
    // Calculate survival rates
    let platforms = results["platforms"].as_array()
        .context("Missing platforms array")?;
    
    let mut xmp_survived = 0;
    let mut eof_survived = 0;
    let mut total = 0;
    
    for platform in platforms {
        total += 1;
        if platform["xmp_survives"].as_bool().unwrap_or(false) {
            xmp_survived += 1;
        }
        if platform["eof_survives"].as_bool().unwrap_or(false) {
            eof_survived += 1;
        }
    }
    
    let xmp_rate = (xmp_survived as f64 / total as f64) * 100.0;
    let eof_rate = (eof_survived as f64 / total as f64) * 100.0;
    let overall_rate = ((xmp_survived + eof_survived) as f64 / (total * 2) as f64) * 100.0;
    
    println!();
    println!("=== Phase 0 Validation Report ===");
    println!();
    println!("Platforms Tested: {}", total);
    println!();
    println!("XMP Survival Rate: {:.1}% ({}/{})", xmp_rate, xmp_survived, total);
    println!("EOF Survival Rate: {:.1}% ({}/{})", eof_rate, eof_survived, total);
    println!("Overall Survival Rate: {:.1}%", overall_rate);
    println!();
    
    // Go/No-Go recommendation
    if overall_rate >= 70.0 {
        println!("✅ RECOMMENDATION: GO - Full steganography approach");
    } else if overall_rate >= 50.0 {
        println!("⚠️  RECOMMENDATION: HYBRID - Steg + matter:// URIs");
    } else {
        println!("🔄 RECOMMENDATION: PIVOT - matter:// as primary, steg secondary");
    }
    
    Ok(())
}
