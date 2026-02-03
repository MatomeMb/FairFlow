/**
 * Content Script - Runs on every page
 *
 * Detects .thing objects in images (XMP beacon) and matter:// links
 */

console.log('Lens extension content script loaded');

const SHADOW_INDEX_BASE_URL = 'http://localhost:3000';
let activeOverlay = null;

// MVP-07: XMP beacon detection — extract Matter hash + gist from image bytes
const XMP_JPEG_NS = new TextEncoder().encode('http://ns.adobe.com/xap/1.0/\0');
const XMP_PNG_KEY = new TextEncoder().encode('XML:com.adobe.xmp\0\0\0\0\0');

function extractXmpFromImageBytes(buffer) {
  const bytes = new Uint8Array(buffer);
  if (bytes.length < 2) return null;

  let xmpStr = null;

  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    xmpStr = extractXmpJpeg(bytes);
  } else if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    xmpStr = extractXmpPng(bytes);
  }

  if (!xmpStr) return null;
  const hashMatch = xmpStr.match(/<matter:hash>([^<]*)<\/matter:hash>/);
  const gistMatch = xmpStr.match(/<matter:gist>([^<]*)<\/matter:gist>/);
  if (!hashMatch || !gistMatch) return null;
  return { hash: hashMatch[1].trim(), gist: gistMatch[1].trim() };
}

function extractXmpJpeg(bytes) {
  let i = 2;
  while (i + 4 <= bytes.length) {
    if (bytes[i] !== 0xff) break;
    const marker = bytes[i + 1];
    if (marker === 0xff) {
      i += 1;
      continue;
    }
    if (marker === 0xe1) {
      const segLen = (bytes[i + 2] << 8) | bytes[i + 3];
      if (i + 4 + segLen > bytes.length) break;
      const seg = bytes.subarray(i + 4, i + 4 + segLen - 2);
      if (seg.length >= XMP_JPEG_NS.length && seg.subarray(0, XMP_JPEG_NS.length).every((b, j) => b === XMP_JPEG_NS[j])) {
        const xmpBytes = seg.subarray(XMP_JPEG_NS.length);
        return new TextDecoder().decode(xmpBytes);
      }
    }
    if (marker >= 0xe0 && marker <= 0xef) {
      const segLen = (bytes[i + 2] << 8) | bytes[i + 3];
      i += 4 + segLen;
      continue;
    }
    i += 2;
  }
  return null;
}

function extractXmpPng(bytes) {
  let i = 8;
  while (i + 12 <= bytes.length) {
    const chunkLen = (bytes[i] << 24) | (bytes[i + 1] << 16) | (bytes[i + 2] << 8) | bytes[i + 3];
    const type = bytes.subarray(i + 4, i + 8);
    if (type[0] === 0x69 && type[1] === 0x54 && type[2] === 0x58 && type[3] === 0x74) {
      const data = bytes.subarray(i + 8, i + 8 + chunkLen);
      if (data.length >= XMP_PNG_KEY.length && data.subarray(0, XMP_PNG_KEY.length).every((b, j) => b === XMP_PNG_KEY[j])) {
        const xmpBytes = data.subarray(XMP_PNG_KEY.length);
        return new TextDecoder().decode(xmpBytes);
      }
    }
    i += 12 + chunkLen;
  }
  return null;
}

const formatPrice = (price, currency) => {
  const amount = typeof price === 'number' ? price / 100 : 0;
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency || 'USD'}`;
  }
};

const removeOverlay = () => {
  if (activeOverlay) {
    activeOverlay.remove();
    activeOverlay = null;
  }
};

const renderOverlay = (target, data) => {
  removeOverlay();
  const overlay = document.createElement('div');
  overlay.className = 'matter-overlay';

  const imageUrl = data?.image_url || data?.gist?.image_url;
  const title = data?.gist?.title || 'Unknown Product';

  overlay.innerHTML = `
    <h3>${title}</h3>
    <div class="price">${formatPrice(data?.gist?.price, data?.gist?.currency)}</div>
    <button class="buy-button">Buy Now</button>
  `;

  if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '') {
    const img = document.createElement('img');
    img.className = 'matter-overlay-image';
    img.src = imageUrl;
    img.alt = title;
    img.onerror = () => {
      img.style.display = 'none';
    };
    overlay.insertBefore(img, overlay.firstChild);
  }

  const button = overlay.querySelector('.buy-button');
  button.addEventListener('click', () => {
    if (data?.checkout_url) {
      window.open(data.checkout_url, '_blank', 'noopener');
    }
  });

  const rect = target.getBoundingClientRect();
  overlay.style.top = `${rect.bottom + window.scrollY + 8}px`;
  overlay.style.left = `${rect.left + window.scrollX}px`;
  document.body.appendChild(overlay);
  activeOverlay = overlay;
};

const fetchResolve = async (hash) => {
  const response = await fetch(`${SHADOW_INDEX_BASE_URL}/resolve/${hash}`);
  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    const message = errBody.message && typeof errBody.message === 'string' ? errBody.message : 'Resolve failed';
    throw new Error(message);
  }
  return response.json();
};

const handleMatterLink = async (link) => {
  const href = link.getAttribute('href');
  if (!href || !href.startsWith('matter://')) {
    return;
  }
  const hash = href.replace('matter://', '').trim();
  if (!hash) {
    return;
  }

  renderOverlay(link, { gist: { title: 'Loading...', price: 0, currency: 'USD' } });
  try {
    const data = await fetchResolve(hash);
    renderOverlay(link, data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load';
    renderOverlay(link, { gist: { title: message, price: 0, currency: 'USD' } });
  }
};

// MVP-07: Handle click on image — fetch bytes, detect XMP beacon, resolve and show overlay
const handleImageClick = async (img) => {
  const src = img.currentSrc || img.src;
  if (!src || typeof src !== 'string') return;
  let buffer;
  try {
    if (src.startsWith('data:')) {
      const base64 = src.split(',')[1];
      if (!base64) return;
      const bin = atob(base64);
      buffer = new ArrayBuffer(bin.length);
      const view = new Uint8Array(buffer);
      for (let i = 0; i < bin.length; i++) view[i] = bin.charCodeAt(i);
    } else {
      const res = await fetch(src, { mode: 'cors' });
      if (!res.ok) return;
      buffer = await res.arrayBuffer();
    }
  } catch {
    return;
  }
  const beacon = extractXmpFromImageBytes(buffer);
  if (!beacon) return;
  renderOverlay(img, { gist: { title: 'Loading...', price: 0, currency: 'USD' } });
  try {
    const data = await fetchResolve(beacon.hash);
    renderOverlay(img, data);
  } catch (error) {
    let gist = { title: 'Unknown', price: 0, currency: 'USD' };
    try {
      const parsed = JSON.parse(beacon.gist);
      if (parsed && typeof parsed.title === 'string') gist = { ...gist, ...parsed };
    } catch {
      gist.title = error instanceof Error ? error.message : 'Unable to load';
    }
    renderOverlay(img, { gist });
  }
};

document.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof Element)) {
    return;
  }
  const link = target.closest('a');
  const href = link ? (link.getAttribute('href') || '') : '';
  if (href.startsWith('matter://')) {
    event.preventDefault();
    handleMatterLink(link);
    return;
  }
  const img = target.tagName === 'IMG' ? target : target.closest('img');
  if (img) {
    handleImageClick(img);
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    removeOverlay();
  }
});
