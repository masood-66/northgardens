/**
 * Zaffran & Co. - Quickview Modal
 * Renders rapid interactive product preview with dynamic weight options.
 */

class QuickviewManager {
  constructor() {
    this.currentProduct = null;
    this.selectedWeight = "250g";
    this.quantity = 1;

    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    if (!document.getElementById("quickview-modal")) {
      const modalHTML = `
        <div id="quickview-modal" class="modal-overlay" aria-hidden="true">
          <div class="modal-container quickview-container" role="dialog" aria-modal="true">
            <button id="quickview-close-btn" class="modal-close-btn" aria-label="Close preview">&times;</button>
            <div id="quickview-modal-body" class="quickview-body">
              <!-- Rendered dynamically -->
            </div>
          </div>
        </div>
      `;
      const div = document.createElement("div");
      div.innerHTML = modalHTML;
      document.body.appendChild(div);
    }
  }

  bindEvents() {
    document.addEventListener("click", (e) => {
      const qvBtn = e.target.closest("[data-action='quickview'], .quickview-link, .quickview-inner");
      if (qvBtn) {
        e.preventDefault();
        const prodId = qvBtn.dataset.productId;
        this.open(prodId);
      }

      if (e.target.closest("#quickview-close-btn") || e.target.id === "quickview-modal") {
        this.close();
      }

      // Quickview weight option pill
      const weightPill = e.target.closest(".qv-weight-pill");
      if (weightPill) {
        const weight = weightPill.dataset.weight;
        this.selectWeight(weight);
      }

      // Quantity controls in quickview
      const qtyBtn = e.target.closest(".qv-qty-btn");
      if (qtyBtn) {
        const delta = parseInt(qtyBtn.dataset.delta, 10);
        this.updateQuantity(delta);
      }

      // Add to bag from quickview
      if (e.target.closest("#qv-add-to-bag-btn")) {
        this.addToBag();
      }

      // Thumbnail switch
      const thumb = e.target.closest(".qv-thumb-item");
      if (thumb) {
        const fullSrc = thumb.dataset.src;
        const mainImg = document.getElementById("qv-main-image");
        if (mainImg) mainImg.src = fullSrc;
        document.querySelectorAll(".qv-thumb-item").forEach(t => t.classList.remove("active"));
        thumb.classList.add("active");
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.close();
    });
  }

  open(productId) {
    if (typeof PRODUCTS_DATA === "undefined") return;
    const product = PRODUCTS_DATA.find(p => p.id === productId);
    if (!product) return;

    this.currentProduct = product;
    this.selectedWeight = Object.keys(product.prices)[0] || "250g";
    this.quantity = 1;

    this.render();

    const modal = document.getElementById("quickview-modal");
    if (modal) {
      modal.classList.add("active");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
    }
  }

  close() {
    const modal = document.getElementById("quickview-modal");
    if (modal) {
      modal.classList.remove("active");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
    }
  }

  selectWeight(weight) {
    this.selectedWeight = weight;
    const price = this.currentProduct.prices[weight];
    const origPrice = this.currentProduct.originalPrices ? this.currentProduct.originalPrices[weight] : null;

    const priceEl = document.getElementById("qv-current-price");
    const origPriceEl = document.getElementById("qv-original-price");

    if (priceEl) priceEl.textContent = `$${price.toFixed(2)}`;
    if (origPriceEl) {
      if (origPrice) {
        origPriceEl.textContent = `$${origPrice.toFixed(2)}`;
        origPriceEl.style.display = "inline";
      } else {
        origPriceEl.style.display = "none";
      }
    }

    document.querySelectorAll(".qv-weight-pill").forEach(pill => {
      pill.classList.toggle("active", pill.dataset.weight === weight);
    });
  }

  updateQuantity(delta) {
    this.quantity = Math.max(1, this.quantity + delta);
    const qtyVal = document.getElementById("qv-qty-val");
    if (qtyVal) qtyVal.textContent = this.quantity;
  }

  addToBag() {
    if (!this.currentProduct || !window.cartManager) return;
    window.cartManager.addItem(this.currentProduct, this.selectedWeight, this.quantity);
    this.close();
  }

  render() {
    const p = this.currentProduct;
    const initialPrice = p.prices[this.selectedWeight];
    const initialOrigPrice = p.originalPrices ? p.originalPrices[this.selectedWeight] : null;
    const body = document.getElementById("quickview-modal-body");
    if (!body) return;

    body.innerHTML = `
      <div class="qv-grid">
        <div class="qv-gallery-column">
          <div class="qv-main-view">
            <span class="qv-badge">${p.badge || "Artisanal"}</span>
            <img id="qv-main-image" src="${p.images[0]}" alt="${p.name}">
          </div>
          ${p.images.length > 1 ? `
            <div class="qv-thumbnails-row">
              ${p.images.map((img, idx) => `
                <div class="qv-thumb-item ${idx === 0 ? "active" : ""}" data-src="${img}">
                  <img src="${img}" alt="${p.name} preview ${idx+1}">
                </div>
              `).join("")}
            </div>
          ` : ""}
        </div>

        <div class="qv-details-column">
          <div class="qv-category">${p.categoryLabel} &bull; ${p.origin}</div>
          <h2 class="qv-title">${p.name}</h2>
          
          <div class="qv-rating-bar">
            <span class="stars">★★★★★</span>
            <span class="rating-score">${p.rating.toFixed(1)}</span>
            <span class="reviews-count">(${p.reviewsCount} Connoisseur Reviews)</span>
          </div>

          <div class="qv-price-block">
            <span id="qv-current-price" class="qv-price">$${initialPrice.toFixed(2)}</span>
            ${initialOrigPrice ? `<span id="qv-original-price" class="qv-original-price">$${initialOrigPrice.toFixed(2)}</span>` : ""}
            <span class="qv-tax-note">Taxes included. Hand-graded guarantee.</span>
          </div>

          <p class="qv-description">${p.shortDescription}</p>

          <div class="qv-options-block">
            <label class="qv-option-label">Select Package Weight:</label>
            <div class="qv-weight-pills-row">
              ${Object.keys(p.prices).map(w => `
                <button type="button" class="qv-weight-pill ${w === this.selectedWeight ? "active" : ""}" data-weight="${w}">
                  ${w}
                </button>
              `).join("")}
            </div>
          </div>

          <div class="qv-actions-row">
            <div class="quantity-selector-micro qv-qty-box">
              <button type="button" class="qv-qty-btn minus" data-delta="-1">-</button>
              <span id="qv-qty-val" class="qty-display">${this.quantity}</span>
              <button type="button" class="qv-qty-btn plus" data-delta="1">+</button>
            </div>
            <button id="qv-add-to-bag-btn" type="button" class="btn-royal-gold qv-submit-btn">
              <span>Add to Royal Bag</span>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>

          <div class="qv-footer-links">
            <a href="product.html?id=${p.id}" class="qv-full-details-link">View Full Harvest Specifications & Nutritional Profile &rarr;</a>
          </div>
        </div>
      </div>
    `;
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    window.quickviewManager = new QuickviewManager();
  });
} else {
  window.quickviewManager = new QuickviewManager();
}
