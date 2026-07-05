/*
 * Anfas Al-Anoud - store enhancements (loaded site-wide, deferred).
 * Modules: predictive search, quick view, recently viewed.
 * All data comes from native Shopify endpoints (free) or localStorage.
 */
(function () {
  const root = () => window.Shopify?.routes?.root || '/';

  function money(cents, currencyLabel) {
    const label = currencyLabel || 'د.إ.';
    const amount = ((cents || 0) / 100).toFixed(2);
    return `${amount} ${label}`;
  }

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  }

  const debounce = (fn, wait) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  };

  // Shopify subsets {% stylesheet %} CSS to each page's render tree. Sections
  // fetched via the Section Rendering API carry their CSS in a
  // <style data-section-stylesheet> element; when we inject only a fragment we
  // must adopt that style once so the injected markup is styled.
  function adoptSectionStyle(doc, id) {
    const style = doc.querySelector('style[data-section-stylesheet]');
    if (style && !document.getElementById(id)) {
      style.id = id;
      document.head.appendChild(style);
    }
  }

  /* ============================ Predictive search ============================ */
  function initPredictiveSearch() {
    const forms = document.querySelectorAll('[data-predictive-search]');
    if (!forms.length) return;

    forms.forEach((form) => {
      const input = form.querySelector('[data-predictive-input]');
      const results = form.querySelector('[data-predictive-results]');
      if (!input || !results) return;

      let controller = null;

      const close = () => {
        results.hidden = true;
        input.setAttribute('aria-expanded', 'false');
      };

      const open = () => {
        if (results.innerHTML.trim()) {
          results.hidden = false;
          input.setAttribute('aria-expanded', 'true');
        }
      };

      const activeItems = () => Array.from(results.querySelectorAll('[data-predictive-item]'));

      const moveActive = (dir) => {
        const items = activeItems();
        if (!items.length) return;
        let idx = items.findIndex((i) => i.classList.contains('is-active'));
        items.forEach((i) => i.classList.remove('is-active'));
        idx = dir > 0 ? (idx + 1) % items.length : (idx - 1 + items.length) % items.length;
        items[idx].classList.add('is-active');
        items[idx].scrollIntoView({ block: 'nearest' });
      };

      const runSearch = async (term) => {
        if (controller) controller.abort();
        controller = new AbortController();
        const params = new URLSearchParams({
          q: term,
          section_id: 'predictive-search',
          'resources[type]': 'product,collection,query',
          'resources[limit]': '6',
          'resources[limit_scope]': 'each',
        });
        try {
          const res = await fetch(`${root()}search/suggest?${params}`, { signal: controller.signal });
          if (!res.ok) return;
          const text = await res.text();
          const doc = new DOMParser().parseFromString(text, 'text/html');
          adoptSectionStyle(doc, 'predictive-section-style');
          const panel = doc.querySelector('[data-predictive-panel]');
          results.innerHTML = panel ? panel.outerHTML : '';
          open();
        } catch (err) {
          if (err.name !== 'AbortError') close();
        }
      };

      const onInput = debounce(() => {
        const term = input.value.trim();
        if (term.length < 2) {
          close();
          results.innerHTML = '';
          return;
        }
        runSearch(term);
      }, 250);

      input.addEventListener('input', onInput);
      input.addEventListener('focus', open);

      input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          moveActive(1);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          moveActive(-1);
        } else if (e.key === 'Enter') {
          const active = results.querySelector('[data-predictive-item].is-active');
          if (active) {
            e.preventDefault();
            window.location.href = active.href;
          }
        } else if (e.key === 'Escape') {
          close();
        }
      });

      document.addEventListener('click', (e) => {
        if (!form.contains(e.target)) close();
      });
    });
  }

  /* ================================ Quick view ============================== */
  function initQuickView() {
    const modal = document.querySelector('[data-quick-view-modal]');
    if (!modal) return;
    const body = modal.querySelector('[data-qv-body]');
    let lastFocus = null;

    const open = () => {
      lastFocus = document.activeElement;
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      modal.querySelector('[data-qv-close]')?.focus();
    };

    const close = () => {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      // Keep scroll locked if the cart drawer opened after an add-to-cart.
      if (!document.querySelector('[data-cart-drawer].is-open')) {
        document.body.style.overflow = '';
      }
      lastFocus?.focus();
    };

    async function load(url) {
      body.innerHTML = '<div class="quick-view__loading">…</div>';
      open();
      try {
        const res = await fetch(`${url}${url.includes('?') ? '&' : '?'}section_id=quick-view`);
        if (!res.ok) throw new Error('load failed');
        const text = await res.text();
        const doc = new DOMParser().parseFromString(text, 'text/html');
        adoptSectionStyle(doc, 'quickview-section-style');
        const view = doc.querySelector('[data-quickview]');
        if (!view) throw new Error('no view');
        body.innerHTML = view.outerHTML;
        bindProduct(body.querySelector('[data-quickview]'));
      } catch {
        close();
        window.location.href = url;
      }
    }

    function bindProduct(el) {
      if (!el) return;
      const currencyLabel = el.dataset.currencyLabel || 'د.إ.';
      const threshold = parseInt(el.dataset.threshold, 10) || 0;
      let variants = [];
      try {
        variants = JSON.parse(el.querySelector('[data-qv-json]')?.textContent || '[]');
      } catch {
        variants = [];
      }

      const groups = Array.from(el.querySelectorAll('[data-qv-option-index]'));
      const idInput = el.querySelector('[data-qv-variant-id]');
      const priceEl = el.querySelector('[data-qv-price]');
      const compareEl = el.querySelector('[data-qv-compare]');
      const addBtn = el.querySelector('[data-qv-add]');
      const addLabel = el.querySelector('[data-qv-add-label]') || addBtn;
      const errorEl = el.querySelector('[data-qv-error]');
      const qtyInput = el.querySelector('[data-qv-qty]');
      const lowStock = el.querySelector('[data-qv-low-stock]');
      const form = el.querySelector('[data-qv-form]');

      const selected = () =>
        groups.map((g) => g.querySelector('[data-qv-option-value].is-active')?.dataset.qvOptionValue ?? null);
      const findVariant = (sel) => variants.find((v) => v.options.every((o, i) => o === sel[i]));

      function update() {
        const variant = groups.length ? findVariant(selected()) : variants[0];
        if (!variant) {
          if (idInput) idInput.value = '';
          if (addBtn) {
            addBtn.disabled = true;
            if (addLabel) addLabel.textContent = addBtn.dataset.unavailableText || 'غير متوفر';
          }
          if (lowStock) lowStock.hidden = true;
          return;
        }
        if (idInput) idInput.value = variant.id;
        if (priceEl) priceEl.textContent = money(variant.price, currencyLabel);
        if (compareEl) {
          const onSale = variant.compare_at_price && variant.compare_at_price > variant.price;
          compareEl.hidden = !onSale;
          if (onSale) compareEl.textContent = money(variant.compare_at_price, currencyLabel);
        }
        if (addBtn) {
          addBtn.disabled = !variant.available;
          if (addLabel)
            addLabel.textContent = variant.available
              ? addBtn.dataset.addText || 'أضيفي للسلة'
              : addBtn.dataset.soldoutText || 'نفدت الكمية';
        }
        if (lowStock) {
          const q = variant.inventory_quantity;
          if (variant.available && variant.inventory_management && threshold > 0 && q > 0 && q <= threshold) {
            lowStock.textContent = (el.dataset.lowTemplate || 'باقٍ __N__ قطع بس!').replace('__N__', q);
            lowStock.hidden = false;
          } else {
            lowStock.hidden = true;
          }
        }
      }

      groups.forEach((g) => {
        g.addEventListener('click', (e) => {
          const btn = e.target.closest('[data-qv-option-value]');
          if (!btn) return;
          g.querySelectorAll('[data-qv-option-value]').forEach((b) => b.classList.remove('is-active'));
          btn.classList.add('is-active');
          update();
        });
      });

      el.querySelectorAll('[data-qv-qty-step]').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (!qtyInput) return;
          qtyInput.value = Math.max(1, (parseInt(qtyInput.value, 10) || 1) + parseInt(btn.dataset.qvQtyStep, 10));
        });
      });

      form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!idInput?.value || !window.cartDrawer) return;
        if (errorEl) errorEl.hidden = true;
        const qty = Math.max(1, parseInt(qtyInput?.value, 10) || 1);
        addBtn?.classList.add('is-loading');
        try {
          await window.cartDrawer.addItem(Number(idInput.value), qty);
          close();
        } catch (err) {
          if (errorEl) {
            errorEl.textContent = err.message || 'صار خطأ، حاولي مرة ثانية';
            errorEl.hidden = false;
          }
        } finally {
          addBtn?.classList.remove('is-loading');
        }
      });

      update();
    }

    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-quick-view]');
      if (trigger && trigger.dataset.url) {
        e.preventDefault();
        load(trigger.dataset.url);
        return;
      }
      if (e.target.closest('[data-qv-close]')) close();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
    });
  }

  /* ============================== Recently viewed =========================== */
  const RECENT_KEY = 'anfas:recently';
  const RECENT_MAX = 8;

  function currencyLabel() {
    return document.querySelector('[data-recently-viewed]')?.dataset.currencyLabel || 'د.إ.';
  }

  function formatRecentPrice(cents, label) {
    if (typeof cents !== 'number' || isNaN(cents)) return '';
    return money(cents, label);
  }

  function normalizeRecentPrice(price, label) {
    if (!price) return '';
    const text = String(price).trim();
    if (/AED/i.test(text)) {
      const num = text.replace(/[^\d.,]/g, '').replace(',', '.');
      const parsed = parseFloat(num);
      if (!isNaN(parsed)) return `${parsed.toFixed(2)} ${label}`;
    }
    return text;
  }

  function normalizeRecentItem(item, label) {
    if (!item || typeof item !== 'object') return item;
    const next = { ...item };
    if (typeof next.priceCents === 'number') {
      next.price = formatRecentPrice(next.priceCents, label);
    } else if (next.price) {
      next.price = normalizeRecentPrice(next.price, label);
    }
    return next;
  }

  function readRecent() {
    try {
      const raw = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
      return Array.isArray(raw) ? raw : [];
    } catch {
      return [];
    }
  }

  function initRecentlyViewed() {
    const label = currencyLabel();
    let list = readRecent().map((p) => normalizeRecentItem(p, label));

    // Record the current product (PDP) before rendering.
    const currentEl = document.querySelector('[data-recently-current]');
    let currentId = null;
    if (currentEl) {
      try {
        const snap = normalizeRecentItem(JSON.parse(currentEl.textContent), label);
        if (snap && snap.id) {
          currentId = snap.id;
          list = list.filter((p) => p.id !== snap.id);
          list.unshift(snap);
          list = list.slice(0, RECENT_MAX);
          localStorage.setItem(RECENT_KEY, JSON.stringify(list));
        }
      } catch {
        /* ignore */
      }
    } else if (list.length > 0) {
      localStorage.setItem(RECENT_KEY, JSON.stringify(list));
    }

    const section = document.querySelector('[data-recently-viewed]');
    if (!section) return;
    const grid = section.querySelector('[data-recently-grid]');
    if (!grid) return;

    const items = list.filter((p) => p.id !== currentId).slice(0, 4);
    if (items.length === 0) return;

    grid.innerHTML = items.map((p) => cardHTML(p)).join('');
    section.hidden = false;
  }

  function cardHTML(p) {
    const img = p.image
      ? `<img src="${p.image}" alt="${escapeHtml(p.title)}" loading="lazy" width="600" height="600">`
      : '';
    return `
      <article class="recently-viewed__card">
        <a href="${p.url}" class="recently-viewed__media" aria-label="${escapeHtml(p.title)}">${img}</a>
        <a href="${p.url}" class="recently-viewed__title-link"><h3 class="recently-viewed__name">${escapeHtml(p.title)}</h3></a>
        <span class="recently-viewed__price">${escapeHtml(p.price)}</span>
      </article>`;
  }

  document.addEventListener('DOMContentLoaded', () => {
    initPredictiveSearch();
    initQuickView();
    initRecentlyViewed();
  });
})();
