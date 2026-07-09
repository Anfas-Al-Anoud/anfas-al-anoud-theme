(function initSectionAnimations() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sections = document.querySelectorAll('[data-animate-section]');

  if (!sections.length) return;

  if (prefersReducedMotion) {
    sections.forEach((section) => {
      section.style.opacity = '1';
      section.style.transform = 'none';
    });
    return;
  }

  const runGsap = () => {
    if (!window.gsap) return false;

    if (window.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger);
    }

    sections.forEach((section) => {
      window.gsap.fromTo(
        section,
        { opacity: 0, y: 36 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 88%',
            once: true,
          },
        }
      );
    });

    return true;
  };

  const runFallback = () => {
    sections.forEach((section) => {
      section.style.opacity = '0';
      section.style.transform = 'translateY(24px)';
      section.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -5% 0px' }
    );

    sections.forEach((section) => observer.observe(section));
  };

  let started = false;
  const boot = () => {
    if (started) return;
    started = true;
    if (!runGsap()) runFallback();
  };

  const scheduleBoot = () => {
    window.addEventListener('scroll', boot, { once: true, passive: true });
    window.addEventListener('touchstart', boot, { once: true, passive: true });
    window.addEventListener('keydown', boot, { once: true });
    setTimeout(boot, 2500);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleBoot);
  } else {
    scheduleBoot();
  }
})();
