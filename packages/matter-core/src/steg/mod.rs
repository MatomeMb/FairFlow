//! Steganography module - Polyglot image embedding
//!
//! Implements two-layer steganography:
//! - Layer A: XMP metadata (hash + gist) for fast discovery
//! - Layer B: EOF binary append (full .thing file) for complete data

mod xmp;
mod eof;

pub use xmp::{generate_xmp_metadata, inject_xmp_jpeg, inject_xmp_png, extract_xmp_jpeg, extract_xmp_png};
pub use eof::{append_thing_eof, extract_thing_eof, validate_image_integrity};

use anyhow::{Context, Result};

/// Image format detection
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ImageFormat {
    Jpeg,
    Png,
    Unknown,
}

/// Detect image format from data
pub fn detect_image_format(data: &[u8]) -> ImageFormat {
    if data.len() >= 2 && data[0] == 0xFF && data[1] == 0xD8 {
        ImageFormat::Jpeg
    } else if data.len() >= 8 && data.starts_with(b"\x89PNG\r\n\x1a\n") {
        ImageFormat::Png
    } else {
        ImageFormat::Unknown
    }
}

/// Product gist for XMP metadata
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct ProductGist {
    pub title: String,
    pub price: u64, // Price in cents
    pub currency: String,
    pub image_url: Option<String>,
}

impl ProductGist {
    /// Convert to JSON string for XMP embedding
    pub fn to_json(&self) -> Result<String> {
        let json = serde_json::json!({
            "title": self.title,
            "price": self.price,
            "currency": self.currency,
            "image_url": self.image_url,
        });
        Ok(json.to_string())
    }
}

/// Embed .thing file into an image (polyglot format)
///
/// Creates a polyglot image with:
/// 1. XMP metadata containing hash + gist (Layer A)
/// 2. EOF binary append containing full .thing file (Layer B)
pub fn embed_thing_in_image(
    image_data: &[u8],
    thing_data: &[u8],
    hash: &str,
    gist: &ProductGist,
) -> Result<Vec<u8>> {
    let format = detect_image_format(image_data);
    
    // Generate XMP metadata
    let gist_json = gist.to_json().context("Failed to serialize gist")?;
    let xmp = generate_xmp_metadata(hash, &gist_json, 1);
    
    // Inject XMP metadata (Layer A)
    let image_with_xmp = match format {
        ImageFormat::Jpeg => inject_xmp_jpeg(image_data, &xmp)
            .context("Failed to inject XMP into JPEG")?,
        ImageFormat::Png => inject_xmp_png(image_data, &xmp)
            .context("Failed to inject XMP into PNG")?,
        ImageFormat::Unknown => {
            anyhow::bail!("Unsupported image format. Only JPEG and PNG are supported.");
        }
    };
    
    // Append .thing binary (Layer B)
    let polyglot = append_thing_eof(&image_with_xmp, thing_data)
        .context("Failed to append .thing data to EOF")?;
    
    // Validate image integrity (check original image, not polyglot)
    // The polyglot should still display correctly as the EOF data is appended after image end
    if !validate_image_integrity(image_data)? {
        anyhow::bail!("Image integrity check failed - original image may be corrupted");
    }
    
    Ok(polyglot)
}

/// Extract .thing file from polyglot image
///
/// Tries EOF extraction first (most reliable), falls back to XMP if needed.
pub fn extract_thing_from_image(polyglot_data: &[u8]) -> Result<Option<Vec<u8>>> {
    // Try EOF extraction first (Layer B - full .thing file)
    if let Some(thing_data) = extract_thing_eof(polyglot_data)? {
        return Ok(Some(thing_data));
    }
    
    // EOF extraction failed - this is expected if platform stripped EOF data
    // In that case, we'd need to resolve via hash from XMP
    Ok(None)
}

/// Extract XMP beacon (hash + gist) from image
///
/// This is Layer A - fast discovery without full .thing file.
pub fn extract_xmp_beacon(image_data: &[u8]) -> Result<Option<String>> {
    let format = detect_image_format(image_data);
    
    match format {
        ImageFormat::Jpeg => extract_xmp_jpeg(image_data),
        ImageFormat::Png => extract_xmp_png(image_data),
        ImageFormat::Unknown => Ok(None),
    }
}

/// Parse XMP metadata to extract hash and gist
pub fn parse_xmp_metadata(xmp_xml: &str) -> Result<(String, String)> {
    // Simple XML parsing - in production, use proper XML parser
    // For now, use regex or string matching
    
    // Extract hash
    let hash_pattern = r#"<matter:hash>([^<]+)</matter:hash>"#;
    let hash = regex::Regex::new(hash_pattern)
        .ok()
        .and_then(|re| re.captures(xmp_xml))
        .and_then(|caps| caps.get(1))
        .map(|m| m.as_str().to_string())
        .context("Failed to extract hash from XMP")?;
    
    // Extract gist
    let gist_pattern = r#"<matter:gist>([^<]+)</matter:gist>"#;
    let gist = regex::Regex::new(gist_pattern)
        .ok()
        .and_then(|re| re.captures(xmp_xml))
        .and_then(|caps| caps.get(1))
        .map(|m| m.as_str().to_string())
        .context("Failed to extract gist from XMP")?;
    
    Ok((hash, gist))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_detect_jpeg() {
        let jpeg_data = [0xFF, 0xD8, 0xFF, 0xE0];
        assert_eq!(detect_image_format(&jpeg_data), ImageFormat::Jpeg);
    }
    
    #[test]
    fn test_detect_png() {
        let png_data = b"\x89PNG\r\n\x1a\n";
        assert_eq!(detect_image_format(png_data), ImageFormat::Png);
    }
    
    #[test]
    fn test_product_gist_json() {
        let gist = ProductGist {
            title: "Test Product".to_string(),
            price: 2999,
            currency: "USD".to_string(),
            image_url: Some("https://example.com/image.jpg".to_string()),
        };
        
        let json = gist.to_json().unwrap();
        assert!(json.contains("Test Product"));
        assert!(json.contains("2999"));
    }
}
