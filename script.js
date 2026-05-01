/* =========================================================
   Wall explosion — scroll-driven canvas animation
   Sits above the hero; explodes away to reveal the page.
   ========================================================= */
(function () {
  const canvas = document.getElementById('wall-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const BW = 72, BH = 30, GAP = 3;
  let W, H, bricks = [], particles = [];

  function makeParticles(bx, by) {
    for (let i = 0; i < 4; i++) {
      particles.push({
        x: bx + Math.random() * BW,
        y: by + Math.random() * BH,
        vx: (Math.random() - 0.5) * 3,
        vy: -(Math.random() * 2.5 + 0.5),
        size: Math.random() * 5 + 1,
        alpha: 0.9,
        delay: Math.random() * 0.25,
        gravity: 0.07 + Math.random() * 0.05,
      });
    }
  }

  function make(col, row, ox, oy) {
    const x = ox + col * (BW + GAP) + (row % 2 === 0 ? 0 : (BW + GAP) / 2);
    const y = oy + row * (BH + GAP);
    const cx = W / 2, cy = H / 2;
    const dx = (x + BW / 2) - cx;
    const dy = (y + BH / 2) - cy;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const distNorm = dist / (Math.max(W, H) / 2);
    const speed = (1.8 - distNorm * 0.5) * (0.8 + Math.random() * 0.6);
    makeParticles(x, y);
    return {
      ox: x, oy: y, x, y,
      vx: (dx / dist) * speed,
      vy: (dy / dist) * speed * 0.8 - (Math.random() * 0.5 + 0.3),
      gravity: 0.07 + Math.random() * 0.05,
      rot: 0, spin: (Math.random() - 0.5) * 10, alpha: 1,
      delay: distNorm * 0.2 + Math.random() * 0.08,
      hue: 38 + Math.floor(Math.random() * 12),
      sat: 80 + Math.floor(Math.random() * 20),
      lum: 42 + Math.floor(Math.random() * 16),
    };
  }

  function setup() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    const cols = Math.ceil(W / (BW + GAP)) + 3;
    const rows = Math.ceil(H / (BH + GAP)) + 3;
    const gW = cols * (BW + GAP);
    const gH = rows * (BH + GAP);
    bricks = []; particles = [];
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        bricks.push(make(c, r, (W - gW) / 2, (H - gH) / 2));
  }

  function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function rr(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function drawIntact() {
    ctx.fillStyle = '#9a7a20';
    ctx.fillRect(0, 0, W, H);
    for (const b of bricks) {
      ctx.fillStyle = `hsl(${b.hue},${b.sat}%,${b.lum + 14}%)`;
      rr(b.ox, b.oy, BW, BH, 2); ctx.fill();
      const g = ctx.createLinearGradient(b.ox, b.oy, b.ox, b.oy + BH);
      g.addColorStop(0, 'rgba(255,255,255,0.18)');
      g.addColorStop(0.4, 'rgba(0,0,0,0)');
      g.addColorStop(1, 'rgba(0,0,0,0.22)');
      ctx.fillStyle = g; rr(b.ox, b.oy, BW, BH, 2); ctx.fill();
      ctx.fillStyle = `hsl(${b.hue},${b.sat}%,${b.lum - 12}%)`;
      ctx.fillRect(b.ox + BW - 3, b.oy + 2, 3, BH - 3);
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(b.ox + 2, b.oy + BH - 3, BW - 3, 3);
    }
  }

  function draw(progress) {
    ctx.clearRect(0, 0, W, H);

    // Once wall is fully gone, hide canvas so hero is fully visible
    if (progress >= 0.98) {
      canvas.style.opacity = '0';
      canvas.style.pointerEvents = 'none';
      return;
    }
    canvas.style.opacity = '1';
    canvas.style.pointerEvents = progress < 0.02 ? 'auto' : 'none';

    // White background shows through as bricks fly away
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, W, H);

    if (progress < 0.02) { drawIntact(); return; }

    // Flash
    if (progress < 0.09) {
      const f = Math.max(0, 1 - progress / 0.09) * 0.6;
      const fg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W, H) * 0.7);
      fg.addColorStop(0, `rgba(255,220,80,${f})`);
      fg.addColorStop(0.5, `rgba(255,140,20,${f * 0.35})`);
      fg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = fg; ctx.fillRect(0, 0, W, H);
    }

    // Particles
    for (const p of particles) {
      const local = Math.max(0, (progress - p.delay) / (1 - p.delay));
      const e = easeOutCubic(Math.min(1, local));
      if (e <= 0) continue;
      const pa = p.alpha * (1 - e * 0.9);
      if (pa < 0.01) continue;
      ctx.save();
      ctx.globalAlpha = pa;
      ctx.fillStyle = 'hsl(40,70%,45%)';
      ctx.beginPath();
      ctx.arc(
        p.x + p.vx * e * 100,
        p.y + p.vy * e * 80 + 0.5 * p.gravity * Math.pow(e * 80, 2),
        p.size * (1 - e * 0.5), 0, Math.PI * 2
      );
      ctx.fill();
      ctx.restore();
    }

    // Bricks
    for (const b of bricks) {
      const local = Math.max(0, (progress - b.delay) / (1 - b.delay));
      const e = easeOutQuart(Math.min(1, local));
      const t = e * 100;
      b.x = b.ox + b.vx * t;
      b.y = b.oy + b.vy * t + 0.5 * b.gravity * t * t;
      b.rot = b.spin * t * 0.4;
      b.alpha = Math.max(0, 1 - Math.pow(e, 2.5) * 1.1);
      if (b.alpha < 0.01) continue;
      ctx.save();
      ctx.translate(b.x + BW / 2, b.y + BH / 2);
      ctx.rotate(b.rot * Math.PI / 180);
      ctx.globalAlpha = b.alpha;
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 6 + e * 14;
      ctx.shadowOffsetY = 3 + e * 10;
      ctx.fillStyle = `hsl(${b.hue},${b.sat}%,${b.lum}%)`;
      rr(-BW/2, -BH/2, BW, BH, 2); ctx.fill();
      ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      const g = ctx.createLinearGradient(0, -BH/2, 0, BH/2);
      g.addColorStop(0, 'rgba(255,255,255,0.2)');
      g.addColorStop(0.5, 'rgba(0,0,0,0)');
      g.addColorStop(1, 'rgba(0,0,0,0.28)');
      ctx.fillStyle = g; rr(-BW/2, -BH/2, BW, BH, 2); ctx.fill();
      ctx.restore();
    }

    
  }

  function onScroll() {
    const section = document.getElementById('wall-section');
    if (!section) return;
    const maxScroll = section.offsetHeight - window.innerHeight;
    const scrolled = window.scrollY;
    draw(Math.min(1, scrolled / (maxScroll * 0.75)));
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { setup(); onScroll(); });
  setup();
  draw(0);
})();
(() => {
  'use strict';

  // ---- Year stamp ----
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---- Sticky header shadow on scroll ----
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---- Mobile menu ----
  const toggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');
  if (toggle && mobileNav) {
    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      mobileNav.hidden = !open;
    };
    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      setOpen(!isOpen);
    });
    mobileNav.addEventListener('click', (e) => {
      if (e.target instanceof HTMLAnchorElement) setOpen(false);
    });
    // Close menu when resizing back to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 920) setOpen(false);
    });
  }

  // ---- Portfolio filters ----
  const filterButtons = document.querySelectorAll('.filter');
  const portfolioCards = document.querySelectorAll('.portfolio-card');
  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-filter');
      filterButtons.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', String(active));
      });
      portfolioCards.forEach((card) => {
        const cat = card.getAttribute('data-cat');
        const show = target === 'all' || cat === target;
        card.classList.toggle('is-hidden', !show);
      });
    });
  });

  // ---- Scroll reveal ----
  const revealTargets = document.querySelectorAll(
    '.section-head, .two-col > *, .card, .portfolio-card, .member, .stat-card, .contact-form, .contact-list'
  );
  revealTargets.forEach((el) => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  }

  // ---- Contact form (client-side only — no backend) ----
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if (form && status) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const email = String(data.get('email') || '').trim();
      const name = String(data.get('name') || '').trim();
      const message = String(data.get('message') || '').trim();

      if (!name || !email || !message) {
        status.textContent = 'Please fill in your name, email, and a short note.';
        status.style.color = '#B58800';
        return;
      }
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!emailValid) {
        status.textContent = 'That email address looks off — mind double-checking?';
        status.style.color = '#B58800';
        return;
      }

      status.textContent = 'Thanks — your pitch is on its way. We respond to every founder within 5 business days.';
      status.style.color = '#0A0A0A';
      form.reset();
    });
  }

  // ---- Smooth scroll offset (for sticky header) ----
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (!id || id === '#' || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const headerH = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.pageYOffset - headerH - 12;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();
