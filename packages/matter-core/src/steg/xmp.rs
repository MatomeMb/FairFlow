//! XMP metadata injection and extraction
//!
//! Implements XMP metadata beacon for fast product discovery.
//! XMP is embedded in JPEG/PNG headers and survives most platform uploads.

use anyhow::{Context, Result};
use std::io::Write;

/// XMP namespace for Matter commerce data
const MATTER_NAMESPACE: &str = "https://thingsthatmatter.com/ns/1.0/";

/// Generate XMP metadata XML for product hash and gist
pub fn generate_xmp_metadata(hash: &str, gist: &str, version: u8) -> String {
    format!(
        r#"<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about=""
      xmlns:matter="{}">
      <matter:hash>{}</matter:hash>
      <matter:gist>{}</matter:gist>
      <matter:version>{}</matter:version>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>"#,
        MATTER_NAMESPACE, hash, gist, version
    )
}

/// Inject XMP metadata into JPEG image
///
/// JPEG XMP is stored in APP1 segment (0xFFE1)
/// We need to find existing APP1 or insert new one
pub fn inject_xmp_jpeg(image_data: &[u8], xmp_data: &str) -> Result<Vec<u8>> {
    // JPEG file structure:
    // - SOI (0xFFD8)
    // - APP segments (0xFFE0-0xFFEF)
    // - Other segments
    // - Image data
    
    let mut output = Vec::new();
    let mut reader = image_data;
    
    // Check JPEG header
    if reader.len() < 2 || reader[0] != 0xFF || reader[1] != 0xD8 {
        anyhow::bail!("Invalid JPEG file: missing SOI marker");
    }
    
    // Write SOI
    output.write_all(&[0xFF, 0xD8])?;
    reader = &reader[2..];
    
    // Process segments until we hit image data
    let mut inserted_xmp = false;
    
    while reader.len() >= 2 {
        if reader[0] != 0xFF {
            break; // Not a marker, likely image data
        }
        
        let marker = reader[1];
        
        // Skip padding bytes (0xFF)
        if marker == 0xFF {
            output.write_all(&[0xFF])?;
            reader = &reader[1..];
            continue;
        }
        
        // If we hit image data markers, insert XMP before them if not already inserted
        if !inserted_xmp && (marker == 0xDA || marker == 0xC0 || marker == 0xC4) {
            // Insert XMP APP1 segment
            insert_xmp_segment(&mut output, xmp_data)?;
            inserted_xmp = true;
        }
        
        // Handle APP1 segment (where XMP typically lives)
        if marker == 0xE1 {
            // Check if it's already an XMP segment
            if reader.len() >= 4 {
                let segment_len = u16::from_be_bytes([reader[2], reader[3]]) as usize;
                if reader.len() >= segment_len + 2 {
                    let segment_data = &reader[4..4 + segment_len - 2];
                    if segment_data.starts_with(b"http://ns.adobe.com/xap/1.0/\0") {
                        // Replace existing XMP
                        insert_xmp_segment(&mut output, xmp_data)?;
                        reader = &reader[segment_len + 2..];
                        inserted_xmp = true;
                        continue;
                    }
                }
            }
        }
        
        // Copy segment
        if marker >= 0xE0 && marker <= 0xEF {
            // APP segment - copy with length
            if reader.len() >= 4 {
                let segment_len = u16::from_be_bytes([reader[2], reader[3]]) as usize;
                if reader.len() >= segment_len + 2 {
                    output.write_all(&reader[..segment_len + 2])?;
                    reader = &reader[segment_len + 2..];
                    continue;
                }
            }
        }
        
        // Copy marker byte
        output.write_all(&[0xFF, marker])?;
        reader = &reader[2..];
    }
    
    // If we haven't inserted XMP yet, insert it now (before image data)
    if !inserted_xmp {
        insert_xmp_segment(&mut output, xmp_data)?;
    }
    
    // Copy remaining data (image data)
    output.write_all(reader)?;
    
    Ok(output)
}

/// Insert XMP segment into JPEG
fn insert_xmp_segment(output: &mut Vec<u8>, xmp_data: &str) -> Result<()> {
    // APP1 marker
    output.write_all(&[0xFF, 0xE1])?;
    
    // XMP namespace identifier
    let namespace = b"http://ns.adobe.com/xap/1.0/\0";
    let xmp_bytes = xmp_data.as_bytes();
    
    // Segment length: 2 bytes length + namespace + xmp data
    let segment_len = 2 + namespace.len() + xmp_bytes.len();
    if segment_len > 65535 {
        anyhow::bail!("XMP data too large for JPEG segment (max 65535 bytes)");
    }
    
    output.write_all(&(segment_len as u16).to_be_bytes())?;
    output.write_all(namespace)?;
    output.write_all(xmp_bytes)?;
    
    Ok(())
}

/// Extract XMP metadata from JPEG
pub fn extract_xmp_jpeg(image_data: &[u8]) -> Result<Option<String>> {
    if image_data.len() < 2 || image_data[0] != 0xFF || image_data[1] != 0xD8 {
        anyhow::bail!("Invalid JPEG file");
    }
    
    let mut reader = &image_data[2..];
    
    while reader.len() >= 4 {
        if reader[0] != 0xFF {
            break;
        }
        
        let marker = reader[1];
        
        // Skip padding
        if marker == 0xFF {
            reader = &reader[1..];
            continue;
        }
        
        // Check APP1 segment
        if marker == 0xE1 {
            let segment_len = u16::from_be_bytes([reader[2], reader[3]]) as usize;
            if reader.len() >= segment_len + 2 {
                let segment_data = &reader[4..4 + segment_len - 2];
                if segment_data.starts_with(b"http://ns.adobe.com/xap/1.0/\0") {
                    // Found XMP segment
                    let xmp_start = b"http://ns.adobe.com/xap/1.0/\0".len();
                    let xmp_data = &segment_data[xmp_start..];
                    let xmp_str = String::from_utf8(xmp_data.to_vec())
                        .context("Invalid UTF-8 in XMP data")?;
                    return Ok(Some(xmp_str));
                }
            }
        }
        
        // Move to next segment
        if marker >= 0xE0 && marker <= 0xEF {
            if reader.len() >= 4 {
                let segment_len = u16::from_be_bytes([reader[2], reader[3]]) as usize;
                if reader.len() >= segment_len + 2 {
                    reader = &reader[segment_len + 2..];
                    continue;
                }
            }
        }
        
        // Not a segment we care about, move forward
        reader = &reader[2..];
    }
    
    Ok(None)
}

/// Inject XMP metadata into PNG image
///
/// PNG XMP is stored in iTXt chunk with keyword "XML:com.adobe.xmp"
pub fn inject_xmp_png(image_data: &[u8], xmp_data: &str) -> Result<Vec<u8>> {
    // PNG signature: 89 50 4E 47 0D 0A 1A 0A
    if image_data.len() < 8 || !image_data.starts_with(b"\x89PNG\r\n\x1a\n") {
        anyhow::bail!("Invalid PNG file: missing PNG signature");
    }
    
    let mut output = Vec::new();
    output.write_all(&image_data[..8])?; // PNG signature
    
    let mut reader = &image_data[8..];
    let mut inserted_xmp = false;
    
    // Process chunks
    while reader.len() >= 12 {
        let chunk_len = u32::from_be_bytes([
            reader[0], reader[1], reader[2], reader[3],
        ]) as usize;
        
        if reader.len() < 12 + chunk_len {
            break; // Incomplete chunk
        }
        
        let chunk_type = &reader[4..8];
        let chunk_data = &reader[8..8 + chunk_len];
        
        // Check if this is an existing iTXt chunk with XMP
        if chunk_type == b"iTXt" && chunk_data.starts_with(b"XML:com.adobe.xmp\0\0\0\0\0") {
            // Replace existing XMP chunk
            insert_xmp_png_chunk(&mut output, xmp_data)?;
            inserted_xmp = true;
            // Skip CRC and move to next chunk
            reader = &reader[12 + chunk_len..];
            continue;
        }
        
        // If we hit IEND, insert XMP before it
        if chunk_type == b"IEND" && !inserted_xmp {
            insert_xmp_png_chunk(&mut output, xmp_data)?;
            inserted_xmp = true;
        }
        
        // Copy chunk (length, type, data, CRC)
        output.write_all(&reader[..12 + chunk_len])?;
        reader = &reader[12 + chunk_len..];
    }
    
    // If we haven't inserted XMP yet, insert before IEND
    if !inserted_xmp {
        insert_xmp_png_chunk(&mut output, xmp_data)?;
    }
    
    // Copy remaining data
    output.write_all(reader)?;
    
    Ok(output)
}

/// Insert XMP iTXt chunk into PNG
fn insert_xmp_png_chunk(output: &mut Vec<u8>, xmp_data: &str) -> Result<()> {
    let keyword = b"XML:com.adobe.xmp";
    let xmp_bytes = xmp_data.as_bytes();
    
    // iTXt chunk format:
    // - Keyword (null-terminated)
    // - Compression flag (1 byte, 0 = uncompressed)
    // - Compression method (1 byte, 0 = deflate, but we use 0 for uncompressed)
    // - Language tag (null-terminated, empty)
    // - Translated keyword (null-terminated, empty)
    // - Text data
    
    let mut chunk_data = Vec::new();
    chunk_data.write_all(keyword)?;
    chunk_data.write_all(&[0, 0, 0, 0, 0])?; // Compression flags + empty language/keyword
    chunk_data.write_all(xmp_bytes)?;
    
    // Calculate CRC
    let mut crc_input = Vec::new();
    crc_input.write_all(b"iTXt")?;
    crc_input.write_all(&chunk_data)?;
    let crc = calculate_png_crc(&crc_input);
    
    // Write chunk length
    output.write_all(&(chunk_data.len() as u32).to_be_bytes())?;
    // Write chunk type
    output.write_all(b"iTXt")?;
    // Write chunk data
    output.write_all(&chunk_data)?;
    // Write CRC
    output.write_all(&crc.to_be_bytes())?;
    
    Ok(())
}

/// Calculate PNG CRC-32
fn calculate_png_crc(data: &[u8]) -> u32 {
    let mut crc: u32 = 0xFFFFFFFF;
    let table = PNG_CRC_TABLE;
    
    for &byte in data {
        let index = ((crc ^ byte as u32) & 0xFF) as usize;
        crc = table[index] ^ (crc >> 8);
    }
    
    crc ^ 0xFFFFFFFF
}

/// PNG CRC-32 lookup table
const PNG_CRC_TABLE: [u32; 256] = generate_crc_table();

const fn generate_crc_table() -> [u32; 256] {
    let mut table = [0u32; 256];
    let mut i = 0;
    while i < 256 {
        let mut c = i as u32;
        let mut j = 0;
        while j < 8 {
            if c & 1 != 0 {
                c = 0xEDB88320 ^ (c >> 1);
            } else {
                c >>= 1;
            }
            j += 1;
        }
        table[i] = c;
        i += 1;
    }
    table
}

/// Extract XMP metadata from PNG
pub fn extract_xmp_png(image_data: &[u8]) -> Result<Option<String>> {
    if image_data.len() < 8 || !image_data.starts_with(b"\x89PNG\r\n\x1a\n") {
        anyhow::bail!("Invalid PNG file");
    }
    
    let mut reader = &image_data[8..];
    
    while reader.len() >= 12 {
        let chunk_len = u32::from_be_bytes([
            reader[0], reader[1], reader[2], reader[3],
        ]) as usize;
        
        if reader.len() < 12 + chunk_len {
            break;
        }
        
        let chunk_type = &reader[4..8];
        
        if chunk_type == b"iTXt" {
            let chunk_data = &reader[8..8 + chunk_len];
            if chunk_data.starts_with(b"XML:com.adobe.xmp\0\0\0\0\0") {
                // Found XMP chunk
                let xmp_start = b"XML:com.adobe.xmp\0\0\0\0\0".len();
                let xmp_data = &chunk_data[xmp_start..];
                let xmp_str = String::from_utf8(xmp_data.to_vec())
                    .context("Invalid UTF-8 in XMP data")?;
                return Ok(Some(xmp_str));
            }
        }
        
        reader = &reader[12 + chunk_len..];
    }
    
    Ok(None)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_xmp_generation() {
        let xmp = generate_xmp_metadata("abc123", r#"{"title":"Test"}"#, 1);
        assert!(xmp.contains("abc123"));
        assert!(xmp.contains(r#"{"title":"Test"}"#));
        assert!(xmp.contains("thingsthatmatter.com"));
    }
}
