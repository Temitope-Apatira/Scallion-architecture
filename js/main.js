// Scanllion — site interactions
(() => {
  const header = document.querySelector('.site-header');
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('menuToggle');

  // Header background on scroll
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Mobile menu
  if (nav && toggle) {
    /** @param {boolean} open */
    const setMenu = (open) => {
      nav.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    toggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
    nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  }

  // Reveal on scroll + stat counters
  /** @param {HTMLElement} el */
  const animateCount = (el) => {
    const target = Number(el.dataset.count);
    const duration = 1600;
    const start = performance.now();
    /** @param {number} now */
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        const counter = entry.target.querySelector('[data-count]');
        if (counter instanceof HTMLElement) animateCount(counter);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
    document.querySelectorAll('[data-count]').forEach((el) => {
      if (el instanceof HTMLElement) el.textContent = el.dataset.count ?? '';
    });
  }

  // Project filters
  /** @type {NodeListOf<HTMLElement>} */
  const filters = document.querySelectorAll('.filter');
  /** @type {NodeListOf<HTMLElement>} */
  const projects = document.querySelectorAll('.project');
  filters.forEach((btn) => {
    btn.addEventListener('click', () => {
      const f = btn.dataset.filter;
      filters.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', String(active));
      });
      projects.forEach((p) => {
        const show = f === 'all' || p.dataset.category === f;
        p.classList.toggle('is-hidden', !show);
        if (show) p.classList.add('is-visible');
      });
    });
  });

  // Contact form (front-end validation; hook up to a backend/form service to send)
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if (form instanceof HTMLFormElement && status) form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;
    /** @type {NodeListOf<HTMLInputElement | HTMLTextAreaElement>} */
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach((input) => {
      const ok = input.type === 'email'
        ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())
        : input.value.trim().length > 0;
      input.closest('.field')?.classList.toggle('has-error', !ok);
      if (!ok) valid = false;
    });

    status.className = 'form-status';
    if (!valid) {
      status.textContent = 'Please complete all required fields with a valid email.';
      status.classList.add('is-error');
      return;
    }
    status.textContent = 'Thank you — your enquiry has been received. We’ll be in touch soon.';
    status.classList.add('is-success');
    form.reset();
  });

  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
