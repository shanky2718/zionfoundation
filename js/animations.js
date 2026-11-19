/**
 * Zion Foundation - Motion & Animation Controller
 * Senior Frontend Animation & UI/UX Architecture
 */

(function () {
  'use strict';

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mark document ready for CSS animation states
  document.documentElement.classList.add('motion-ready');

  // DOM ready hook
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  function initAll() {
    initPageTransitions();
    initScrollReveal();
    initNumericalCounters();
    initProgressBarAnimations();
    initHeaderScrollController();
    initNavUnderlines();
    initCardAndButtonEnhancements();
    initGalleryAndLightboxEnhancements();
  }

  /* ==========================================================================
     1. PAGE TRANSITIONS (Smooth fade without layout shift or back-button lock)
     ========================================================================== */
  function initPageTransitions() {
    if (prefersReducedMotion) return;

    // Handle bfcache back/forward navigation
    window.addEventListener('pageshow', (event) => {
      document.body.classList.remove('page-leaving');
    });

    // Intercept internal page link clicks
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href) return;

      // Ignore anchor links on the same page, target=_blank, download, or external protocols
      if (
        href.startsWith('#') ||
        link.target === '_blank' ||
        link.hasAttribute('download') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:') ||
        e.ctrlKey || e.metaKey || e.shiftKey
      ) {
        return;
      }

      // Check if it's an internal HTML link
      const isInternal =
        href.includes('.html') ||
        href.startsWith('/') ||
        href.startsWith('./') ||
        href.startsWith('../') ||
        (!href.includes('://') && !href.startsWith('//'));

      if (isInternal) {
        // If it's a hash jump on the current page path, let browser handle it smoothly
        const url = new URL(link.href, window.location.href);
        if (url.origin === window.location.origin && url.pathname === window.location.pathname && url.search === window.location.search && url.hash) {
          return;
        }

        e.preventDefault();
        document.body.classList.add('page-leaving');
        setTimeout(() => {
          window.location.href = link.href;
        }, 180);
      }
    });
  }

  /* ==========================================================================
     2. SCROLL REVEAL OBSERVER
     ========================================================================== */
  let scrollObserver = null;

  function initScrollReveal() {
    if (prefersReducedMotion) {
      document.querySelectorAll('.scroll-reveal, .reveal, .stagger-children').forEach(el => {
        el.classList.add('revealed', 'in');
      });
      return;
    }

    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.scroll-reveal, .reveal, .stagger-children').forEach(el => {
        el.classList.add('revealed', 'in');
      });
      return;
    }

    scrollObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target;
          target.classList.add('revealed', 'in');

          // If container has stagger-children, cascade down
          if (target.classList.contains('stagger-children')) {
            Array.from(target.children).forEach((child, idx) => {
              child.style.transitionDelay = `${idx * 0.08}s`;
            });
          }

          obs.unobserve(target);
        }
      });
    }, {
      rootMargin: '0px 0px -45px 0px',
      threshold: 0.1
    });

    observeRevealElements();
  }

  function observeRevealElements() {
    if (!scrollObserver) return;
    const targets = document.querySelectorAll(
      '.scroll-reveal:not(.revealed), .reveal:not(.in), .stagger-children:not(.revealed)'
    );
    targets.forEach(el => scrollObserver.observe(el));
  }

  /* ==========================================================================
     3. NUMERICAL STATISTIC COUNTER ENGINE
     ========================================================================== */
  function initNumericalCounters() {
    if (prefersReducedMotion) {
      // Keep static text as-is
      return;
    }

    const counterElements = document.querySelectorAll('.stat-counter-animate, [data-counter-target]');
    if (!counterElements.length) return;

    if (!('IntersectionObserver' in window)) return;

    const counterObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          animateSingleCounter(el);
          obs.unobserve(el);
        }
      });
    }, {
      threshold: 0.2
    });

    counterElements.forEach(el => counterObserver.observe(el));
  }

  function animateSingleCounter(el) {
    const originalText = el.getAttribute('data-counter-target') || el.textContent.trim();
    if (el.dataset.hasAnimated === 'true' && el.dataset.animatedTarget === originalText) return;
    el.dataset.hasAnimated = 'true';
    el.dataset.animatedTarget = originalText;

    const match = originalText.match(/^([^\d]*)([\d,.]+)(.*)$/);
    if (!match) return;

    const prefix = match[1] || '';
    const rawNumStr = match[2].replace(/,/g, '');
    const suffix = match[3] || '';
    const targetVal = parseFloat(rawNumStr);
    if (isNaN(targetVal)) return;

    const hasComma = match[2].includes(',');
    const duration = 1400; // ms
    const startTime = performance.now();
    const locale = prefix.includes('₹') ? 'en-IN' : 'en-US';

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth easeOutCubic curve
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.floor(easeProgress * targetVal);

      let formattedNum = currentVal.toString();
      if (hasComma) {
        formattedNum = currentVal.toLocaleString(locale);
      }

      el.textContent = `${prefix}${formattedNum}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        el.textContent = originalText; // Ensure exact final string
      }
    }

    requestAnimationFrame(updateCounter);
  }

  /* ==========================================================================
     4. CAMPAIGN PROGRESS BAR ANIMATION
     ========================================================================== */
  function initProgressBarAnimations() {
    const bar = document.getElementById('progBarFill');
    if (!bar) return;

    let targetWidth = bar.getAttribute('data-target-width');
    if (!targetWidth || targetWidth === '0%') {
      targetWidth = bar.style.width || '0%';
    }
    if (targetWidth && targetWidth !== '0%') {
      bar.setAttribute('data-target-width', targetWidth);
    } else {
      targetWidth = '73%';
    }

    if (prefersReducedMotion) {
      bar.style.width = targetWidth;
      return;
    }

    // Set initial width to 0% for smooth reveal
    bar.style.width = '0%';

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            bar.style.width = targetWidth;
          }, 150);
          obs.unobserve(bar);
        }
      });
    }, { threshold: 0.1 });

    observer.observe(bar);
  }

  /* ==========================================================================
     5. HEADER SCROLL CONTROLLER
     ========================================================================== */
  function initHeaderScrollController() {
    const header = document.getElementById('siteHeader');
    if (!header) return;

    let ticking = false;

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          const isScrolled = window.scrollY > 40;
          const brand = document.getElementById('brandName');
          const navButtons = document.querySelectorAll('.nav-btn');
          const mobileBtn = document.getElementById('mobileMenuOpenBtn') || document.getElementById('mobileMenuBtn');

          if (isScrolled) {
            header.classList.add('bg-background/90', 'backdrop-blur-md', 'shadow-sm', 'border-b', 'border-border');
            header.classList.remove('bg-transparent');
            if (brand) {
              brand.classList.remove('text-primary-foreground');
              brand.classList.add('text-foreground');
            }
            if (mobileBtn) {
              mobileBtn.classList.remove('text-primary-foreground');
              mobileBtn.classList.add('text-foreground');
            }
            navButtons.forEach(btn => {
              btn.classList.remove('text-primary-foreground/85', 'hover:bg-white/10');
              btn.classList.add('text-foreground/80', 'hover:text-foreground', 'hover:bg-secondary');
            });
          } else {
            // Check if page has dark hero background at the top (like index.html)
            const hasDarkHero = document.querySelector('section#top') !== null;
            if (hasDarkHero) {
              header.classList.remove('bg-background/90', 'backdrop-blur-md', 'shadow-sm', 'border-b', 'border-border');
              header.classList.add('bg-transparent');
              if (brand) {
                brand.classList.remove('text-foreground');
                brand.classList.add('text-primary-foreground');
              }
              if (mobileBtn) {
                mobileBtn.classList.remove('text-foreground');
                mobileBtn.classList.add('text-primary-foreground');
              }
              navButtons.forEach(btn => {
                btn.classList.remove('text-foreground/80', 'hover:text-foreground', 'hover:bg-secondary');
                btn.classList.add('text-primary-foreground/85', 'hover:bg-white/10');
              });
            }
          }

          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ==========================================================================
     6. NAVIGATION UNDERLINES
     ========================================================================== */
  function initNavUnderlines() {
    const navItems = document.querySelectorAll('.nav-btn, header nav a');
    navItems.forEach(item => {
      item.classList.add('nav-link-motion');
    });
  }

  /* ==========================================================================
     7. CARD & BUTTON ENHANCEMENTS
     ========================================================================== */
  function initCardAndButtonEnhancements() {
    // Buttons with arrows
    const buttonsWithSvg = document.querySelectorAll('button:has(svg), a:has(svg)');
    buttonsWithSvg.forEach(btn => {
      btn.classList.add('btn-arrow-motion');
    });

    // Make tier options interactive with keyboard
    document.querySelectorAll('.tier-option, .tier-card').forEach(t => {
      if (!t.getAttribute('tabindex')) {
        t.setAttribute('tabindex', '0');
      }
      t.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          t.click();
        }
      });
    });
  }

  /* ==========================================================================
     8. GALLERY & LIGHTBOX ENHANCEMENTS
     ========================================================================== */
  function initGalleryAndLightboxEnhancements() {
    // Add smooth arrow bounce on hover for gallery nav buttons
    document.querySelectorAll('.gallery-nav-btn, .loyals-lightbox-nav').forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        btn.style.transform = btn.classList.contains('prev') ? 'translateX(-3px)' : 'translateX(3px)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ==========================================================================
     9. PUBLIC HOOK FOR VERTICAL DYNAMIC RENDERS (in program.html)
     ========================================================================== */
  window.reinitVerticalAnimations = function () {
    observeRevealElements();
    initNumericalCounters();
    initProgressBarAnimations();
    initCardAndButtonEnhancements();
  };

})();
