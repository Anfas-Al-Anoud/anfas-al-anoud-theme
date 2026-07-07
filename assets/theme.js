/* Anfas Al-Anoud storefront interactions (theme.js v1.7.0) */

function parseGapPx(track) {
  const gap = getComputedStyle(track).gap || '0.5rem';
  const probe = document.createElement('div');
  probe.style.width = gap;
  probe.style.position = 'absolute';
  probe.style.visibility = 'hidden';
  document.body.appendChild(probe);
  const px = probe.offsetWidth || 8;
  probe.remove();
  return px;
}

function initCarousels(root = document) {
  root.querySelectorAll('[data-carousel]:not([data-carousel-init])').forEach((carousel) => {
    const track = carousel.querySelector('[data-carousel-track]');
    if (!track) return;

    carousel.setAttribute('data-carousel-init', '');

    const isRTL = getComputedStyle(track).direction === 'rtl';
    const dotsContainer = carousel.querySelector('[data-carousel-dots]');

    const getSlides = () => [...track.querySelectorAll(':scope > *')];

    const step = () => {
      const slides = getSlides();
      const gapPx = parseGapPx(track);
      return (slides[0]?.offsetWidth || 280) + gapPx;
    };

    carousel.querySelector('[data-carousel-prev]')?.addEventListener('click', () => {
      track.scrollBy({ left: isRTL ? step() : -step(), behavior: 'smooth' });
    });

    carousel.querySelector('[data-carousel-next]')?.addEventListener('click', () => {
      track.scrollBy({ left: isRTL ? -step() : step(), behavior: 'smooth' });
    });

    if (!dotsContainer) return;

    const getVisibleCount = () => {
      const slides = getSlides();
      const slideWidth = slides[0]?.offsetWidth || 1;
      return Math.max(1, Math.round(track.clientWidth / slideWidth));
    };

    const getPageCount = () => Math.max(1, getSlides().length - getVisibleCount() + 1);

    const scrollToSlide = (index) => {
      const target = getSlides()[index];
      if (!target) return;
      target.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    };

    const updateActiveDot = () => {
      const slides = getSlides();
      const dots = [...dotsContainer.querySelectorAll('.carousel__dot, .featured-collection__dot')];
      if (!dots.length || !slides.length) return;

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

    const renderDots = () => {
      const pageCount = getPageCount();
      dotsContainer.innerHTML = '';
      if (pageCount <= 1) return;

      for (let i = 0; i < pageCount; i += 1) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'carousel__dot';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-selected', 'false');
        dot.setAttribute('aria-label', `${i + 1} / ${pageCount}`);
        dot.addEventListener('click', () => scrollToSlide(i));
        dotsContainer.appendChild(dot);
      }
      updateActiveDot();
    };

    renderDots();
    track.addEventListener('scroll', updateActiveDot, { passive: true });
    window.addEventListener('resize', renderDots, { passive: true });
  });
}

window.initCarousels = initCarousels;

document.addEventListener('DOMContentLoaded', () => {
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

  initCarousels();

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
