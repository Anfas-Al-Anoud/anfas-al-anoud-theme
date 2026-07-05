/* Anfas Al-Anoud storefront interactions (theme.js v1.5.1) */
document.addEventListener('DOMContentLoaded', () => {
  /* ---- App-style mobile menu (bottom sheet) ---- */
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const menuSheet = document.querySelector('[data-mobile-menu]');
  const menuBackdrop = document.querySelector('[data-mobile-menu-backdrop]');
  let menuCloseTimer;

  const openMenu = () => {
    if (!menuSheet) return;
    clearTimeout(menuCloseTimer);
    menuSheet.hidden = false;
    if (menuBackdrop) menuBackdrop.hidden = false;
    requestAnimationFrame(() => {
      menuSheet.classList.add('is-open');
      menuBackdrop?.classList.add('is-open');
    });
    menuToggle?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    menuSheet.querySelector('[data-mobile-menu-close]')?.focus();
  };

  const closeMenu = () => {
    if (!menuSheet || !menuSheet.classList.contains('is-open')) return;
    menuSheet.classList.remove('is-open');
    menuBackdrop?.classList.remove('is-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    menuCloseTimer = setTimeout(() => {
      if (!menuSheet.classList.contains('is-open')) {
        menuSheet.hidden = true;
        if (menuBackdrop) menuBackdrop.hidden = true;
      }
    }, 340);
  };

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-menu-toggle], [data-mobile-menu-open]')) {
      e.preventDefault();
      openMenu();
      return;
    }
    if (e.target.closest('[data-mobile-menu-close], [data-mobile-menu-backdrop]')) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  menuSheet?.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));

  /* ---- RTL-aware carousels ---- */
  document.querySelectorAll('[data-carousel]').forEach((carousel) => {
    const track = carousel.querySelector('[data-carousel-track]');
    if (!track) return;
    const isRTL = getComputedStyle(track).direction === 'rtl';
    const slides = [...track.querySelectorAll(':scope > *')];
    const step = () => (slides[0]?.offsetWidth || 280) + 16;
    const dotsContainer = carousel.querySelector('[data-carousel-dots]');

    carousel.querySelector('[data-carousel-prev]')?.addEventListener('click', () => {
      track.scrollBy({ left: isRTL ? step() : -step(), behavior: 'smooth' });
    });
    carousel.querySelector('[data-carousel-next]')?.addEventListener('click', () => {
      track.scrollBy({ left: isRTL ? -step() : step(), behavior: 'smooth' });
    });

    if (!dotsContainer || slides.length < 2) return;

    const getVisibleCount = () => {
      const slideWidth = slides[0]?.offsetWidth || 1;
      return Math.max(1, Math.round(track.clientWidth / slideWidth));
    };

    const getPageCount = () => Math.max(1, slides.length - getVisibleCount() + 1);

    const scrollToSlide = (index) => {
      const target = slides[index];
      if (!target) return;
      target.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    };

    const renderDots = () => {
      const pageCount = getPageCount();
      dotsContainer.innerHTML = '';
      if (pageCount <= 1) return;

      for (let i = 0; i < pageCount; i += 1) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'featured-collection__dot';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-selected', 'false');
        dot.setAttribute('aria-label', `${i + 1} / ${pageCount}`);
        dot.addEventListener('click', () => {
          // #region agent log
          fetch('http://127.0.0.1:7633/ingest/ff8eed13-b12d-47e3-97c3-f819c2954f19', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '489563' },
            body: JSON.stringify({
              sessionId: '489563',
              location: 'theme.js:carousel-dot',
              message: 'dot click',
              data: { index: i, isRTL, scrollLeft: track.scrollLeft },
              timestamp: Date.now(),
              hypothesisId: 'H1',
            }),
          }).catch(() => {});
          // #endregion
          scrollToSlide(i);
        });
        dotsContainer.appendChild(dot);
      }
      updateActiveDot();
    };

    const updateActiveDot = () => {
      const dots = [...dotsContainer.querySelectorAll('.featured-collection__dot')];
      if (!dots.length) return;
      const trackRect = track.getBoundingClientRect();
      let active = 0;
      let minDist = Infinity;
      slides.forEach((slide, index) => {
        const slideRect = slide.getBoundingClientRect();
        const dist = isRTL
          ? Math.abs(slideRect.right - trackRect.right)
          : Math.abs(slideRect.left - trackRect.left);
        if (dist < minDist) {
          minDist = dist;
          active = index;
        }
      });
      active = Math.min(active, dots.length - 1);
      dots.forEach((dot, i) => {
        const on = i === active;
        dot.classList.toggle('is-active', on);
        dot.setAttribute('aria-selected', on ? 'true' : 'false');
      });
    };

    renderDots();
    track.addEventListener('scroll', updateActiveDot, { passive: true });
    window.addEventListener('resize', renderDots, { passive: true });
  });

  /* ---- Quick add from product cards ---- */
  document.addEventListener('click', (e) => {
    const qa = e.target.closest('[data-quick-add]');
    if (!qa) return;
    e.preventDefault();
    if (qa.dataset.single === 'true' && qa.dataset.variantId && window.cartDrawer) {
      qa.classList.add('is-loading');
      window.cartDrawer
        .addItem(Number(qa.dataset.variantId), 1)
        .catch(() => {
          window.location.href = qa.dataset.url;
        })
        .finally(() => qa.classList.remove('is-loading'));
    } else if (qa.dataset.url) {
      window.location.href = qa.dataset.url;
    }
  });
});
