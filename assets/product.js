/*
 * Anfas Al-Anoud — product page behaviour.
 * Variant selection (pill options), media gallery, quantity stepper,
 * AJAX add-to-cart (via window.cartDrawer), and product recommendations.
 */
(function () {
  const root = document.querySelector('[data-product]');

  function money(cents, currencyLabel) {
    const amount = ((cents || 0) / 100).toFixed(2);
    return `${amount} ${currencyLabel || 'د.إ.'}`;
  }

  if (root) initProduct(root);
  initRecommendations();
  initShare();

  function initProduct(el) {
    const currencyLabel = el.dataset.currencyLabel || 'د.إ.';
    let variants = [];
    try {
      variants = JSON.parse(el.querySelector('[data-product-json]')?.textContent || '[]');
    } catch {
      variants = [];
    }

    const optionGroups = Array.from(el.querySelectorAll('[data-option-index]'));
    const idInput = el.querySelector('[data-variant-id]');
    const priceEl = el.querySelector('[data-price]');
    const stickyPriceEl = document.querySelector('[data-sticky-price]');
    const compareEl = el.querySelector('[data-compare]');
    const addButton = el.querySelector('[data-add-button]');
    const addLabel = addButton?.querySelector('[data-add-label]') || addButton;
    const errorEl = el.querySelector('[data-cart-error]');
    const form = el.querySelector('[data-product-form]');
    const qtyInput = el.querySelector('[data-qty-input]');
    const lowStock = el.querySelector('[data-low-stock]');
    const threshold = parseInt(el.dataset.threshold, 10) || 0;
    const lowTemplate = el.dataset.lowTemplate || 'باقٍ __N__ قطع بس!';
    let switchMedia = () => {};

    function selectedOptions() {
      return optionGroups.map((group) => {
        const active = group.querySelector('[data-option-value].is-active');
        return active ? active.dataset.optionValue : null;
      });
    }

    function findVariant(selected) {
      return variants.find((v) => v.options.every((opt, i) => opt === selected[i]));
    }

    function updateForVariant() {
      const selected = selectedOptions();
      const variant = optionGroups.length ? findVariant(selected) : variants[0];

      if (!variant) {
        if (idInput) idInput.value = '';
        if (addButton) {
          addButton.disabled = true;
          if (addLabel) addLabel.textContent = addButton.dataset.unavailableText || 'غير متوفر';
        }
        if (lowStock) lowStock.hidden = true;
        return;
      }

      if (idInput) idInput.value = variant.id;
      const formatted = money(variant.price, currencyLabel);
      if (priceEl) priceEl.textContent = formatted;
      if (stickyPriceEl) stickyPriceEl.textContent = formatted;
      if (compareEl) {
        if (variant.compare_at_price && variant.compare_at_price > variant.price) {
          compareEl.textContent = money(variant.compare_at_price, currencyLabel);
          compareEl.hidden = false;
        } else {
          compareEl.hidden = true;
        }
      }
      if (addButton) {
        addButton.disabled = !variant.available;
        if (addLabel) {
          addLabel.textContent = variant.available
            ? addButton.dataset.addText || 'أضيفي للسلة'
            : addButton.dataset.soldoutText || 'نفدت الكمية';
        }
      }
      if (variant.featured_media_id) switchMedia(variant.featured_media_id);

      if (lowStock) {
        const q = variant.inventory_quantity;
        if (variant.available && variant.inventory_management && threshold > 0 && q > 0 && q <= threshold) {
          lowStock.textContent = lowTemplate.replace('__N__', q);
          lowStock.hidden = false;
        } else {
          lowStock.hidden = true;
        }
      }

      try {
        const url = new URL(window.location);
        url.searchParams.set('variant', variant.id);
        window.history.replaceState({}, '', url);
      } catch {
        /* ignore */
      }
    }

    optionGroups.forEach((group) => {
      group.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-option-value]');
        if (!btn) return;
        group.querySelectorAll('[data-option-value]').forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        updateForVariant();
      });
    });

    // Gallery (zoom, lightbox, video)
    switchMedia = initGallery(el);

    // Quantity stepper
    el.querySelectorAll('[data-qty-step]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!qtyInput) return;
        const next = Math.max(1, (parseInt(qtyInput.value, 10) || 1) + parseInt(btn.dataset.qtyStep, 10));
        qtyInput.value = next;
      });
    });

    // Add to cart (AJAX)
    async function submit() {
      if (!idInput?.value || !window.cartDrawer) return;
      if (errorEl) errorEl.hidden = true;
      const qty = Math.max(1, parseInt(qtyInput?.value, 10) || 1);
      addButton?.classList.add('is-loading');
      try {
        await window.cartDrawer.addItem(Number(idInput.value), qty);
      } catch (err) {
        if (errorEl) {
          errorEl.textContent = err.message || 'صار خطأ، حاولي مرة ثانية';
          errorEl.hidden = false;
        }
      } finally {
        addButton?.classList.remove('is-loading');
      }
    }

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      submit();
    });
    document.querySelector('[data-sticky-add]')?.addEventListener('click', submit);

    // Sticky add-to-cart bar visibility (mobile)
    const sticky = document.querySelector('[data-sticky-atc]');
    const observeTarget = addButton || form;
    if (sticky && observeTarget && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        ([entry]) => {
          sticky.hidden = entry.isIntersecting;
        },
        { threshold: 0, rootMargin: '0px 0px -1px 0px' }
      );
      io.observe(observeTarget);
    }

    updateForVariant();
  }

  function initGallery(root) {
    const gallery = root.querySelector('[data-product-gallery]');
    if (!gallery) return () => {};

    let mediaList = [];
    try {
      mediaList = JSON.parse(gallery.querySelector('[data-gallery-json]')?.textContent || '[]');
    } catch {
      mediaList = [];
    }

    const mainWrap = gallery.querySelector('[data-gallery-main]');
    const lightbox = root.querySelector('[data-product-lightbox]');
    const lightboxBody = lightbox?.querySelector('[data-lightbox-body]');
    let activeId = mediaList[0]?.id;
    let lightboxIndex = 0;
    const canHoverZoom = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    function mediaById(id) {
      return mediaList.find((m) => String(m.id) === String(id));
    }

    function renderMain(item) {
      if (!mainWrap || !item) return;
      activeId = item.id;
      gallery.querySelectorAll('[data-thumb]').forEach((t) => {
        const on = String(t.dataset.mediaId) === String(item.id);
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
      });

      if (item.type === 'video' && item.video?.length) {
        const src = item.video.find((s) => s.format === 'mp4') || item.video[0];
        mainWrap.innerHTML = `<div class="product-gallery__video" data-gallery-media data-media-id="${item.id}" data-media-type="video"><video class="product-gallery__video-el" controls playsinline poster="${item.preview || ''}"><source src="${src.url}" type="${src.mime_type || 'video/mp4'}"></video></div>`;
        return;
      }

      if (item.type === 'external_video' && item.external) {
        const embed = item.external.includes('youtube')
          ? item.external.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')
          : item.external;
        mainWrap.innerHTML = `<div class="product-gallery__external" data-gallery-media data-media-id="${item.id}" data-media-type="external_video"><iframe class="product-gallery__external-el" src="${embed}" allowfullscreen loading="lazy"></iframe></div>`;
        return;
      }

      const src = item.src || item.preview;
      mainWrap.innerHTML = `
        <button type="button" class="product-gallery__zoom-wrap" data-gallery-zoom data-gallery-open aria-label="تكبير">
          <img class="product-gallery__image" src="${src}" alt="${item.alt || ''}" width="1200" height="1200" loading="eager">
          <span class="product-gallery__zoom-lens" data-gallery-lens hidden aria-hidden="true"></span>
        </button>`;
      bindZoom(mainWrap.querySelector('[data-gallery-zoom]'));
    }

    function bindZoom(wrap) {
      if (!wrap || !canHoverZoom) return;
      const img = wrap.querySelector('.product-gallery__image');
      const lens = wrap.querySelector('[data-gallery-lens]');
      wrap.addEventListener('mousemove', (e) => {
        if (!img) return;
        const rect = wrap.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        img.style.setProperty('--zoom-x', `${x}%`);
        img.style.setProperty('--zoom-y', `${y}%`);
        wrap.classList.add('is-zooming');
        if (lens) {
          lens.hidden = false;
          lens.style.left = `${e.clientX - rect.left}px`;
          lens.style.top = `${e.clientY - rect.top}px`;
        }
      });
      wrap.addEventListener('mouseleave', () => {
        wrap.classList.remove('is-zooming');
        if (lens) lens.hidden = true;
      });
    }

    function openLightbox(index) {
      if (!lightbox || !lightboxBody || !mediaList.length) return;
      lightboxIndex = (index + mediaList.length) % mediaList.length;
      const item = mediaList[lightboxIndex];
      if (item.type === 'image' && item.src) {
        lightboxBody.innerHTML = `<img src="${item.src}" alt="${item.alt || ''}" width="1600" height="1600">`;
      } else if (item.type === 'video' && item.video?.length) {
        const src = item.video.find((s) => s.format === 'mp4') || item.video[0];
        lightboxBody.innerHTML = `<video controls autoplay playsinline poster="${item.preview || ''}"><source src="${src.url}" type="${src.mime_type || 'video/mp4'}"></video>`;
      } else if (item.preview) {
        lightboxBody.innerHTML = `<img src="${item.preview}" alt="${item.alt || ''}" width="1200" height="1200">`;
      }
      lightbox.hidden = false;
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      if (!lightbox) return;
      lightbox.hidden = true;
      lightbox.setAttribute('aria-hidden', 'true');
      if (lightboxBody) lightboxBody.innerHTML = '';
      if (!document.querySelector('[data-cart-drawer].is-open')) {
        document.body.style.overflow = '';
      }
    }

    gallery.querySelectorAll('[data-thumb]').forEach((thumb) => {
      thumb.addEventListener('click', () => {
        const item = mediaById(thumb.dataset.mediaId);
        if (item) renderMain(item);
      });
    });

    gallery.addEventListener('click', (e) => {
      if (e.target.closest('[data-gallery-open]')) {
        const idx = mediaList.findIndex((m) => String(m.id) === String(activeId));
        openLightbox(idx >= 0 ? idx : 0);
      }
    });

    lightbox?.querySelector('[data-lightbox-close]')?.addEventListener('click', closeLightbox);
    lightbox?.querySelector('[data-lightbox-prev]')?.addEventListener('click', () => openLightbox(lightboxIndex - 1));
    lightbox?.querySelector('[data-lightbox-next]')?.addEventListener('click', () => openLightbox(lightboxIndex + 1));
    lightbox?.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox && !lightbox.hidden) closeLightbox();
    });

    bindZoom(gallery.querySelector('[data-gallery-zoom]'));

    return (mediaId) => {
      const item = mediaById(mediaId);
      if (item) renderMain(item);
    };
  }

  function initShare() {
    const share = document.querySelector('[data-share]');
    if (!share) return;
    const title = share.dataset.title || document.title;
    const url = share.dataset.url || window.location.href;
    const nativeBtn = share.querySelector('[data-share-native]');
    const copyBtn = share.querySelector('[data-share-copy]');
    const toast = share.querySelector('[data-share-toast]');

    let toastTimer;
    const showToast = () => {
      if (!toast) return;
      toast.hidden = false;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toast.hidden = true;
      }, 2000);
    };

    if (nativeBtn && navigator.share) {
      nativeBtn.hidden = false;
      nativeBtn.addEventListener('click', () => {
        navigator.share({ title, url }).catch(() => {});
      });
    }

    copyBtn?.addEventListener('click', async () => {
      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(url);
        } else {
          const tmp = document.createElement('input');
          tmp.value = url;
          document.body.appendChild(tmp);
          tmp.select();
          document.execCommand('copy');
          document.body.removeChild(tmp);
        }
        showToast();
      } catch {
        /* ignore */
      }
    });
  }

  function initRecommendations() {
    const section = document.querySelector('[data-recommendations]');
    if (!section) return;
    const url = section.dataset.url;
    const target = section.querySelector('[data-recommendations-grid]');
    if (!url || !target) return;
    fetch(url)
      .then((r) => r.text())
      .then((text) => {
        const html = new DOMParser().parseFromString(text, 'text/html');
        const grid = html.querySelector('[data-recommendations-grid]');
        if (grid && grid.innerHTML.trim()) {
          // Adopt the section's subsetted CSS (product-card styles), since this
          // section is fetched on demand and isn't in the page render tree.
          const style = html.querySelector('style[data-section-stylesheet]');
          if (style && !document.getElementById('recs-section-style')) {
            style.id = 'recs-section-style';
            document.head.appendChild(style);
          }
          target.innerHTML = grid.innerHTML;
          window.initCarousels?.(section);
        } else {
          section.hidden = true;
        }
      })
      .catch(() => {
        section.hidden = true;
      });
  }
})();
