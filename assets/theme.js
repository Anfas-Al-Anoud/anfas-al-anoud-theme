document.addEventListener('DOMContentLoaded', () => {
  /* ---- Mobile menu (accessible) ---- */
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  const closeMenu = () => {
    mobileNav?.classList.remove('is-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  menuToggle?.addEventListener('click', () => {
    const open = mobileNav?.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (window.matchMedia('(max-width: 767px)').matches) {
      document.body.style.overflow = open ? 'hidden' : '';
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
  mobileNav?.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));

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
