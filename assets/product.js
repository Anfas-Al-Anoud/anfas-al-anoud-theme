/*
 * Anfas Al-Anoud — product page behaviour.
 * Variant selection (pill options), media gallery, quantity stepper,
 * AJAX add-to-cart (via window.cartDrawer), and product recommendations.
 */
(function () {
  const root = document.querySelector('[data-product]');

  function money(cents, currency) {
    try {
      return new Intl.NumberFormat('ar-AE', { style: 'currency', currency: currency || 'AED' }).format(
        (cents || 0) / 100
      );
    } catch {
      return `${((cents || 0) / 100).toFixed(2)}`;
    }
  }

  if (root) initProduct(root);
  initRecommendations();

  function initProduct(el) {
    const currency = el.dataset.currency || 'AED';
    let variants = [];
    try {
      variants = JSON.parse(el.querySelector('[data-product-json]')?.textContent || '[]');
    } catch {
      variants = [];
    }

    const optionGroups = Array.from(el.querySelectorAll('[data-option-index]'));
    const idInput = el.querySelector('[data-variant-id]');
    const priceEl = el.querySelector('[data-price]');
    const compareEl = el.querySelector('[data-compare]');
    const addButton = el.querySelector('[data-add-button]');
    const addLabel = addButton?.querySelector('[data-add-label]') || addButton;
    const errorEl = el.querySelector('[data-cart-error]');
    const form = el.querySelector('[data-product-form]');
    const qtyInput = el.querySelector('[data-qty-input]');

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
      const variant = findVariant(selected);

      if (!variant) {
        if (idInput) idInput.value = '';
        if (addButton) {
          addButton.disabled = true;
          if (addLabel) addLabel.textContent = addButton.dataset.unavailableText || 'غير متوفر';
        }
        return;
      }

      if (idInput) idInput.value = variant.id;
      if (priceEl) priceEl.textContent = money(variant.price, currency);
      if (compareEl) {
        if (variant.compare_at_price && variant.compare_at_price > variant.price) {
          compareEl.textContent = money(variant.compare_at_price, currency);
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

    // Gallery
    function switchMedia(mediaId) {
      const thumb = el.querySelector(`[data-thumb][data-media-id="${mediaId}"]`);
      const main = el.querySelector('[data-main-media] img');
      if (thumb && main) {
        const full = thumb.dataset.full;
        if (full) {
          main.src = full;
          main.srcset = '';
        }
        el.querySelectorAll('[data-thumb]').forEach((t) => t.classList.remove('is-active'));
        thumb.classList.add('is-active');
      }
    }

    el.querySelectorAll('[data-thumb]').forEach((thumb) => {
      thumb.addEventListener('click', () => switchMedia(thumb.dataset.mediaId));
    });

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
    if (sticky && form && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        ([entry]) => {
          sticky.hidden = entry.isIntersecting;
        },
        { threshold: 0 }
      );
      io.observe(form);
    }

    updateForVariant();
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
          target.innerHTML = grid.innerHTML;
        } else {
          section.hidden = true;
        }
      })
      .catch(() => {
        section.hidden = true;
      });
  }
})();
