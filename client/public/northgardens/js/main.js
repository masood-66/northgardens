/**
 * Northgardens - Core Application Scripts
 * Mobile navigation, dynamic typed text, notifications, and interactive UI.
 */

// Toast notification helper
window.showToast = function(message, duration = 3200) {
  let container = document.getElementById("zaffran-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "zaffran-toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "toast-message";
  toast.innerHTML = `
    <span class="toast-icon">✦</span>
    <span class="toast-text">${message}</span>
  `;

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, duration);
};

// Dynamic Typing Effect (Stockie Demo 2 inspired)
class TypeWriter {
  constructor(element, words, wait = 2500) {
    this.element = element;
    this.words = words;
    this.txt = "";
    this.wordIndex = 0;
    this.wait = parseInt(wait, 10);
    this.type();
    this.isDeleting = false;
  }

  type() {
    const current = this.wordIndex % this.words.length;
    const fullTxt = this.words[current];

    if (this.isDeleting) {
      this.txt = fullTxt.substring(0, this.txt.length - 1);
    } else {
      this.txt = fullTxt.substring(0, this.txt.length + 1);
    }

    this.element.innerHTML = `<span class="typed-cursor-txt">${this.txt}</span><span class="typed-cursor">|</span>`;

    let typeSpeed = 80;
    if (this.isDeleting) {
      typeSpeed /= 2;
    }

    if (!this.isDeleting && this.txt === fullTxt) {
      typeSpeed = this.wait;
      this.isDeleting = true;
    } else if (this.isDeleting && this.txt === "") {
      this.isDeleting = false;
      this.wordIndex++;
      typeSpeed = 400;
    }

    setTimeout(() => this.type(), typeSpeed);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Dynamic Typing on elements with [data-dynamic-text]
  document.querySelectorAll("[data-dynamic-text]").forEach(el => {
    const wordsAttr = el.getAttribute("data-dynamic-words");
    if (wordsAttr) {
      const words = JSON.parse(wordsAttr);
      new TypeWriter(el, words, 2200);
    }
  });

  // Sticky Header Effect
  const header = document.getElementById("masthead");
  if (header) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 40) {
        header.classList.add("header-scrolled");
      } else {
        header.classList.remove("header-scrolled");
      }
    }, { passive: true });
  }

  // Mobile Menu Drawer
  const hamburger = document.getElementById("hamburger-menu");
  const mobileMenu = document.getElementById("fullscreen-mega-menu");
  const mobileClose = document.getElementById("fullscreen-menu-close");

  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", (e) => {
      e.preventDefault();
      mobileMenu.classList.add("active");
      document.body.classList.add("modal-open");
    });
  }

  if (mobileClose && mobileMenu) {
    mobileClose.addEventListener("click", (e) => {
      e.preventDefault();
      mobileMenu.classList.remove("active");
      document.body.classList.remove("modal-open");
    });
  }

  // Back to top button
  const scrollTopBtn = document.getElementById("page-scroll-top");
  if (scrollTopBtn) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 300) {
        scrollTopBtn.classList.add("visible");
      } else {
        scrollTopBtn.classList.remove("visible");
      }
    }, { passive: true });

    scrollTopBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Newsletter Form
  document.querySelectorAll(".newsletter-form, #royal-subscribe-form").forEach(form => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const emailInput = form.querySelector("input[type='email']");
      if (emailInput && emailInput.value.trim()) {
        const email = emailInput.value.trim();
        emailInput.value = "";
        window.showToast(`Welcome to the Royal Connoisseur Circle, ${email}! Coupon ROYAL10 is now active.`);
      }
    });
  });

  // Active page navigation styling
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".main-nav a, .mobile-nav-list a").forEach(link => {
    const href = link.getAttribute("href");
    if (href === currentPath || (currentPath === "" && href === "index.html")) {
      link.classList.add("active-nav");
    }
  });
});
