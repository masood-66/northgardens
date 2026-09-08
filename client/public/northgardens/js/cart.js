/**
 * Northgardens - Cart, Drawer & Checkout System
 * Handles multi-weight purchasing, local storage synchronization,
 * coupon codes, free shipping goals, and simulated order completion.
 */

class CartManager {
  constructor() {
    this.storageKey = "zaffran_cart_v1";
    this.items = this.loadCart();
    this.appliedCoupon = null;
    this.freeShippingThreshold = 75.00;

    this.initDOM();
    this.bindEvents();
    this.updateUI();
  }

  loadCart() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn("Failed to load cart from localStorage", e);
      return [];
    }
  }

  saveCart() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    } catch (e) {
      console.warn("Failed to save cart to localStorage", e);
    }
  }

  initDOM() {
    // Inject Cart Drawer into DOM if not already present
    if (!document.getElementById("zaffran-cart-drawer")) {
      const drawerHTML = `
        <div id="zaffran-cart-overlay" class="cart-overlay" aria-hidden="true"></div>
        <aside id="zaffran-cart-drawer" class="cart-drawer" aria-label="Shopping Cart" role="dialog" aria-modal="true" aria-hidden="true">
          <div class="cart-drawer-header">
            <div class="cart-drawer-title-wrap">
              <span class="cart-crown-icon">👑</span>
              <h3 class="cart-drawer-title">Your Royal Bag</h3>
              <span id="cart-drawer-count" class="cart-item-count-badge">0 items</span>
            </div>
            <button id="cart-close-btn" class="cart-close-btn" aria-label="Close cart drawer">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <!-- Free Shipping Tracker -->
          <div class="shipping-tracker-card">
            <div class="shipping-tracker-label" id="shipping-tracker-text">
              Add <strong id="shipping-remaining-amount">$75.00</strong> more for <strong>Complimentary Royal Express Delivery</strong>!
            </div>
            <div class="shipping-progress-bar">
              <div id="shipping-progress-fill" class="shipping-progress-fill" style="width: 0%;"></div>
            </div>
          </div>

          <!-- Cart Items Container -->
          <div id="cart-items-container" class="cart-items-list">
            <!-- Dynamic items rendered here -->
          </div>

          <!-- Cart Footer -->
          <div class="cart-drawer-footer">
            <div class="coupon-box">
              <div class="coupon-input-wrap">
                <input type="text" id="cart-coupon-input" placeholder="Promo code (Try: ROYAL10)" aria-label="Discount Coupon Code">
                <button id="cart-apply-coupon-btn" type="button" class="btn-coupon">Apply</button>
              </div>
              <div id="coupon-message" class="coupon-msg"></div>
            </div>

            <div class="cart-summary-lines">
              <div class="summary-line">
                <span>Subtotal</span>
                <span id="cart-subtotal-price">$0.00</span>
              </div>
              <div class="summary-line discount-line" id="discount-row" style="display: none;">
                <span id="discount-label">Royal Privilege Discount</span>
                <span id="cart-discount-amount">-$0.00</span>
              </div>
              <div class="summary-line">
                <span>Royal Express Shipping</span>
                <span id="cart-shipping-price">Calculated at checkout</span>
              </div>
              <div class="summary-line total-line">
                <span>Estimated Total</span>
                <span id="cart-total-price" class="cart-grand-total">$0.00</span>
              </div>
            </div>

            <div class="cart-action-buttons">
              <button id="checkout-btn" class="btn-royal-gold btn-block checkout-action-btn">
                <span>Proceed to Royal Checkout</span>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
              <a href="shop.html" class="continue-shopping-link" id="continue-shopping-btn">Explore More Harvests</a>
            </div>

            <div class="trust-guarantee-micro">
              <span>🌿 100% Organically Certified</span>
              <span>🔒 256-Bit Encrypted Checkout</span>
            </div>
          </div>
        </aside>

        <!-- Simulated Checkout Modal -->
        <div id="checkout-modal" class="modal-overlay" aria-hidden="true">
          <div class="modal-container checkout-modal-container" role="dialog" aria-modal="true" aria-labelledby="checkout-modal-title">
            <button id="checkout-modal-close" class="modal-close-btn" aria-label="Close checkout modal">&times;</button>
            <div class="checkout-modal-content">
              <div class="checkout-modal-header">
                <span class="royal-seal">✦ NORTHGARDENS ROYAL DISPATCH ✦</span>
                <h2 id="checkout-modal-title">Complete Your Royal Order</h2>
                <p>Enjoy hand-packaged harvest fresh dry fruits delivered in temperature-sealed luxury containers.</p>
              </div>

              <form id="royal-checkout-form" class="checkout-form" onsubmit="return false;">
                <div class="form-row form-two-col">
                  <div class="form-group">
                    <label for="order-first-name">First Name *</label>
                    <input type="text" id="order-first-name" required placeholder="Lord / Lady...">
                  </div>
                  <div class="form-group">
                    <label for="order-last-name">Last Name *</label>
                    <input type="text" id="order-last-name" required placeholder="Vance">
                  </div>
                </div>

                <div class="form-row form-two-col">
                  <div class="form-group">
                    <label for="order-email">Email Address *</label>
                    <input type="email" id="order-email" required placeholder="connoisseur@estate.com">
                  </div>
                  <div class="form-group">
                    <label for="order-phone">Mobile / Phone *</label>
                    <input type="tel" id="order-phone" required placeholder="+1 (555) 019-2834">
                  </div>
                </div>

                <div class="form-group">
                  <label for="order-address">Shipping Address *</label>
                  <input type="text" id="order-address" required placeholder="Palace / Villa, Avenue Street">
                </div>

                <div class="form-row form-three-col">
                  <div class="form-group">
                    <label for="order-city">City *</label>
                    <input type="text" id="order-city" required placeholder="Beverly Hills">
                  </div>
                  <div class="form-group">
                    <label for="order-postal">Postal Code *</label>
                    <input type="text" id="order-postal" required placeholder="90210">
                  </div>
                  <div class="form-group">
                    <label for="order-country">Country *</label>
                    <select id="order-country" required>
                      <option value="US">United States</option>
                      <option value="UK">United Kingdom</option>
                      <option value="UAE">United Arab Emirates</option>
                      <option value="CA">Canada</option>
                      <option value="AU">Australia</option>
                      <option value="CH">Switzerland</option>
                    </select>
                  </div>
                </div>

                <div class="payment-selection-box">
                  <label class="form-section-title">Payment Method</label>
                  <div class="payment-options-grid">
                    <label class="payment-card-option selected">
                      <input type="radio" name="payment-method" value="card" checked>
                      <span class="opt-label">💳 Credit / Debit Card (Amex, Visa, Mastercard)</span>
                    </label>
                    <label class="payment-card-option">
                      <input type="radio" name="payment-method" value="apple_pay">
                      <span class="opt-label"> Apple Pay / Google Pay</span>
                    </label>
                    <label class="payment-card-option">
                      <input type="radio" name="payment-method" value="cod">
                      <span class="opt-label">📦 Cash on Royal Delivery (Select Regions)</span>
                    </label>
                  </div>
                </div>

                <div class="checkout-order-summary-box" id="checkout-summary-box">
                  <!-- Summary lines rendered here -->
                </div>

                <div class="checkout-form-actions">
                  <button type="submit" id="place-order-submit-btn" class="btn-royal-gold btn-block btn-lg">
                    Confirm & Dispatch Order
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Order Success Modal -->
        <div id="order-success-modal" class="modal-overlay" aria-hidden="true">
          <div class="modal-container order-success-container" role="dialog" aria-modal="true">
            <div class="success-icon-wrap">
              <span class="success-seal">👑</span>
            </div>
            <h2>Royal Order Confirmed!</h2>
            <p class="order-id-label">Order Reference: <strong id="success-order-id">#ZAF-89241</strong></p>
            <p class="success-desc">Thank you for choosing Northgardens Our master packers are hand-inspecting and sealing your dry fruit selection in nitrogen-flushed golden tins.</p>
            <div class="order-receipt-details" id="order-receipt-details">
              <!-- Rendered receipt breakdown -->
            </div>
            <div class="success-actions">
              <button id="success-continue-btn" class="btn-royal-gold">Continue Shopping</button>
            </div>
          </div>
        </div>
      `;

      const div = document.createElement("div");
      div.innerHTML = drawerHTML;
      document.body.appendChild(div);
    }
  }

  bindEvents() {
    // Open drawer triggers
    document.addEventListener("click", (e) => {
      const openBtn = e.target.closest("[data-action='open-cart'], .header-cart, .cart-trigger-btn");
      if (openBtn) {
        e.preventDefault();
        this.openDrawer();
      }

      // Close drawer trigger
      const closeBtn = e.target.closest("#cart-close-btn, #zaffran-cart-overlay, #continue-shopping-btn");
      if (closeBtn) {
        e.preventDefault();
        this.closeDrawer();
      }

      // Quantity buttons
      const qtyBtn = e.target.closest(".cart-qty-btn");
      if (qtyBtn) {
        const itemId = qtyBtn.dataset.itemId;
        const delta = parseInt(qtyBtn.dataset.delta, 10);
        this.updateQuantity(itemId, delta);
      }

      // Remove item button
      const removeBtn = e.target.closest(".cart-item-remove-btn");
      if (removeBtn) {
        const itemId = removeBtn.dataset.itemId;
        this.removeItem(itemId);
      }

      // Apply coupon button
      if (e.target.closest("#cart-apply-coupon-btn")) {
        this.applyCoupon();
      }

      // Open checkout modal
      if (e.target.closest("#checkout-btn")) {
        this.openCheckoutModal();
      }

      // Close checkout modal
      if (e.target.closest("#checkout-modal-close, #checkout-modal")) {
        if (e.target.id === "checkout-modal" || e.target.id === "checkout-modal-close") {
          this.closeCheckoutModal();
        }
      }

      // Success modal continue
      if (e.target.closest("#success-continue-btn")) {
        this.closeSuccessModal();
      }
    });

    // Form submit
    document.addEventListener("submit", (e) => {
      if (e.target.id === "royal-checkout-form") {
        e.preventDefault();
        this.processCheckout();
      }
    });

    // Keyboard ESC to close
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeDrawer();
        this.closeCheckoutModal();
        this.closeSuccessModal();
      }
    });
  }

  addItem(product, weight = "250g", quantity = 1) {
    const unitPrice = product.prices[weight] || Object.values(product.prices)[0];
    const uniqueKey = `${product.id}_${weight}`;

    const existingIndex = this.items.findIndex(item => item.uniqueKey === uniqueKey);
    if (existingIndex > -1) {
      this.items[existingIndex].quantity += quantity;
    } else {
      this.items.push({
        uniqueKey: uniqueKey,
        productId: product.id,
        name: product.name,
        category: product.categoryLabel || product.category,
        weight: weight,
        unitPrice: unitPrice,
        image: product.images[0],
        quantity: quantity
      });
    }

    this.saveCart();
    this.updateUI();
    this.openDrawer();

    if (window.showToast) {
      window.showToast(`Added ${quantity}x ${product.name} (${weight}) to your Royal Bag!`);
    }
  }

  updateQuantity(uniqueKey, delta) {
    const item = this.items.find(i => i.uniqueKey === uniqueKey);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeItem(uniqueKey);
      return;
    }

    this.saveCart();
    this.updateUI();
  }

  removeItem(uniqueKey) {
    const item = this.items.find(i => i.uniqueKey === uniqueKey);
    this.items = this.items.filter(i => i.uniqueKey !== uniqueKey);
    this.saveCart();
    this.updateUI();

    if (window.showToast && item) {
      window.showToast(`Removed ${item.name} from bag.`);
    }
  }

  calculateTotals() {
    const subtotal = this.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    let discount = 0;

    if (this.appliedCoupon) {
      discount = subtotal * this.appliedCoupon.rate;
    }

    const isFreeShipping = subtotal >= this.freeShippingThreshold || subtotal === 0;
    const shipping = isFreeShipping ? 0 : 9.50;
    const total = Math.max(0, subtotal - discount + (subtotal > 0 ? shipping : 0));

    return {
      subtotal,
      discount,
      shipping,
      isFreeShipping,
      total,
      itemCount: this.items.reduce((sum, item) => sum + item.quantity, 0)
    };
  }

  applyCoupon() {
    const input = document.getElementById("cart-coupon-input");
    const msg = document.getElementById("coupon-message");
    if (!input || !msg) return;

    const code = input.value.trim().toUpperCase();
    if (code === "ROYAL10") {
      this.appliedCoupon = { code: "ROYAL10", rate: 0.10, label: "Royal 10% Privilege Privilege" };
      msg.className = "coupon-msg success";
      msg.textContent = "✓ 10% Royal Privilege Discount applied!";
    } else if (code === "HARVEST15") {
      this.appliedCoupon = { code: "HARVEST15", rate: 0.15, label: "Harvest 15% Festive Privilege" };
      msg.className = "coupon-msg success";
      msg.textContent = "✓ 15% Grand Harvest Discount applied!";
    } else {
      this.appliedCoupon = null;
      msg.className = "coupon-msg error";
      msg.textContent = "Invalid code. Try: ROYAL10";
    }

    this.updateUI();
  }

  updateUI() {
    const totals = this.calculateTotals();

    // Update Badges on navbar
    const countBadges = document.querySelectorAll(".cart-count, #cart-drawer-count");
    countBadges.forEach(b => {
      b.textContent = totals.itemCount;
    });

    const headerTotals = document.querySelectorAll(".cart-total .woocommerce-Price-amount, .cart-nav-price");
    headerTotals.forEach(el => {
      el.textContent = `$${totals.subtotal.toFixed(2)}`;
    });

    // Update Drawer Prices
    const subtotalEl = document.getElementById("cart-subtotal-price");
    if (subtotalEl) subtotalEl.textContent = `$${totals.subtotal.toFixed(2)}`;

    const totalEl = document.getElementById("cart-total-price");
    if (totalEl) totalEl.textContent = `$${totals.total.toFixed(2)}`;

    const shippingPriceEl = document.getElementById("cart-shipping-price");
    if (shippingPriceEl) {
      if (totals.subtotal === 0) {
        shippingPriceEl.textContent = "$0.00";
      } else if (totals.isFreeShipping) {
        shippingPriceEl.innerHTML = "<span class='free-shipping-tag'>FREE (Royal Express)</span>";
      } else {
        shippingPriceEl.textContent = `$${totals.shipping.toFixed(2)}`;
      }
    }

    // Discount Row
    const discountRow = document.getElementById("discount-row");
    const discountAmountEl = document.getElementById("cart-discount-amount");
    if (discountRow && discountAmountEl) {
      if (totals.discount > 0) {
        discountRow.style.display = "flex";
        discountAmountEl.textContent = `-$${totals.discount.toFixed(2)}`;
      } else {
        discountRow.style.display = "none";
      }
    }

    // Shipping Progress Meter
    const remainingEl = document.getElementById("shipping-remaining-amount");
    const fillEl = document.getElementById("shipping-progress-fill");
    const trackerText = document.getElementById("shipping-tracker-text");

    if (remainingEl && fillEl && trackerText) {
      const percentage = Math.min(100, (totals.subtotal / this.freeShippingThreshold) * 100);
      fillEl.style.width = `${percentage}%`;

      if (totals.subtotal >= this.freeShippingThreshold) {
        trackerText.innerHTML = "✨ <strong>Congratulations!</strong> You have unlocked <strong>Free Royal Express Shipping</strong>!";
      } else {
        const remaining = (this.freeShippingThreshold - totals.subtotal).toFixed(2);
        trackerText.innerHTML = `Add <strong>$${remaining}</strong> more for <strong>Complimentary Royal Express Delivery</strong>!`;
      }
    }

    // Render Items
    const container = document.getElementById("cart-items-container");
    if (container) {
      if (this.items.length === 0) {
        container.innerHTML = `
          <div class="empty-cart-state">
            <div class="empty-cart-emblem">🌰</div>
            <h4>Your Royal Bag is Empty</h4>
            <p>Indulge in hand-selected Kashmiri mamra almonds, Jericho Medjool dates, or festive hampers.</p>
            <a href="shop.html" class="btn-royal-gold" onclick="window.cartManager.closeDrawer()">Explore Our Harvests</a>
          </div>
        `;
        const checkoutBtn = document.getElementById("checkout-btn");
        if (checkoutBtn) checkoutBtn.disabled = true;
      } else {
        const checkoutBtn = document.getElementById("checkout-btn");
        if (checkoutBtn) checkoutBtn.disabled = false;

        container.innerHTML = this.items.map(item => `
          <div class="cart-item-row" data-item-id="${item.uniqueKey}">
            <div class="cart-item-thumb">
              <img src="${item.image}" alt="${item.name}" loading="lazy">
            </div>
            <div class="cart-item-info">
              <h4 class="cart-item-name">${item.name}</h4>
              <div class="cart-item-meta">
                <span class="cart-item-weight">Weight: <strong>${item.weight}</strong></span>
                <span class="cart-item-rate">$${item.unitPrice.toFixed(2)} ea</span>
              </div>
              <div class="cart-item-actions">
                <div class="quantity-selector-micro">
                  <button type="button" class="cart-qty-btn minus" data-item-id="${item.uniqueKey}" data-delta="-1" aria-label="Decrease quantity">-</button>
                  <span class="qty-display">${item.quantity}</span>
                  <button type="button" class="cart-qty-btn plus" data-item-id="${item.uniqueKey}" data-delta="1" aria-label="Increase quantity">+</button>
                </div>
                <div class="cart-item-line-price">$${(item.unitPrice * item.quantity).toFixed(2)}</div>
                <button type="button" class="cart-item-remove-btn" data-item-id="${item.uniqueKey}" aria-label="Remove item">
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="1.8" fill="none"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            </div>
          </div>
        `).join("");
      }
    }
  }

  openDrawer() {
    const drawer = document.getElementById("zaffran-cart-drawer");
    const overlay = document.getElementById("zaffran-cart-overlay");
    if (drawer && overlay) {
      drawer.classList.add("active");
      overlay.classList.add("active");
      drawer.setAttribute("aria-hidden", "false");
      overlay.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
    }
  }

  closeDrawer() {
    const drawer = document.getElementById("zaffran-cart-drawer");
    const overlay = document.getElementById("zaffran-cart-overlay");
    if (drawer && overlay) {
      drawer.classList.remove("active");
      overlay.classList.remove("active");
      drawer.setAttribute("aria-hidden", "true");
      overlay.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
    }
  }

  openCheckoutModal() {
    if (this.items.length === 0) return;
    this.closeDrawer();

    const modal = document.getElementById("checkout-modal");
    const summaryBox = document.getElementById("checkout-summary-box");
    const totals = this.calculateTotals();

    if (summaryBox) {
      summaryBox.innerHTML = `
        <div class="checkout-review-heading">Order Summary (${totals.itemCount} items)</div>
        <div class="checkout-review-items">
          ${this.items.map(i => `
            <div class="summary-item-row">
              <span>${i.name} (${i.weight}) &times; ${i.quantity}</span>
              <span>$${(i.unitPrice * i.quantity).toFixed(2)}</span>
            </div>
          `).join("")}
        </div>
        <div class="summary-calc-block">
          <div class="calc-row"><span>Subtotal:</span> <span>$${totals.subtotal.toFixed(2)}</span></div>
          ${totals.discount > 0 ? `<div class="calc-row discount"><span>Privilege Discount:</span> <span>-$${totals.discount.toFixed(2)}</span></div>` : ""}
          <div class="calc-row"><span>Express Shipping:</span> <span>${totals.isFreeShipping ? "FREE" : "$" + totals.shipping.toFixed(2)}</span></div>
          <div class="calc-row total"><span>Total Payable:</span> <strong>$${totals.total.toFixed(2)}</strong></div>
        </div>
      `;
    }

    if (modal) {
      modal.classList.add("active");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
    }
  }

  closeCheckoutModal() {
    const modal = document.getElementById("checkout-modal");
    if (modal) {
      modal.classList.remove("active");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
    }
  }

  processCheckout() {
    const firstName = document.getElementById("order-first-name").value.trim();
    const lastName = document.getElementById("order-last-name").value.trim();
    const email = document.getElementById("order-email").value.trim();
    const address = document.getElementById("order-address").value.trim();
    const city = document.getElementById("order-city").value.trim();
    const country = document.getElementById("order-country").value;

    const totals = this.calculateTotals();
    const orderId = "ZAF-" + Math.floor(100000 + Math.random() * 900000);

    // Close checkout modal
    this.closeCheckoutModal();

    // Populate Success Modal
    const orderIdEl = document.getElementById("success-order-id");
    if (orderIdEl) orderIdEl.textContent = `#${orderId}`;

    const receiptEl = document.getElementById("order-receipt-details");
    if (receiptEl) {
      receiptEl.innerHTML = `
        <div class="receipt-card">
          <div class="receipt-header-line">
            <span>Recipient:</span> <strong>${firstName} ${lastName}</strong>
          </div>
          <div class="receipt-header-line">
            <span>Dispatch To:</span> <span>${address}, ${city} (${country})</span>
          </div>
          <div class="receipt-header-line">
            <span>Email Confirmation:</span> <span>${email}</span>
          </div>
          <hr class="receipt-divider">
          <div class="receipt-items-table">
            ${this.items.map(i => `
              <div class="receipt-table-row">
                <span>${i.name} [${i.weight}]</span>
                <span>${i.quantity} &times; $${i.unitPrice.toFixed(2)}</span>
              </div>
            `).join("")}
          </div>
          <hr class="receipt-divider">
          <div class="receipt-grand-row">
            <span>Total Paid (USD):</span>
            <strong class="gold-text">$${totals.total.toFixed(2)}</strong>
          </div>
          <div class="shipping-eta-badge">
            Estimated Delivery: <strong>2-4 Business Days via Royal Diplomatic Courier</strong>
          </div>
        </div>
      `;
    }

    const successModal = document.getElementById("order-success-modal");
    if (successModal) {
      successModal.classList.add("active");
      successModal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
    }

    // Clear cart
    this.items = [];
    this.appliedCoupon = null;
    this.saveCart();
    this.updateUI();

    // Reset Form
    const form = document.getElementById("royal-checkout-form");
    if (form) form.reset();
  }

  closeSuccessModal() {
    const modal = document.getElementById("order-success-modal");
    if (modal) {
      modal.classList.remove("active");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
    }
  }
}

// Global initialization
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    window.cartManager = new CartManager();
  });
} else {
  window.cartManager = new CartManager();
}
