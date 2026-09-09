/**
 * Northgardens - Live Predictive Search Engine
 * Provides real-time matching with category filtering and visual suggestions.
 */

class SearchManager {
  constructor() {
    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    if (!document.getElementById("zaffran-search-overlay")) {
      const html = `
        <div id="zaffran-search-overlay" class="search-overlay" aria-hidden="true">
          <button id="search-close-btn" class="search-close-btn" aria-label="Close search overlay">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          
          <div class="search-modal-inner">
            <div class="search-modal-header">
              <span class="royal-seal">✦ EXPLORE OUR HARVEST RESERVE ✦</span>
              <h2>What luxury dry fruit are you seeking?</h2>
            </div>

            <div class="search-form-wrap">
              <div class="search-input-group">
                <svg class="search-icon-svg" viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input type="text" id="site-search-input" placeholder="Search Kashmiri Almonds, Medjool Dates, Snow Walnuts, Hampers..." autocomplete="off">
                <select id="search-category-filter" class="search-cat-select" aria-label="Filter category">
                  <option value="all">All Harvests</option>
                  <option value="almonds">Almonds</option>
                  <option value="dates">Medjool Dates</option>
                  <option value="pistachios">Pistachios</option>
                  <option value="walnuts">Walnuts</option>
                  <option value="cashews">Cashews</option>
                  <option value="figs">Sun-Dried Figs</option>
                  <option value="pine-nuts">Pine Nuts</option>
                  <option value="berries">Berries</option>
                  <option value="hampers">Gift Boxes</option>
                </select>
              </div>

              <div class="search-quick-tags">
                <span>Popular inquiries:</span>
                <button type="button" class="search-tag-btn" data-query="Mamra">Mamra Almonds</button>
                <button type="button" class="search-tag-btn" data-query="Medjool">Medjool Dates</button>
                <button type="button" class="search-tag-btn" data-query="Walnut">Snow Walnuts</button>
                <button type="button" class="search-tag-btn" data-query="Akbari">Akbari Pistachios</button>
                <button type="button" class="search-tag-btn" data-query="Hamper">Festive Hampers</button>
              </div>
            </div>

            <div id="search-results-box" class="search-results-container">
              <div class="search-empty-prompt">
                <p>Begin typing to explore our hand-graded reserve.</p>
              </div>
            </div>
          </div>
        </div>
      `;

      const div = document.createElement("div");
      div.innerHTML = html;
      document.body.appendChild(div);
    }
  }

  bindEvents() {
    // Open trigger
    document.addEventListener("click", (e) => {
      const trigger = e.target.closest("[data-action='open-search'], [data-nav-search='true'], .search-trigger-btn");
      if (trigger) {
        e.preventDefault();
        this.open();
      }

      if (e.target.closest("#search-close-btn") || e.target.id === "zaffran-search-overlay") {
        this.close();
      }

      const tagBtn = e.target.closest(".search-tag-btn");
      if (tagBtn) {
        const query = tagBtn.dataset.query;
        const input = document.getElementById("site-search-input");
        if (input) {
          input.value = query;
          this.executeSearch(query);
        }
      }
    });

    const input = document.getElementById("site-search-input");
    if (input) {
      input.addEventListener("input", (e) => {
        this.executeSearch(e.target.value);
      });
    }

    const catSelect = document.getElementById("search-category-filter");
    if (catSelect) {
      catSelect.addEventListener("change", () => {
        const input = document.getElementById("site-search-input");
        this.executeSearch(input ? input.value : "");
      });
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.close();
    });
  }

  open() {
    const overlay = document.getElementById("zaffran-search-overlay");
    if (overlay) {
      overlay.classList.add("active");
      overlay.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
      setTimeout(() => {
        const input = document.getElementById("site-search-input");
        if (input) input.focus();
      }, 100);
    }
  }

  close() {
    const overlay = document.getElementById("zaffran-search-overlay");
    if (overlay) {
      overlay.classList.remove("active");
      overlay.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
    }
  }

  executeSearch(term) {
    const query = (term || "").trim().toLowerCase();
    const catSelect = document.getElementById("search-category-filter");
    const category = catSelect ? catSelect.value : "all";
    const container = document.getElementById("search-results-box");
    if (!container || typeof PRODUCTS_DATA === "undefined") return;

    if (!query && category === "all") {
      container.innerHTML = `<div class="search-empty-prompt"><p>Begin typing to explore our hand-graded reserve.</p></div>`;
      return;
    }

    const matches = PRODUCTS_DATA.filter(p => {
      const matchCat = category === "all" || p.category === category;
      const matchText = !query || (
        p.name.toLowerCase().includes(query) ||
        p.shortDescription.toLowerCase().includes(query) ||
        p.origin.toLowerCase().includes(query) ||
        p.categoryLabel.toLowerCase().includes(query)
      );
      return matchCat && matchText;
    });

    if (matches.length === 0) {
      container.innerHTML = `
        <div class="search-no-results">
          <p>No royal harvests found matching "<strong>${term}</strong>".</p>
          <p class="search-suggestion">Try browsing by category: Almonds, Walnuts, Dates, or Hampers.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="search-results-grid">
        ${matches.map(p => {
          const startingPrice = Object.values(p.prices)[0];
          return `
            <a href="product.html?id=${p.id}" class="search-result-card" onclick="window.searchManager.close()">
              <div class="result-img">
                <img src="${p.images[0]}" alt="${p.name}" loading="lazy">
              </div>
              <div class="result-info">
                <span class="result-cat">${p.categoryLabel}</span>
                <h4 class="result-title">${p.name}</h4>
                <div class="result-price-row">
                  <span class="result-price">From $${startingPrice.toFixed(2)}</span>
                  <span class="result-origin">${p.origin}</span>
                </div>
              </div>
            </a>
          `;
        }).join("")}
      </div>
    `;
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    window.searchManager = new SearchManager();
  });
} else {
  window.searchManager = new SearchManager();
}
