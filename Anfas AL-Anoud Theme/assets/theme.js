document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  menuToggle?.addEventListener('click', () => {
    mobileNav?.classList.toggle('is-open');
  });

  document.querySelectorAll('[data-carousel]').forEach((carousel) => {
    const track = carousel.querySelector('[data-carousel-track]');
    const prev = carousel.querySelector('[data-carousel-prev]');
    const next = carousel.querySelector('[data-carousel-next]');
    const slideWidth = () => track?.querySelector('.featured-collection__slide')?.offsetWidth || 280;

    prev?.addEventListener('click', () => {
      track?.scrollBy({ left: -slideWidth() - 20, behavior: 'smooth' });
    });
    next?.addEventListener('click', () => {
      track?.scrollBy({ left: slideWidth() + 20, behavior: 'smooth' });
    });
  });

  const stickyAtc = document.querySelector('[data-sticky-atc]');
  const productForm = document.querySelector('#product-form');
  const stickyAdd = document.querySelector('[data-sticky-add]');

  if (stickyAtc && productForm) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        stickyAtc.hidden = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    observer.observe(productForm);
    stickyAdd?.addEventListener('click', () => {
      productForm.querySelector('[type="submit"]')?.click();
    });
  }

  document.querySelector('[data-quiz-open]')?.addEventListener('click', () => {
    document.getElementById('ai-quiz')?.scrollIntoView({ behavior: 'smooth' });
  });
});
