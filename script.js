/* =============================================
   CREA M'LA — INTERACTIVE JAVASCRIPT
   ============================================= */

'use strict';

// ── DOM READY ───────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollAnimations();
  initReviewSlider();
  initGalleryLightbox();
  initContactForm();
  initBackToTop();
  initHamburger();
  initSmoothScroll();
});

// ── 1. NAVBAR SCROLL EFFECT ─────────────────────
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ── 2. HAMBURGER MENU ───────────────────────────
function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  // Close menu when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    }
  });
}

// ── 3. SMOOTH SCROLL ────────────────────────────
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

// ── 4. SCROLL-TRIGGERED ANIMATIONS ──────────────
function initScrollAnimations() {
  const elements = document.querySelectorAll('[data-animate]');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el    = entry.target;
        const delay = parseInt(el.dataset.delay || 0);
        setTimeout(() => el.classList.add('is-visible'), delay);
        observer.unobserve(el);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );

  elements.forEach(el => observer.observe(el));
}

// ── 5. REVIEW SLIDER ────────────────────────────
function initReviewSlider() {
  const track     = document.getElementById('reviewsTrack');
  const prevBtn   = document.getElementById('prevBtn');
  const nextBtn   = document.getElementById('nextBtn');
  const dotsWrap  = document.getElementById('sliderDots');
  if (!track) return;

  const cards     = track.querySelectorAll('.review-card');
  const total     = cards.length;
  let current     = 0;
  let autoTimer;

  // How many cards per view
  const getPerView = () => window.innerWidth <= 768 ? 1 : window.innerWidth <= 1024 ? 2 : 3;

  // Build dots
  const buildDots = () => {
    dotsWrap.innerHTML = '';
    const pv    = getPerView();
    const pages = Math.ceil(total / pv);
    for (let i = 0; i < pages; i++) {
      const dot = document.createElement('div');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    }
  };

  const getDots  = () => Array.from(dotsWrap.querySelectorAll('.dot'));
  const getPages = () => Math.ceil(total / getPerView());

  const updateDots = () => {
    getDots().forEach((d, i) => d.classList.toggle('active', i === current));
  };

  const goTo = (index) => {
    const pv    = getPerView();
    const pages = getPages();
    current     = Math.max(0, Math.min(index, pages - 1));
    const cardW = cards[0].offsetWidth + 28; // card width + gap
    track.style.transform = `translateX(-${current * pv * cardW}px)`;
    updateDots();
  };

  const next = () => goTo(current + 1 >= getPages() ? 0 : current + 1);
  const prev = () => goTo(current - 1 < 0 ? getPages() - 1 : current - 1);

  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); resetAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { next(); resetAuto(); });

  const startAuto = () => { autoTimer = setInterval(next, 4500); };
  const resetAuto = () => { clearInterval(autoTimer); startAuto(); };

  // Swipe support
  let touchX = 0;
  track.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const diff = touchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
    resetAuto();
  }, { passive: true });

  buildDots();
  startAuto();

  window.addEventListener('resize', () => { buildDots(); goTo(0); }, { passive: true });
}

// ── 6. GALLERY LIGHTBOX ─────────────────────────
function initGalleryLightbox() {
  const lightbox     = document.getElementById('lightbox');
  const lightboxImg  = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  if (!lightbox) return;

  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (!img) return;
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  };

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
}

// ── 7. CONTACT FORM ─────────────────────────────
function initContactForm() {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  const submitBtn = document.getElementById('submitBtn');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Basic validation
    const name  = form.querySelector('#name');
    const email = form.querySelector('#email');
    let valid   = true;

    [name, email].forEach(field => {
      field.style.borderColor = '';
      if (!field.value.trim()) {
        field.style.borderColor = '#f87171';
        valid = false;
      }
    });

    if (!valid) {
      name.focus();
      return;
    }

    // Simulate submit
    submitBtn.disabled   = true;
    submitBtn.innerHTML  = '<i class="fas fa-spinner fa-spin"></i> Sending...';

    setTimeout(() => {
      form.reset();
      submitBtn.disabled   = false;
      submitBtn.innerHTML  = '<i class="fas fa-paper-plane"></i> Send Message';
      if (success) {
        success.style.display = 'block';
        setTimeout(() => { success.style.display = 'none'; }, 5000);
      }
    }, 1800);
  });
}

// ── 8. BACK TO TOP ──────────────────────────────
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ── 9. PARALLAX SUBTLE EFFECT ON HERO ───────────
window.addEventListener('scroll', () => {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const scrolled = window.scrollY;
  if (scrolled < window.innerHeight) {
    const shapes = document.querySelectorAll('.hero-bg-shapes .shape');
    shapes.forEach((s, i) => {
      const speed = 0.08 + i * 0.04;
      s.style.transform = `translateY(${scrolled * speed}px)`;
    });
  }
}, { passive: true });

// ── 10. NUMBER COUNTER ANIMATION ────────────────
(function initCounters() {
  const stats = document.querySelectorAll('.stat-num');
  if (!stats.length) return;

  const animateCount = (el) => {
    const target = el.textContent.replace(/\D/g, '');
    const suffix = el.textContent.replace(/[0-9]/g, '').trim();
    if (!target) return;

    const end      = parseInt(target, 10);
    const duration = 1600;
    const step     = 16;
    const increment = end / (duration / step);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        el.textContent = end + suffix;
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(current) + suffix;
      }
    }, step);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.8 });

  stats.forEach(stat => observer.observe(stat));
})();
