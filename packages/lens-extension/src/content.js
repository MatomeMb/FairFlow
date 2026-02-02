/**
 * Content Script - Runs on every page
 * 
 * Detects .thing objects in images and matter:// links
 */

console.log('Lens extension content script loaded');

const SHADOW_INDEX_BASE_URL = 'http://localhost:3000';
let activeOverlay = null;

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
  overlay.innerHTML = `
    <h3>${data?.gist?.title || 'Unknown Product'}</h3>
    <div class="price">${formatPrice(data?.gist?.price, data?.gist?.currency)}</div>
    <button class="buy-button">Buy Now</button>
  `;

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
    throw new Error('Resolve failed');
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
    renderOverlay(link, { gist: { title: 'Unable to load', price: 0, currency: 'USD' } });
  }
};

document.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof Element)) {
    return;
  }
  const link = target.closest('a');
  if (!link) {
    return;
  }
  const href = link.getAttribute('href') || '';
  if (href.startsWith('matter://')) {
    event.preventDefault();
    handleMatterLink(link);
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    removeOverlay();
  }
});
