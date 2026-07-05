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

    const renderDots = () => {
      const pageCount = getPageCount();
      dotsContainer.innerHTML = '';
      if (pageCount <= 1) return;

      for (let i = 0; i < pageCount; i += 1) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'featured-collection__dot';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `${i + 1} / ${pageCount}`);
        dot.addEventListener('click', () => {
          const target = slides[i];
          if (!target) return;
          const offset = isRTL ? track.scrollWidth - target.offsetLeft - track.clientWidth : target.offsetLeft;
          track.scrollTo({ left: offset, behavior: 'smooth' });
        });
        dotsContainer.appendChild(dot);
      }
      updateActiveDot();
    };

    const updateActiveDot = () => {
      const dots = [...dotsContainer.querySelectorAll('.featured-collection__dot')];
      if (!dots.length) return;
      const scrollPos = Math.abs(track.scrollLeft);
      let active = 0;
      slides.forEach((slide, index) => {
        if (slide.offsetLeft <= scrollPos + 8) active = index;
      });
      const maxActive = dots.length - 1;
      active = Math.min(active, maxActive);
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === active));
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
