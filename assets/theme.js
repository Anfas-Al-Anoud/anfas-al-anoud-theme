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
    const step = () => (track.querySelector(':scope > *')?.offsetWidth || 280) + 20;

    carousel.querySelector('[data-carousel-prev]')?.addEventListener('click', () => {
      track.scrollBy({ left: isRTL ? step() : -step(), behavior: 'smooth' });
    });
    carousel.querySelector('[data-carousel-next]')?.addEventListener('click', () => {
      track.scrollBy({ left: isRTL ? -step() : step(), behavior: 'smooth' });
    });
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
