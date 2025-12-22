/**
 * NICNOA Shop Widget
 * Embeddable shop widget for affiliate marketing
 */
(function() {
  'use strict';

  // Configuration
  const API_BASE = window.NICNOA_API_BASE || 'https://app.nicnoa.com';
  const WIDGET_VERSION = '1.0.0';

  // Find widget container
  const container = document.getElementById('nicnoa-shop-widget');
  if (!container) {
    console.error('NICNOA Shop Widget: Container #nicnoa-shop-widget not found');
    return;
  }

  // Get configuration from data attributes
  const salonId = container.dataset.salon;
  const affiliateToken = container.dataset.affiliate;
  const theme = container.dataset.theme || 'dark';
  const productsLimit = parseInt(container.dataset.limit) || 12;

  if (!salonId) {
    console.error('NICNOA Shop Widget: data-salon attribute required');
    return;
  }

  // Styles
  const styles = `
    .nicnoa-widget {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
      ${theme === 'dark' ? `
        background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
        color: #ffffff;
      ` : `
        background: #ffffff;
        color: #1a1a1a;
      `}
      border-radius: 16px;
    }

    .nicnoa-widget * {
      box-sizing: border-box;
    }

    .nicnoa-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
    }

    .nicnoa-title {
      font-size: 24px;
      font-weight: 700;
      margin: 0;
    }

    .nicnoa-badge {
      background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
      color: white;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }

    .nicnoa-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
    }

    .nicnoa-product {
      ${theme === 'dark' ? `
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
      ` : `
        background: #f9f9f9;
        border: 1px solid #eee;
      `}
      border-radius: 12px;
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .nicnoa-product:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(168, 85, 247, 0.2);
    }

    .nicnoa-product-image {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
      background: ${theme === 'dark' ? '#1a1a2e' : '#f0f0f0'};
    }

    .nicnoa-product-info {
      padding: 16px;
    }

    .nicnoa-product-title {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 8px 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .nicnoa-product-price {
      font-size: 20px;
      font-weight: 700;
      color: #a855f7;
      margin-bottom: 12px;
    }

    .nicnoa-product-btn {
      width: 100%;
      padding: 12px 16px;
      background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s;
    }

    .nicnoa-product-btn:hover {
      opacity: 0.9;
    }

    .nicnoa-loading {
      text-align: center;
      padding: 48px;
      color: ${theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'};
    }

    .nicnoa-loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid transparent;
      border-top-color: #a855f7;
      border-radius: 50%;
      animation: nicnoa-spin 1s linear infinite;
      margin: 0 auto 16px;
    }

    @keyframes nicnoa-spin {
      to { transform: rotate(360deg); }
    }

    .nicnoa-error {
      text-align: center;
      padding: 48px;
      color: #ef4444;
    }

    .nicnoa-footer {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
      text-align: center;
    }

    .nicnoa-footer a {
      color: #a855f7;
      text-decoration: none;
      font-size: 12px;
    }

    .nicnoa-footer a:hover {
      text-decoration: underline;
    }
  `;

  // Create style element
  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);

  // Render loading state
  container.innerHTML = `
    <div class="nicnoa-widget">
      <div class="nicnoa-loading">
        <div class="nicnoa-loading-spinner"></div>
        <p>Produkte werden geladen...</p>
      </div>
    </div>
  `;

  // Track affiliate click
  if (affiliateToken) {
    fetch(`${API_BASE}/api/affiliate/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        salonId,
        affiliateToken,
        action: 'view',
      }),
    }).catch(() => {});
  }

  // Fetch products
  async function loadProducts() {
    try {
      const params = new URLSearchParams({
        salonId,
        limit: productsLimit.toString(),
        ...(affiliateToken && { ref: affiliateToken }),
      });

      const response = await fetch(`${API_BASE}/api/public/shop/products?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to load products');
      }

      const data = await response.json();
      renderProducts(data.products, data.salon);
    } catch (error) {
      console.error('NICNOA Shop Widget Error:', error);
      container.innerHTML = `
        <div class="nicnoa-widget">
          <div class="nicnoa-error">
            <p>Shop konnte nicht geladen werden.</p>
          </div>
        </div>
      `;
    }
  }

  // Render products
  function renderProducts(products, salon) {
    if (!products || products.length === 0) {
      container.innerHTML = `
        <div class="nicnoa-widget">
          <div class="nicnoa-error">
            <p>Keine Produkte verfügbar.</p>
          </div>
        </div>
      `;
      return;
    }

    const productCards = products.map(product => `
      <div class="nicnoa-product" data-product-id="${product.id}">
        <img 
          class="nicnoa-product-image" 
          src="${product.imageUrl || `${API_BASE}/placeholder-product.png`}" 
          alt="${escapeHtml(product.title)}"
          loading="lazy"
        />
        <div class="nicnoa-product-info">
          <h3 class="nicnoa-product-title">${escapeHtml(product.title)}</h3>
          <div class="nicnoa-product-price">${formatPrice(product.price)}</div>
          <button 
            class="nicnoa-product-btn"
            onclick="window.NICNOA_Widget.openProduct('${product.shopifyProductId}')"
          >
            Jetzt kaufen
          </button>
        </div>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="nicnoa-widget">
        <div class="nicnoa-header">
          <h2 class="nicnoa-title">${escapeHtml(salon?.name || 'Shop')}</h2>
          ${affiliateToken ? '<span class="nicnoa-badge">Empfohlen</span>' : ''}
        </div>
        <div class="nicnoa-grid">
          ${productCards}
        </div>
        <div class="nicnoa-footer">
          <a href="https://nicnoa.com" target="_blank" rel="noopener">
            Powered by NICNOA
          </a>
        </div>
      </div>
    `;
  }

  // Helper functions
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function formatPrice(price) {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  }

  // Public API
  window.NICNOA_Widget = {
    version: WIDGET_VERSION,
    
    openProduct: function(shopifyProductId) {
      // Track add to cart
      if (affiliateToken) {
        fetch(`${API_BASE}/api/affiliate/track`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            salonId,
            affiliateToken,
            action: 'click',
            productId: shopifyProductId,
          }),
        }).catch(() => {});
      }

      // Open product page
      const url = `${API_BASE}/shop/${salonId}/product/${shopifyProductId}` +
        (affiliateToken ? `?ref=${affiliateToken}` : '');
      window.open(url, '_blank');
    },

    refresh: function() {
      loadProducts();
    },
  };

  // Load products
  loadProducts();
})();

