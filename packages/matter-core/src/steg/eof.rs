//! EOF (End of File) binary append for polyglot images
//!
//! Appends .thing binary data to the end of image files.
//! The image remains valid while containing the full commerce data.

use anyhow::Result;

/// Magic marker to identify .thing payload at EOF
const THING_EOF_MARKER: &[u8] = b"MATTER_THING_EOF";

/// Append .thing binary data to image file (EOF append)
///
/// This creates a polyglot file that is both:
/// - A valid image (JPEG/PNG) that displays normally
/// - Contains the full .thing binary at the end
///
/// Format:
/// [Original Image Data]
/// [EOF Marker: "MATTER_THING_EOF"]
/// [Length: 8 bytes u64 big-endian]
/// [.thing binary data]
pub fn append_thing_eof(image_data: &[u8], thing_data: &[u8]) -> Result<Vec<u8>> {
    let mut output = Vec::with_capacity(image_data.len() + THING_EOF_MARKER.len() + 8 + thing_data.len());
    
    // Write original image data
    output.extend_from_slice(image_data);
    
    // Write EOF marker
    output.extend_from_slice(THING_EOF_MARKER);
    
    // Write length (8 bytes, u64 big-endian)
    let length = thing_data.len() as u64;
    output.extend_from_slice(&length.to_be_bytes());
    
    // Write .thing binary data
    output.extend_from_slice(thing_data);
    
    Ok(output)
}

/// Extract .thing binary data from EOF of polyglot image
///
/// Searches backwards from end of file for the marker,
/// then extracts the length and data.
pub fn extract_thing_eof(polyglot_data: &[u8]) -> Result<Option<Vec<u8>>> {
    // Search backwards for marker
    if polyglot_data.len() < THING_EOF_MARKER.len() + 8 {
        return Ok(None);
    }
    
    // Search from end backwards
    let mut search_pos = polyglot_data.len().saturating_sub(THING_EOF_MARKER.len() + 8 + 1);
    let min_search = polyglot_data.len().saturating_sub(1024 * 1024); // Don't search more than 1MB from end
    
    while search_pos >= min_search && search_pos + THING_EOF_MARKER.len() <= polyglot_data.len() {
        if polyglot_data[search_pos..].starts_with(THING_EOF_MARKER) {
            // Found marker
            let data_start = search_pos + THING_EOF_MARKER.len();
            
            if data_start + 8 > polyglot_data.len() {
                return Ok(None);
            }
            
            // Read length
            let length_bytes = &polyglot_data[data_start..data_start + 8];
            let length = u64::from_be_bytes([
                length_bytes[0], length_bytes[1], length_bytes[2], length_bytes[3],
                length_bytes[4], length_bytes[5], length_bytes[6], length_bytes[7],
            ]) as usize;
            
            let payload_start = data_start + 8;
            if payload_start + length > polyglot_data.len() {
                return Ok(None);
            }
            
            // Extract payload
            let payload = polyglot_data[payload_start..payload_start + length].to_vec();
            return Ok(Some(payload));
        }
        
        search_pos = search_pos.saturating_sub(1);
    }
    
    Ok(None)
}

/// Validate that image still displays correctly after EOF append
///
/// This is a basic check - full validation requires actually rendering the image.
pub fn validate_image_integrity(image_data: &[u8]) -> Result<bool> {
    // Check JPEG
    if image_data.len() >= 2 && image_data[0] == 0xFF && image_data[1] == 0xD8 {
        // Check for EOI marker (0xFFD9) before any appended data
        // This is a simplified check
        if image_data.windows(2).any(|w| w == [0xFF, 0xD9]) {
            return Ok(true);
        }
    }
    
    // Check PNG
    if image_data.len() >= 8 && image_data.starts_with(b"\x89PNG\r\n\x1a\n") {
        // Check for IEND chunk
        if image_data.windows(4).any(|w| w == b"IEND") {
            return Ok(true);
        }
    }
    
    Ok(false)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_eof_append_and_extract() {
        let image_data = b"fake image data";
        let thing_data = b"thing binary data";
        
        let polyglot = append_thing_eof(image_data, thing_data).unwrap();
        
        // Original image data should be at start
        assert!(polyglot.starts_with(image_data));
        
        // Extract should work
        let extracted = extract_thing_eof(&polyglot).unwrap().unwrap();
        assert_eq!(extracted, thing_data);
    }
    
    #[test]
    fn test_extract_none_when_no_marker() {
        let image_data = b"regular image data";
        let result = extract_thing_eof(image_data).unwrap();
        assert!(result.is_none());
    }
}
