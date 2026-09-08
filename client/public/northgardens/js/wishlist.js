/**
 * Northgardens - Wishlist Manager
 * Allows connoisseurs to save luxury harvests and move them directly to bag.
 */

class WishlistManager {
  constructor() {
    this.storageKey = "zaffran_wishlist_v1";
    this.items = this.loadWishlist();

    this.initDOM();
    this.bindEvents();
    this.updateUI();
  }

  loadWishlist() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }

  saveWishlist() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    } catch (e) {}
  }

  initDOM() {
    if (!document.getElementById("zaffran-wishlist-drawer")) {
      const html = `
        <div id="zaffran-wishlist-overlay" class="cart-overlay" aria-hidden="true"></div>
        <aside id="zaffran-wishlist-drawer" class="cart-drawer wishlist-drawer" aria-label="Wishlist Drawer" role="dialog" aria-modal="true" aria-hidden="true">
          <div class="cart-drawer-header">
            <div class="cart-drawer-title-wrap">
              <span class="cart-crown-icon">♡</span>
              <h3 class="cart-drawer-title">Saved Harvests</h3>
              <span id="wishlist-drawer-count" class="cart-item-count-badge">0 items</span>
            </div>
            <button id="wishlist-close-btn" class="cart-close-btn" aria-label="Close wishlist drawer">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <div id="wishlist-items-container" class="cart-items-list wishlist-items-list">
            <!-- Dynamic Wishlist Items -->
          </div>

          <div class="cart-drawer-footer">
            <div class="cart-action-buttons">
              <button id="wishlist-move-all-btn" class="btn-royal-gold btn-block">
                Move All to Royal Bag
              </button>
            </div>
          </div>
        </aside>
      `;

      const div = document.createElement("div");
      div.innerHTML = html;
      document.body.appendChild(div);
    }
  }

  bindEvents() {
    document.addEventListener("click", (e) => {
      // Toggle Wishlist from card button
      const btn = e.target.closest("[data-action='toggle-wishlist'], .yith-wcwl-add-button, .wishlist-heart-btn");
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        const productId = btn.dataset.productId;
        this.toggle(productId, btn);
      }

      // Open Wishlist Drawer
      const openBtn = e.target.closest("a.wishlist, [data-action='open-wishlist'], .wishlist-nav-trigger");
      if (openBtn) {
        e.preventDefault();
        this.openDrawer();
      }

      // Close Wishlist Drawer
      const closeBtn = e.target.closest("#wishlist-close-btn, #zaffran-wishlist-overlay");
      if (closeBtn) {
        e.preventDefault();
        this.closeDrawer();
      }

      // Remove from wishlist
      const removeBtn = e.target.closest(".wishlist-remove-btn");
      if (removeBtn) {
        const id = removeBtn.dataset.productId;
        this.remove(id);
      }

      // Move single item to bag
      const moveBtn = e.target.closest(".wishlist-add-to-bag-btn");
      if (moveBtn) {
        const id = moveBtn.dataset.productId;
        this.moveToBag(id);
      }

      // Move all to bag
      if (e.target.closest("#wishlist-move-all-btn")) {
        this.moveAllToBag();
      }
    });
  }

  toggle(productId, btnElement) {
    if (typeof PRODUCTS_DATA === "undefined") return;
    const product = PRODUCTS_DATA.find(p => p.id === productId);
    if (!product) return;

    const index = this.items.findIndex(p => p.id === productId);
    if (index > -1) {
      this.items.splice(index, 1);
      if (btnElement) btnElement.classList.remove("active");
      if (window.showToast) window.showToast(`Removed ${product.name} from Wishlist.`);
    } else {
      this.items.push(product);
      if (btnElement) btnElement.classList.add("active");
      if (window.showToast) window.showToast(`Saved ${product.name} to Wishlist!`);
    }

    this.saveWishlist();
    this.updateUI();
  }

  remove(productId) {
    this.items = this.items.filter(p => p.id !== productId);
    this.saveWishlist();
    this.updateUI();
  }

  moveToBag(productId) {
    const product = this.items.find(p => p.id === productId);
    if (!product) return;

    const defaultWeight = Object.keys(product.prices)[0] || "250g";
    if (window.cartManager) {
      window.cartManager.addItem(product, defaultWeight, 1);
    }
    this.remove(productId);
  }

  moveAllToBag() {
    if (this.items.length === 0) return;
    this.items.forEach(product => {
      const defaultWeight = Object.keys(product.prices)[0] || "250g";
      if (window.cartManager) {
        window.cartManager.addItem(product, defaultWeight, 1);
      }
    });

    this.items = [];
    this.saveWishlist();
    this.updateUI();
    this.closeDrawer();

    if (window.showToast) {
      window.showToast("All saved harvests moved to your Royal Bag!");
    }
  }

  openDrawer() {
    const drawer = document.getElementById("zaffran-wishlist-drawer");
    const overlay = document.getElementById("zaffran-wishlist-overlay");
    if (drawer && overlay) {
      drawer.classList.add("active");
      overlay.classList.add("active");
      document.body.classList.add("modal-open");
    }
  }

  closeDrawer() {
    const drawer = document.getElementById("zaffran-wishlist-drawer");
    const overlay = document.getElementById("zaffran-wishlist-overlay");
    if (drawer && overlay) {
      drawer.classList.remove("active");
      overlay.classList.remove("active");
      document.body.classList.remove("modal-open");
    }
  }

  updateUI() {
    const count = this.items.length;
    document.querySelectorAll(".wishlist-count, #wishlist-drawer-count").forEach(el => {
      el.textContent = `${count} ${count === 1 ? "item" : "items"}`;
    });

    // Update active state on heart buttons
    document.querySelectorAll("[data-action='toggle-wishlist'], .wishlist-heart-btn").forEach(btn => {
      const id = btn.dataset.productId;
      if (this.items.some(p => p.id === id)) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // Render drawer list
    const container = document.getElementById("wishlist-items-container");
    if (container) {
      if (this.items.length === 0) {
        container.innerHTML = `
          <div class="empty-cart-state">
            <div class="empty-cart-emblem">♡</div>
            <h4>Your Wishlist is Empty</h4>
            <p>Bookmark rare Afghan pistachios, Kashmir walnuts, or festive gift boxes for later.</p>
            <a href="shop.html" class="btn-royal-gold" onclick="window.wishlistManager.closeDrawer()">Explore Shop</a>
          </div>
        `;
        const moveAll = document.getElementById("wishlist-move-all-btn");
        if (moveAll) moveAll.disabled = true;
      } else {
        const moveAll = document.getElementById("wishlist-move-all-btn");
        if (moveAll) moveAll.disabled = false;

        container.innerHTML = this.items.map(p => {
          const startingPrice = Object.values(p.prices)[0];
          const defaultWeight = Object.keys(p.prices)[0];
          return `
            <div class="cart-item-row" data-product-id="${p.id}">
              <div class="cart-item-thumb">
                <img src="${p.images[0]}" alt="${p.name}" loading="lazy">
              </div>
              <div class="cart-item-info">
                <h4 class="cart-item-name">${p.name}</h4>
                <div class="cart-item-meta">
                  <span class="cart-item-weight">From <strong>$${startingPrice.toFixed(2)}</strong> (${defaultWeight})</span>
                </div>
                <div class="cart-item-actions wishlist-actions-row">
                  <button type="button" class="btn-small-gold wishlist-add-to-bag-btn" data-product-id="${p.id}">
                    Move to Bag
                  </button>
                  <button type="button" class="cart-item-remove-btn wishlist-remove-btn" data-product-id="${p.id}" aria-label="Remove from wishlist">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="1.8" fill="none"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join("");
      }
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    window.wishlistManager = new WishlistManager();
  });
} else {
  window.wishlistManager = new WishlistManager();
}
