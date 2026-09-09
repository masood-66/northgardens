/**
 * Northgardens - Ambient Floating Leaves & Botanical Motion Engine
 * A high-performance canvas simulation rendering luxury floating almond leaves,
 * pistachio foliage, and golden autumn petals with natural swaying physics.
 */

class FloatingBotanicals {
  constructor(canvasId = "ambient-leaves-canvas", options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      this.canvas = document.createElement("canvas");
      this.canvas.id = canvasId;
      this.canvas.className = "ambient-leaves-canvas";
      document.body.prepend(this.canvas);
    }

    this.ctx = this.canvas.getContext("2d");
    this.leafImage = new Image();
    this.leafImage.src = "../assets/red-maple-leaf-upside-down.png";
    this.particles = [];
    this.isRunning = true;
    this.density = options.density || "subtle"; // 'subtle', 'lush', 'minimal'
    this.mouse = { x: -1000, y: -1000, vx: 0, vy: 0, lastX: 0, lastY: 0 };
    this.scrollSpeed = 0;
    this.lastScrollY = window.scrollY;
    this.wind = { current: 0.3, target: 0.3, counter: 0 };

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener("resize", () => this.resize(), { passive: true });

    // Track mouse movement for wind gust effect
    window.addEventListener("mousemove", (e) => {
      this.mouse.vx = (e.clientX - this.mouse.lastX) * 0.15;
      this.mouse.vy = (e.clientY - this.mouse.lastY) * 0.15;
      this.mouse.lastX = e.clientX;
      this.mouse.lastY = e.clientY;
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    }, { passive: true });

    // Track scroll for parallax drift
    window.addEventListener("scroll", () => {
      const currentY = window.scrollY;
      this.scrollSpeed = (currentY - this.lastScrollY) * 0.08;
      this.lastScrollY = currentY;
    }, { passive: true });

    // Handle visibility change to save CPU
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.isRunning = false;
      } else {
        this.isRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame(this.animate.bind(this));
      }
    });

    this.createParticles();
    this.lastTime = performance.now();
    requestAnimationFrame(this.animate.bind(this));

    this.createControlsUI();
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.scale(dpr, dpr);
  }

  getParticleCount() {
    const isMobile = this.width < 768;
    if (this.density === "off") return 0;
    if (this.density === "minimal") return isMobile ? 8 : 15;
    if (this.density === "lush") return isMobile ? 22 : 45;
    return isMobile ? 14 : 26; // 'subtle' default
  }

  createParticles() {
    const count = this.getParticleCount();
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push(this.spawnParticle(true));
    }
  }

  spawnParticle(initial = false) {
    const types = ["japanese_maple", "ginkgo_leaf", "oak_leaf", "autumn_leaf"];
    const type = types[Math.floor(Math.random() * types.length)];

    // Color palettes for luxury botanical theme
    let colorScheme;
    if (type === "japanese_maple") {
      colorScheme = {
        primary: "rgba(218, 68, 42, 0.82)",
        secondary: "rgba(142, 35, 28, 0.66)",
        vein: "rgba(255, 194, 118, 0.9)"
      };
    } else if (type === "ginkgo_leaf") {
      colorScheme = {
        primary: "rgba(244, 190, 45, 0.82)",
        secondary: "rgba(178, 114, 18, 0.62)",
        vein: "rgba(255, 229, 128, 0.9)"
      };
    } else if (type === "oak_leaf") {
      colorScheme = {
        primary: "rgba(134, 83, 38, 0.78)",
        secondary: "rgba(79, 48, 25, 0.64)",
        vein: "rgba(237, 176, 81, 0.9)"
      };
    } else {
      colorScheme = {
        primary: "rgba(197, 116, 45, 0.78)",
        secondary: "rgba(120, 57, 29, 0.6)",
        vein: "rgba(255, 207, 128, 0.86)"
      };
    }

    const size = Math.random() * 24 + 18;
    const depth = Math.random() * 0.7 + 0.3; // 0.3 = far away, 1.0 = foreground
    const canopySide = Math.random() < 0.5;
    const canopyX = canopySide
      ? Math.random() * this.width * 0.32
      : this.width * (0.68 + Math.random() * 0.32);

    return {
      x: initial ? canopyX : Math.random() * this.width,
      y: initial ? Math.random() * this.height : -50,
      size: size * depth,
      depth: depth,
      type: type,
      colors: colorScheme,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      pitch: Math.random() * Math.PI,
      pitchSpeed: Math.random() * 0.02 + 0.01,
      swayOffset: Math.random() * Math.PI * 2,
      swaySpeed: Math.random() * 0.015 + 0.008,
      speedY: (Math.random() * 0.7 + 0.5) * depth,
      speedX: (Math.random() * 0.4 + 0.2),
      opacity: (Math.random() * 0.28 + 0.58) * depth
    };
  }

  update(delta) {
    // Slowly modulate gentle breeze
    this.wind.counter += 0.008;
    this.wind.current = Math.sin(this.wind.counter) * 0.6 + 0.4;

    // Decay scroll speed
    this.scrollSpeed *= 0.92;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Base gravity & gentle drift
      p.y += p.speedY + this.scrollSpeed;
      p.x += Math.sin(p.swayOffset) * p.speedX + this.wind.current * p.depth;

      // Update angles for 3D tumbling leaf simulation
      p.swayOffset += p.swaySpeed;
      p.rotation += p.rotationSpeed;
      p.pitch += p.pitchSpeed;

      // Mouse deflection interaction
      const dx = p.x - this.mouse.x;
      const dy = p.y - this.mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 140;

      if (dist < maxDist && dist > 0) {
        const force = (1 - dist / maxDist) * 1.8;
        p.x += (dx / dist) * force * 3 + this.mouse.vx * 0.4;
        p.y += (dy / dist) * force * 3 + this.mouse.vy * 0.4;
        p.rotation += 0.05;
      }

      // Wrap around bounds
      if (p.y > this.height + 60) {
        p.y = -40;
        p.x = Math.random() * this.width;
      } else if (p.y < -60) {
        p.y = this.height + 40;
      }

      if (p.x > this.width + 60) {
        p.x = -40;
      } else if (p.x < -60) {
        p.x = this.width + 40;
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      this.drawLeaf(p);
    }
  }

  drawLeaf(p) {
    const ctx = this.ctx;
    ctx.save();

    // Translate to center of particle
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation + Math.PI);

    // Realistic 3D flutter: scaling on x-axis using cosine of pitch
    const foldFactor = Math.cos(p.pitch);
    ctx.scale(foldFactor, 1);

    ctx.globalAlpha = p.opacity;

    // Use the supplied red maple leaf, kept small and rotated upside down.
    if (this.leafImage.complete && this.leafImage.naturalWidth > 0) {
      const leafSize = Math.max(14, p.size * 0.92);
      ctx.drawImage(this.leafImage, -leafSize / 2, -leafSize / 2, leafSize, leafSize);
      ctx.restore();
      return;
    }

    // Draw a distinct botanical silhouette for each autumn leaf type.
    ctx.beginPath();
    const len = p.size;
    const w = p.size * 0.52;

    if (p.type === "japanese_maple") {
      ctx.moveTo(0, -len * .52);
      for (let i = 0; i < 7; i++) {
        const angle = -Math.PI / 2 + i * Math.PI / 3;
        const tipX = Math.cos(angle) * w;
        const tipY = Math.sin(angle) * len * .5;
        ctx.lineTo(tipX * .42, tipY * .42);
        ctx.lineTo(tipX, tipY);
      }
      ctx.closePath();
    } else if (p.type === "ginkgo_leaf") {
      ctx.moveTo(0, len * .5);
      ctx.quadraticCurveTo(-w * 1.2, 0, -w, -len * .32);
      ctx.quadraticCurveTo(0, -len * .62, w, -len * .32);
      ctx.quadraticCurveTo(w * 1.2, 0, 0, len * .5);
      ctx.closePath();
    } else if (p.type === "oak_leaf") {
      ctx.moveTo(0, -len * .5);
      ctx.bezierCurveTo(w * 1.25, -len * .25, w * .78, -len * .02, w * 1.02, len * .16);
      ctx.bezierCurveTo(w * .42, len * .18, w * .7, len * .4, 0, len * .5);
      ctx.bezierCurveTo(-w * .7, len * .4, -w * .42, len * .18, -w * 1.02, len * .16);
      ctx.bezierCurveTo(-w * .78, -len * .02, -w * 1.25, -len * .25, 0, -len * .5);
      ctx.closePath();
    } else {
      ctx.moveTo(0, -len * .5);
      ctx.bezierCurveTo(w, -len * .3, w * 1.1, len * .2, 0, len * .5);
      ctx.bezierCurveTo(-w * 1.1, len * .2, -w, -len * .3, 0, -len * .5);
      ctx.closePath();
    }

    // Gradient fill
    const grad = ctx.createLinearGradient(-w, -len * 0.5, w, len * 0.5);
    grad.addColorStop(0, p.colors.primary);
    grad.addColorStop(1, p.colors.secondary);
    ctx.fillStyle = grad;
    ctx.fill();

    // Central vein
    ctx.beginPath();
    ctx.moveTo(0, -len * 0.45);
    ctx.quadraticCurveTo(w * 0.1, 0, 0, len * 0.45);
    ctx.strokeStyle = p.colors.vein;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  animate(currentTime) {
    if (!this.isRunning) return;

    const delta = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.update(delta);
    this.draw();

    requestAnimationFrame(this.animate.bind(this));
  }

  setDensity(density) {
    this.density = density;
    this.createParticles();
    if (this.densityToggleBtn) {
      this.densityToggleBtn.setAttribute("data-density", density);
      this.densityToggleBtn.title = `Ambient Motion: ${density.toUpperCase()}`;
    }
  }

  createControlsUI() {
    const control = document.createElement("div");
    control.className = "ambient-leaves-toggle";
    control.setAttribute("role", "region");
    control.setAttribute("aria-label", "Ambient Background Controls");

    control.innerHTML = `
      <button id="leaves-toggle-btn" class="ambient-control-btn" title="Toggle Botanical Motion" aria-label="Toggle floating leaves animation">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z"/>
        </svg>
        <span class="ambient-btn-text">Ambient Drift</span>
      </button>
    `;
    document.body.appendChild(control);

    this.densityToggleBtn = document.getElementById("leaves-toggle-btn");
    const states = ["subtle", "lush", "off"];
    let currentIndex = 0;

    this.densityToggleBtn.addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % states.length;
      const nextState = states[currentIndex];
      this.setDensity(nextState);

      // Toast notification for user feedback
      if (window.showToast) {
        const labels = {
          subtle: "Ambient Drift: Delicate / Subtle",
          lush: "Ambient Drift: Rich Autumn Breeze",
          off: "Ambient Drift: Paused"
        };
        window.showToast(labels[nextState]);
      }
    });
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    window.ambientBotanicals = new FloatingBotanicals();
  });
} else {
  window.ambientBotanicals = new FloatingBotanicals();
}
