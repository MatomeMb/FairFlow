/**
 * Content Script - Runs on every page
 * 
 * Detects .thing objects in images and matter:// links
 */

console.log('Lens extension content script loaded');

// TODO: Implement image detection with XMP beacons
// TODO: Implement matter:// link interception
// TODO: Implement product overlay UI

// Placeholder: Listen for images
document.addEventListener('DOMContentLoaded', () => {
  const images = document.querySelectorAll('img');
  console.log(`Found ${images.length} images on page`);
  
  // TODO: Check each image for XMP metadata
  // TODO: Extract .thing data and display overlay
});
