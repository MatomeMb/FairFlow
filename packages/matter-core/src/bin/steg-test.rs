//! CLI tool for Phase 0 steganography validation testing
//!
//! Usage:
//!   cargo run --bin steg-test -- inject-xmp <image> <hash> <gist-json> <output>
//!   cargo run --bin steg-test -- append-eof <image> <thing-file> <output>
//!   cargo run --bin steg-test -- extract-xmp <polyglot-image>
//!   cargo run --bin steg-test -- extract-eof <polyglot-image> <output>

use anyhow::{Context, Result};
use matter_core::steg::{
    append_thing_eof, detect_image_format, extract_thing_eof, extract_xmp_beacon,
    generate_xmp_metadata, inject_xmp_jpeg, inject_xmp_png, parse_xmp_metadata, ProductGist,
};
use std::fs;

fn main() -> Result<()> {
    let args: Vec<String> = std::env::args().collect();
    
    if args.len() < 2 {
        print_usage();
        std::process::exit(1);
    }
    
    match args[1].as_str() {
        "inject-xmp" => {
            if args.len() < 6 {
                eprintln!("Usage: inject-xmp <image> <hash> <gist-json> <output>");
                std::process::exit(1);
            }
            inject_xmp_cmd(&args[2], &args[3], &args[4], &args[5])?;
        }
        "append-eof" => {
            if args.len() < 5 {
                eprintln!("Usage: append-eof <image> <thing-file> <output>");
                std::process::exit(1);
            }
            append_eof_cmd(&args[2], &args[3], &args[4])?;
        }
        "extract-xmp" => {
            if args.len() < 3 {
                eprintln!("Usage: extract-xmp <polyglot-image>");
                std::process::exit(1);
            }
            extract_xmp_cmd(&args[2])?;
        }
        "extract-eof" => {
            if args.len() < 4 {
                eprintln!("Usage: extract-eof <polyglot-image> <output>");
                std::process::exit(1);
            }
            extract_eof_cmd(&args[2], &args[3])?;
        }
        "full-embed" => {
            if args.len() < 7 {
                eprintln!("Usage: full-embed <image> <thing-file> <hash> <gist-json> <output>");
                std::process::exit(1);
            }
            full_embed_cmd(&args[2], &args[3], &args[4], &args[5], &args[6])?;
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
    println!("Phase 0 Steganography Validation Tool");
    println!();
    println!("Commands:");
    println!("  inject-xmp <image> <hash> <gist-json> <output>");
    println!("    Inject XMP metadata into image (Layer A)");
    println!();
    println!("  append-eof <image> <thing-file> <output>");
    println!("    Append .thing binary to EOF (Layer B)");
    println!();
    println!("  extract-xmp <polyglot-image>");
    println!("    Extract XMP beacon from image");
    println!();
    println!("  extract-eof <polyglot-image> <output>");
    println!("    Extract .thing binary from EOF");
    println!();
    println!("  full-embed <image> <thing-file> <hash> <gist-json> <output>");
    println!("    Full polyglot embedding (XMP + EOF)");
}

fn inject_xmp_cmd(image_path: &str, hash: &str, gist_json: &str, output_path: &str) -> Result<()> {
    println!("Injecting XMP metadata into image...");
    
    let image_data = fs::read(image_path)
        .with_context(|| format!("Failed to read image: {}", image_path))?;
    
    let format = detect_image_format(&image_data);
    println!("Detected format: {:?}", format);
    
    let xmp = generate_xmp_metadata(hash, gist_json, 1);
    
    let result = match format {
        matter_core::steg::ImageFormat::Jpeg => {
            inject_xmp_jpeg(&image_data, &xmp)
                .context("Failed to inject XMP into JPEG")?
        }
        matter_core::steg::ImageFormat::Png => {
            inject_xmp_png(&image_data, &xmp)
                .context("Failed to inject XMP into PNG")?
        }
        _ => anyhow::bail!("Unsupported image format"),
    };
    
    fs::write(output_path, result)
        .with_context(|| format!("Failed to write output: {}", output_path))?;
    
    println!("✓ XMP metadata injected successfully");
    println!("  Output: {}", output_path);
    
    Ok(())
}

fn append_eof_cmd(image_path: &str, thing_path: &str, output_path: &str) -> Result<()> {
    println!("Appending .thing binary to EOF...");
    
    let image_data = fs::read(image_path)
        .with_context(|| format!("Failed to read image: {}", image_path))?;
    let thing_data = fs::read(thing_path)
        .with_context(|| format!("Failed to read .thing file: {}", thing_path))?;
    
    let polyglot = append_thing_eof(&image_data, &thing_data)
        .context("Failed to append .thing data")?;
    
    fs::write(output_path, polyglot)
        .with_context(|| format!("Failed to write output: {}", output_path))?;
    
    println!("✓ .thing binary appended successfully");
    println!("  Output: {}", output_path);
    
    Ok(())
}

fn extract_xmp_cmd(polyglot_path: &str) -> Result<()> {
    println!("Extracting XMP beacon from image...");
    
    let image_data = fs::read(polyglot_path)
        .with_context(|| format!("Failed to read image: {}", polyglot_path))?;
    
    match extract_xmp_beacon(&image_data)? {
        Some(xmp) => {
            println!("✓ XMP metadata found:");
            println!("{}", xmp);
            
            // Try to parse hash and gist
            match parse_xmp_metadata(&xmp) {
                Ok((hash, gist)) => {
                    println!();
                    println!("Parsed:");
                    println!("  Hash: {}", hash);
                    println!("  Gist: {}", gist);
                }
                Err(e) => {
                    println!("  (Could not parse XMP: {})", e);
                }
            }
        }
        None => {
            println!("✗ No XMP metadata found in image");
            std::process::exit(1);
        }
    }
    
    Ok(())
}

fn extract_eof_cmd(polyglot_path: &str, output_path: &str) -> Result<()> {
    println!("Extracting .thing binary from EOF...");
    
    let polyglot_data = fs::read(polyglot_path)
        .with_context(|| format!("Failed to read polyglot image: {}", polyglot_path))?;
    
    match extract_thing_eof(&polyglot_data)? {
        Some(thing_data) => {
            fs::write(output_path, thing_data)
                .with_context(|| format!("Failed to write output: {}", output_path))?;
            println!("✓ .thing binary extracted successfully");
            println!("  Output: {}", output_path);
        }
        None => {
            println!("✗ No .thing binary found at EOF");
            println!("  (Platform may have stripped EOF data)");
            std::process::exit(1);
        }
    }
    
    Ok(())
}

fn full_embed_cmd(
    image_path: &str,
    thing_path: &str,
    hash: &str,
    gist_json: &str,
    output_path: &str,
) -> Result<()> {
    println!("Creating full polyglot image (XMP + EOF)...");
    
    let image_data = fs::read(image_path)
        .with_context(|| format!("Failed to read image: {}", image_path))?;
    let thing_data = fs::read(thing_path)
        .with_context(|| format!("Failed to read .thing file: {}", thing_path))?;
    
    // Parse gist JSON
    let gist: ProductGist = serde_json::from_str(gist_json)
        .context("Failed to parse gist JSON")?;
    
    let polyglot = matter_core::steg::embed_thing_in_image(&image_data, &thing_data, hash, &gist)
        .context("Failed to create polyglot image")?;
    
    fs::write(output_path, polyglot)
        .with_context(|| format!("Failed to write output: {}", output_path))?;
    
    println!("✓ Full polyglot image created successfully");
    println!("  Output: {}", output_path);
    println!("  Size: {} bytes", fs::metadata(output_path)?.len());
    
    Ok(())
}
