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
