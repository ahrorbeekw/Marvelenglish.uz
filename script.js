/* ============================================================
   MARVEL LEARNING CENTER — PREMIUM OPTIMIZED JAVASCRIPT
   ============================================================ */

/* ── UTILITIES ──────────────────────────────────────────────── */
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function throttle(fn, limit) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
}

/* ── TOAST NOTIFICATIONS ──────────────────────────────────── */
function showToast(message, type = 'default', duration = 3000) {
  const container = document.querySelector('.toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toast.setAttribute('role', 'status');
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('leaving');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, duration);
}

/* ── SCROLL PROGRESS INDICATOR ────────────────────────────── */
(function initScrollProgress() {
  const bar = document.querySelector('.scroll-progress');
  if (!bar) return;

  const update = throttle(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = `${Math.min(progress, 100)}%`;
  }, 16);

  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ── BACK TO TOP ──────────────────────────────────────────── */
(function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;

  const toggle = throttle(() => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, 100);

  window.addEventListener('scroll', toggle, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ── SCROLL FADE ANIMATION ────────────────────────────────── */
(function initScrollFade() {
  const fadeEls = document.querySelectorAll('.fade');
  if (!fadeEls.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('show');
          observer.unobserve(e.target);
        }
      }),
      { rootMargin: '0px 0px -60px 0px', threshold: 0.05 }
    );
    fadeEls.forEach(el => observer.observe(el));
  } else {
    const revealOnScroll = () => {
      const threshold = window.innerHeight - 60;
      fadeEls.forEach(el => {
        if (el.getBoundingClientRect().top < threshold) {
          el.classList.add('show');
        }
      });
    };
    window.addEventListener('scroll', revealOnScroll, { passive: true });
    revealOnScroll();
  }
})();

/* ── CUSTOM CURSOR ────────────────────────────────────────── */
(function initCursor() {
  const dot     = document.querySelector('.cursor-dot');
  const outline = document.querySelector('.cursor-outline');
  if (!dot || !outline) return;

  // Hide cursor on touch devices
  if (window.matchMedia('(hover: none)').matches) return;

  let rafId;
  let targetX = 0, targetY = 0;
  let outlineX = 0, outlineY = 0;
  let isVisible = false;

  // Show cursor on first move
  function showCursor() {
    if (!isVisible) {
      isVisible = true;
      dot.classList.add('visible');
      outline.classList.add('visible');
    }
  }

  window.addEventListener('mousemove', (e) => {
    showCursor();
    targetX = e.clientX;
    targetY = e.clientY;
    dot.style.transform = `translate(${targetX - 5}px, ${targetY - 5}px)`;
  }, { passive: true });

  // Outline follows with smooth lerp
  function animateOutline() {
    outlineX += (targetX - outlineX) * 0.15;
    outlineY += (targetY - outlineY) * 0.15;
    outline.style.transform = `translate(${outlineX - 17.5}px, ${outlineY - 17.5}px)`;
    rafId = requestAnimationFrame(animateOutline);
  }
  rafId = requestAnimationFrame(animateOutline);

  // Interactive element hover effects
  const interactiveSelector = 'a, button, .p-card, .grid-item, .nav-link, .p-item, .filter button';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactiveSelector)) {
      outline.classList.add('cursor-active');
    }
  }, { passive: true });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactiveSelector)) {
      outline.classList.remove('cursor-active');
    }
  }, { passive: true });

  // Pause animation when tab hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else {
      rafId = requestAnimationFrame(animateOutline);
    }
  });
})();

/* ── NAVBAR ───────────────────────────────────────────────── */
(function initNavbar() {
  const nav      = document.querySelector('.apple-nav');
  const menuBtn  = document.getElementById('menuBtn');
  const navLinks = document.getElementById('navLinks');
  if (!nav || !menuBtn || !navLinks) return;

  // Scroll: add .scrolled class for shrink effect
  const onScroll = throttle(() => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, 16);
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu toggle
  function closeMenu() {
    menuBtn.classList.remove('active');
    navLinks.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  menuBtn.addEventListener('click', () => {
    const isOpen = menuBtn.classList.toggle('active');
    navLinks.classList.toggle('open', isOpen);
    menuBtn.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close mobile menu on link click
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('open') && !nav.contains(e.target)) {
      closeMenu();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      closeMenu();
      menuBtn.focus();
    }
  });

  // Active nav link on scroll (section spy)
  const sections   = document.querySelectorAll('section[id], header[id], div[id]');
  const navAnchors = navLinks.querySelectorAll('.nav-link[href^="#"]');

  const sectionSpy = throttle(() => {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) {
        current = sec.getAttribute('id');
      }
    });
    navAnchors.forEach(link => {
      const target = link.getAttribute('href').replace('#', '');
      link.classList.toggle('active',
        target === current || (current === '' && link.getAttribute('href') === '#'));
    });
  }, 80);
  window.addEventListener('scroll', sectionSpy, { passive: true });
})();

/* ── ANIMATED STAT COUNTERS ───────────────────────────────── */
(function initStatCounters() {
  const statNums = document.querySelectorAll('.stat-num[data-target]');
  if (!statNums.length) return;

  let animated = false;

  function animateCounters() {
    if (animated) return;
    animated = true;

    statNums.forEach(el => {
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      const duration = 2000;
      const start = performance.now();

      function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * target);
        el.textContent = current.toLocaleString() + suffix;

        if (progress < 1) {
          requestAnimationFrame(update);
        }
      }
      requestAnimationFrame(update);
    });
  }

  // Trigger when stats become visible
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCounters();
          observer.disconnect();
        }
      });
    }, { threshold: 0.3 });

    const statsBar = document.querySelector('.glass-stats');
    if (statsBar) observer.observe(statsBar);
  } else {
    animateCounters();
  }
})();

/* ── CERTIFICATES / MASONRY FAN ───────────────────────────── */
const certificates = [
  { type: 'cefr',  src: 'https://i.ibb.co/JRgVhgxr/64y.jpg' },
  { type: 'cefr',  src: 'https://i.ibb.co/gMmzKp61/60y.jpg' },
  { type: 'cefr',  src: 'https://i.ibb.co/JFmdgvqM/65.jpg' },
  { type: 'cefr',  src: 'https://i.ibb.co/BKPybbhC/64.jpg' },
  { type: 'cefr',  src: 'https://i.ibb.co/s964XDRK/60.jpg' },
  { type: 'cefr',  src: 'https://i.ibb.co/HLdqL0GK/60-1.jpg' },
  { type: 'ielts', src: 'https://i.ibb.co/JwdVxpNZ/7.jpg' },
  { type: 'ielts', src: 'https://i.ibb.co/pv49pVrc/7-2.jpg' },
  { type: 'ielts', src: 'https://i.ibb.co/GQY25yZx/65i.jpg' },
  { type: 'ielts', src: 'https://i.ibb.co/z3mJ2vS/6.jpg' },
  { type: 'ielts', src: 'https://i.ibb.co/nqRdJpCP/nig.jpg' },
  { type: 'ielts', src: 'https://i.ibb.co/vxcdXJRJ/iles.jpg' },
  { type: 'other', src: 'https://i.ibb.co/Pz9sFWPc/other6.jpg' },
  { type: 'other', src: 'https://i.ibb.co/TxRJKV62/other4.jpg' },
  { type: 'other', src: 'https://i.ibb.co/sJCs5zLT/other5.jpg' },
  { type: 'other', src: 'https://i.ibb.co/tp7d7Q8N/other2.jpg' },
  { type: 'other', src: 'https://i.ibb.co/WNm0FLdH/other7.jpg' },
  { type: 'other', src: 'https://i.ibb.co/ZRjGYMYs/other1.jpg' },
];

(function initCertificates() {
  const masonry = document.getElementById('masonry');
  if (!masonry) return;

  let currentFilter = 'cefr';
  let isMobile = window.innerWidth <= 768;

  function createCertCard(cert, index, total) {
    const middle = (total - 1) / 2;
    const offset = index - middle;

    const div = document.createElement('div');
    div.className = 'cert-item';

    const img = document.createElement('img');
    img.src      = cert.src;
    img.alt      = `${cert.type.toUpperCase()} Certificate`;
    img.loading  = 'lazy';
    img.decoding = 'async';
    div.appendChild(img);

    if (!isMobile) {
      const rotate     = offset * 12;
      const translateX = offset * 85;
      const translateY = Math.abs(offset) * 18;
      div.style.cssText = `
        transform: translateX(calc(-50% + ${translateX}px)) translateY(${translateY}px) rotate(${rotate}deg);
        z-index: ${100 - Math.abs(offset)};
      `;
    }

    return div;
  }

  function applyFanHover(cards, hoveredIndex, total) {
    const middle = (total - 1) / 2;
    cards.forEach((card, i) => {
      const off = i - middle;
      let extra = 0;
      if (i < hoveredIndex) extra = -38;
      if (i > hoveredIndex) extra = 38;
      card.style.transform = `translateX(calc(-50% + ${off * 85 + extra}px)) translateY(${Math.abs(off) * 18}px) rotate(${off * 12}deg)`;
    });
  }

  function resetFan(cards, total) {
    const middle = (total - 1) / 2;
    cards.forEach((card, i) => {
      const off = i - middle;
      card.style.transform = `translateX(calc(-50% + ${off * 85}px)) translateY(${Math.abs(off) * 18}px) rotate(${off * 12}deg)`;
    });
  }

  function displayCerts(filterType) {
    currentFilter = filterType;
    isMobile = window.innerWidth <= 768;

    const filtered = filterType === 'all'
      ? certificates
      : certificates.filter(c => c.type === filterType);

    const fragment = document.createDocumentFragment();
    filtered.forEach((cert, i) => {
      fragment.appendChild(createCertCard(cert, i, filtered.length));
    });

    masonry.innerHTML = '';
    masonry.appendChild(fragment);

    // Attach hover events (desktop only)
    if (!isMobile) {
      const cards = masonry.querySelectorAll('.cert-item');
      cards.forEach((card, idx) => {
        card.addEventListener('mouseenter', () => applyFanHover(cards, idx, filtered.length));
        card.addEventListener('mouseleave', () => resetFan(cards, filtered.length));
      });
    }
  }

  // Filter button click handler
  window.filterResults = function(category) {
    document.querySelectorAll('.filter button').forEach(btn => {
      const fn = btn.getAttribute('onclick') || '';
      btn.classList.toggle('active', fn.includes(`'${category}'`));
    });
    displayCerts(category);
  };

  // Debounced resize
  window.addEventListener('resize', debounce(() => {
    displayCerts(currentFilter);
  }, 250), { passive: true });

  // Initial load
  displayCerts('cefr');
})();

/* ── CONTACT FORM (EmailJS) ───────────────────────────────── */
(function initContactForm() {
  const form  = document.querySelector('.contact-form');
  if (!form) return;

  const nameEl  = document.getElementById('name');
  const phoneEl = document.getElementById('phone');
  const msgEl   = document.getElementById('msg');
  const btn     = form.querySelector('.p-submit-btn');

  if (!nameEl || !phoneEl || !msgEl || !btn) return;

  // Inline validation
  function validateField(el, message) {
    const errorEl = el.parentElement.querySelector('.field-error');
    if (!el.value.trim()) {
      el.classList.add('invalid');
      el.classList.remove('valid');
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('visible');
      }
      return false;
    }
    el.classList.remove('invalid');
    el.classList.add('valid');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('visible');
    }
    return true;
  }

  // Clear validation on input
  [nameEl, phoneEl, msgEl].forEach(el => {
    el.addEventListener('input', () => {
      if (el.value.trim()) {
        el.classList.remove('invalid');
        el.classList.add('valid');
        const errorEl = el.parentElement.querySelector('.field-error');
        if (errorEl) {
          errorEl.classList.remove('visible');
        }
      }
    }, { passive: true });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameValid  = validateField(nameEl, "Iltimos, ismingizni kiriting");
    const phoneValid = validateField(phoneEl, "Iltimos, telefon raqamingizni kiriting");
    const msgValid   = validateField(msgEl, "Iltimos, xabar yozing");

    if (!nameValid || !phoneValid || !msgValid) return;

    btn.classList.add('loading');
    btn.disabled = true;

    emailjs.send('service_q6ddda8', 'template_2gz9pt7', {
      from_name:    nameEl.value.trim(),
      phone_number: phoneEl.value.trim(),
      message:      msgEl.value.trim(),
    })
    .then(() => {
      showToast("Xabaringiz muvaffaqiyatli yuborildi!", 'success');
      nameEl.value  = '';
      phoneEl.value = '';
      msgEl.value   = '';
      [nameEl, phoneEl, msgEl].forEach(el => el.classList.remove('valid'));
    })
    .catch((err) => {
      showToast("Xatolik yuz berdi. Qayta urinib ko'ring.", 'error');
      console.error('EmailJS error:', err);
    })
    .finally(() => {
      btn.classList.remove('loading');
      btn.disabled = false;
    });
  });
})();

/* ── COPY TO CLIPBOARD (contact info) ─────────────────────── */
(function initCopyToClipboard() {
  const items = document.querySelectorAll('.p-item[data-copy]');
  if (!items.length) return;

  function handleCopy(el) {
    const text = el.dataset.copy;
    if (!text) return;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        el.classList.add('copied');
        showToast('Nusxa olindi!', 'success', 2000);
        setTimeout(() => el.classList.remove('copied'), 500);
      }).catch(() => {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;left:-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast('Nusxa olindi!', 'success', 2000);
    } catch {
      showToast("Nusxa olishda xatolik", 'error');
    }
    document.body.removeChild(ta);
  }

  items.forEach(el => {
    el.addEventListener('click', () => handleCopy(el));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleCopy(el);
      }
    });
  });
})();

/* ── KEYBOARD SHORTCUTS ───────────────────────────────────── */
(function initKeyboard() {
  document.addEventListener('keydown', (e) => {
    // Press 'T' to scroll to top
    if (e.key === 't' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const tag = e.target.tagName.toLowerCase();
      if (tag !== 'input' && tag !== 'textarea' && !e.target.isContentEditable) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  });
})();

/* ── FOOTER YEAR ──────────────────────────────────────────── */
(function initFooterYear() {
  const yearEl = document.querySelector('.footer-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();
