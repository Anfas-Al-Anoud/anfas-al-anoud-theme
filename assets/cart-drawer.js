/*
 * Anfas Al-Anoud — AJAX cart drawer.
 * Uses the Shopify Cart API (/cart/add.js, /cart/change.js, /cart.js) and
 * re-renders the drawer client-side from the returned cart JSON.
 * Exposes window.cartDrawer for the product page and quick-add buttons.
 */
class CartDrawer {
  constructor() {
    this.drawer = document.querySelector('[data-cart-drawer]');
    if (!this.drawer) return;

    this.itemsEl = this.drawer.querySelector('[data-cart-items]');
    this.subtotalEl = this.drawer.querySelector('[data-cart-subtotal]');
    this.footerEl = this.drawer.querySelector('[data-cart-footer]');
    this.countEls = document.querySelectorAll('[data-cart-count]');
    this.bar = this.drawer.querySelector('[data-free-shipping-bar]');
    this.threshold = this.bar ? parseInt(this.bar.dataset.threshold, 10) : 0;
    this.currency = this.drawer.dataset.currency || 'AED';
    this.upsellEl = this.drawer.querySelector('[data-cart-upsell]');
    this.upsellBody = this.drawer.querySelector('[data-cart-upsell-body]');
    this.noteEl = this.drawer.querySelector('[data-cart-note]');
    this.notesWrap = this.drawer.querySelector('[data-cart-notes-wrap]');
    this.giftWrap = this.drawer.querySelector('[data-cart-gift-wrap]');
    this.giftMessageWrap = this.drawer.querySelector('[data-gift-message-wrap]');
    this.giftMessageEl = this.drawer.querySelector('[data-cart-attr-text="رسالة هدية"]');
    this.heartWrap = this.drawer.querySelector('[data-cart-heart]');
    this.lastFocus = null;
    this.noteTimer = null;
    this.attrTimer = null;

    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-cart-open]')) {
        e.preventDefault();
        this.open();
      }
      if (e.target.closest('[data-cart-close]')) this.close();
    });

    this.drawer.addEventListener('click', (e) => {
      const remove = e.target.closest('[data-remove-line]');
      if (remove) {
        this.changeLine(remove.dataset.removeLine, 0);
        return;
      }
      const step = e.target.closest('[data-qty-change]');
      if (step) {
        const key = step.dataset.key;
        const next = parseInt(step.dataset.qtyChange, 10);
        if (key) this.changeLine(key, Math.max(0, next));
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.drawer.classList.contains('is-open')) this.close();
    });

    // Sync counts/bar from the server-rendered state on load.
    this.fetchCart().then((cart) => cart && this.render(cart));

    this.noteEl?.addEventListener('input', () => {
      clearTimeout(this.noteTimer);
      this.noteTimer = setTimeout(() => this.updateNote(this.noteEl.value), 400);
    });

    this.drawer.querySelectorAll('[data-cart-attr]').forEach((input) => {
      input.addEventListener('change', () => this.syncGiftAttributes());
    });
    this.giftMessageEl?.addEventListener('input', () => {
      clearTimeout(this.attrTimer);
      this.attrTimer = setTimeout(() => this.syncGiftAttributes(), 400);
    });
  }

  money(cents) {
    try {
      return new Intl.NumberFormat('ar-AE', {
        style: 'currency',
        currency: this.currency,
      }).format((cents || 0) / 100);
    } catch {
      return `${((cents || 0) / 100).toFixed(2)}`;
    }
  }

  open() {
    this.lastFocus = document.activeElement;
    this.drawer.classList.add('is-open');
    this.drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    this.drawer.querySelector('[data-cart-close]')?.focus();
  }

  close() {
    this.drawer.classList.remove('is-open');
    this.drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    this.lastFocus?.focus();
  }

  async fetchCart() {
    try {
      const res = await fetch(`${window.Shopify?.routes?.root || '/'}cart.js`, {
        headers: { Accept: 'application/json' },
      });
      return res.ok ? await res.json() : null;
    } catch {
      return null;
    }
  }

  async addItem(id, quantity = 1, sourceEl = null) {
    const res = await fetch(`${window.Shopify?.routes?.root || '/'}cart/add.js`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ id, quantity }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.description || 'add failed');
    }
    const cart = await this.fetchCart();
    if (cart) this.render(cart);

    const isMobile = window.matchMedia('(max-width: 899px)').matches;
    if (isMobile) {
      this.flyToCart(sourceEl);
    } else {
      this.open();
    }
    this.flashAddedFeedback(sourceEl);
    return cart;
  }

  findSourceImage(sourceEl) {
    const scopes = [];
    if (sourceEl?.closest) {
      const card = sourceEl.closest('.product-card, [data-product-card]');
      const page = sourceEl.closest('[data-product], .product-page');
      if (card) scopes.push(card);
      if (page) scopes.push(page);
    }
    scopes.push(document);
    for (const scope of scopes) {
      const img =
        scope.querySelector?.('[data-gallery-main] img') ||
        scope.querySelector?.('.product-gallery__image') ||
        scope.querySelector?.('.product-card__media img') ||
        scope.querySelector?.('.product-card img') ||
        (scope.tagName === 'IMG' ? scope : null);
      if (img?.getBoundingClientRect) return img;
    }
    return null;
  }

  cartFlyTarget() {
    return (
      document.querySelector('.mobile-bottom-nav__item[data-cart-open] .mobile-bottom-nav__icon-wrap') ||
      document.querySelector('.mobile-bottom-nav__item[data-cart-open]') ||
      document.querySelector('.site-header__cart-trigger') ||
      document.querySelector('[data-cart-open]')
    );
  }

  pulseCartBadge() {
    this.countEls.forEach((el) => {
      el.classList.remove('is-cart-pulse');
      // Force reflow so the animation can replay.
      void el.offsetWidth;
      el.classList.add('is-cart-pulse');
      el.addEventListener(
        'animationend',
        () => el.classList.remove('is-cart-pulse'),
        { once: true }
      );
    });
    const icon = this.cartFlyTarget();
    if (icon) {
      icon.classList.remove('is-cart-pulse');
      void icon.offsetWidth;
      icon.classList.add('is-cart-pulse');
      icon.addEventListener(
        'animationend',
        () => icon.classList.remove('is-cart-pulse'),
        { once: true }
      );
    }
  }

  flyToCart(sourceEl) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.pulseCartBadge();
      return;
    }
    const img = this.findSourceImage(sourceEl);
    const target = this.cartFlyTarget();
    if (!img || !target) {
      this.pulseCartBadge();
      return;
    }

    const sr = img.getBoundingClientRect();
    const tr = target.getBoundingClientRect();
    if (sr.width < 8 || sr.height < 8) {
      this.pulseCartBadge();
      return;
    }

    const ghost = img.cloneNode(true);
    ghost.removeAttribute('srcset');
    ghost.removeAttribute('sizes');
    ghost.className = 'fly-to-cart-ghost';
    ghost.setAttribute('aria-hidden', 'true');
    ghost.style.cssText = [
      'position:fixed',
      `left:${sr.left}px`,
      `top:${sr.top}px`,
      `width:${sr.width}px`,
      `height:${sr.height}px`,
      'z-index:320',
      'pointer-events:none',
      'margin:0',
      'border-radius:12px',
      'object-fit:cover',
      'box-shadow:0 8px 24px rgba(31,18,12,0.22)',
    ].join(';');
    document.body.appendChild(ghost);

    const startX = sr.left + sr.width / 2;
    const startY = sr.top + sr.height / 2;
    const endX = tr.left + tr.width / 2;
    const endY = tr.top + tr.height / 2;
    const dx = endX - startX;
    const dy = endY - startY;

    const anim = ghost.animate(
      [
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        {
          transform: `translate(${dx * 0.45}px, ${dy * 0.25 - 48}px) scale(0.55)`,
          opacity: 0.95,
          offset: 0.55,
        },
        { transform: `translate(${dx}px, ${dy}px) scale(0.12)`, opacity: 0.25 },
      ],
      {
        duration: 560,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        fill: 'forwards',
      }
    );

    anim.finished
      .catch(() => {})
      .finally(() => {
        ghost.remove();
        this.pulseCartBadge();
      });
  }

  flashAddedFeedback(sourceEl) {
    if (!sourceEl) return;
    const btn =
      sourceEl.closest?.('[data-add-button], [data-quick-add], [data-sticky-add], button') || sourceEl;
    if (!btn || btn.nodeType !== 1) return;
    const label = btn.querySelector?.('[data-add-label]') || btn;
    if (btn.dataset.addedBusy === '1') return;
    const original = label.textContent;
    const added = this.drawer?.dataset?.addedText || 'تمت الإضافة';
    btn.dataset.addedBusy = '1';
    label.textContent = added;
    btn.classList.add('is-added');
    clearTimeout(this._addedTimer);
    this._addedTimer = setTimeout(() => {
      label.textContent = original;
      btn.classList.remove('is-added');
      delete btn.dataset.addedBusy;
    }, 1200);
  }

  async updateNote(note) {
    const res = await fetch(`${window.Shopify?.routes?.root || '/'}cart/update.js`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ note }),
    });
    if (res.ok) return res.json();
    return null;
  }

  async syncGiftAttributes() {
    const attrs = {};
    this.drawer.querySelectorAll('[data-cart-attr]').forEach((input) => {
      const key = input.getAttribute('data-cart-attr');
      if (!key) return;
      attrs[key] = input.checked ? 'نعم' : '';
      if (key === 'إرسال كهدية' && this.giftMessageWrap) {
        this.giftMessageWrap.hidden = !input.checked;
        if (!input.checked && this.giftMessageEl) this.giftMessageEl.value = '';
      }
    });
    if (this.giftMessageEl) {
      const giftOn = !!this.drawer.querySelector('[data-cart-attr="إرسال كهدية"]')?.checked;
      attrs['رسالة هدية'] = giftOn ? (this.giftMessageEl.value || '').trim() : '';
    }
    const res = await fetch(`${window.Shopify?.routes?.root || '/'}cart/update.js`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ attributes: attrs }),
    });
    if (res.ok) return res.json();
    return null;
  }

  async changeLine(key, quantity) {
    const res = await fetch(`${window.Shopify?.routes?.root || '/'}cart/change.js`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ id: key, quantity }),
    });
    if (res.ok) this.render(await res.json());
  }

  render(cart) {
    this.countEls.forEach((el) => {
      el.textContent = cart.item_count;
      el.hidden = cart.item_count === 0;
    });

    if (this.subtotalEl) this.subtotalEl.textContent = this.money(cart.total_price);

    if (this.itemsEl) {
      if (cart.item_count === 0) {
        this.itemsEl.innerHTML = `<p class="cart-drawer__empty">${this.itemsEl.dataset.emptyText || 'سلتج فاضية'}</p>`;
        if (this.footerEl) this.footerEl.hidden = true;
        if (this.notesWrap) this.notesWrap.hidden = true;
        if (this.giftWrap) this.giftWrap.hidden = true;
        if (this.heartWrap) this.heartWrap.hidden = true;
      } else {
        if (this.footerEl) this.footerEl.hidden = false;
        if (this.notesWrap) this.notesWrap.hidden = false;
        if (this.giftWrap) this.giftWrap.hidden = false;
        if (this.heartWrap) this.heartWrap.hidden = false;
        this.itemsEl.innerHTML = cart.items.map((item) => this.lineHTML(item)).join('');
      }
    }

    if (this.noteEl && document.activeElement !== this.noteEl && cart.note !== undefined) {
      this.noteEl.value = cart.note || '';
    }

    const attrs = cart.attributes || {};
    this.drawer.querySelectorAll('[data-cart-attr]').forEach((input) => {
      const key = input.getAttribute('data-cart-attr');
      if (!key || document.activeElement === input) return;
      input.checked = attrs[key] === 'نعم';
    });
    if (this.giftMessageEl && document.activeElement !== this.giftMessageEl) {
      this.giftMessageEl.value = attrs['رسالة هدية'] || '';
    }
    if (this.giftMessageWrap) {
      this.giftMessageWrap.hidden = attrs['إرسال كهدية'] !== 'نعم';
    }

    this.renderShippingBar(cart);
    this.renderUpsell(cart);
  }

  async renderUpsell(cart) {
    if (!this.upsellEl || !this.upsellBody) return;
    if (!cart.items || cart.items.length === 0) {
      this.upsellEl.hidden = true;
      return;
    }
    const productId = cart.items[0].product_id;
    const inCart = new Set(cart.items.map((i) => i.product_id));
    const params = new URLSearchParams({
      product_id: productId,
      intent: 'complementary',
      limit: '6',
      section_id: 'cart-upsell',
    });
    try {
      const res = await fetch(`${window.Shopify?.routes?.root || '/'}recommendations/products?${params}`);
      if (!res.ok) throw new Error('upsell failed');
      const text = await res.text();
      const doc = new DOMParser().parseFromString(text, 'text/html');
      // Adopt the section's subsetted CSS once (fetched on demand, not in the
      // page render tree).
      const style = doc.querySelector('style[data-section-stylesheet]');
      if (style && !document.getElementById('cart-upsell-style')) {
        style.id = 'cart-upsell-style';
        document.head.appendChild(style);
      }
      const content = doc.querySelector('[data-cart-upsell-content]');
      if (!content) {
        this.upsellEl.hidden = true;
        return;
      }
      content
        .querySelectorAll('[data-upsell-product-id]')
        .forEach((item) => {
          if (inCart.has(Number(item.dataset.upsellProductId))) item.remove();
        });
      const items = content.querySelectorAll('[data-upsell-product-id]');
      if (items.length === 0) {
        this.upsellEl.hidden = true;
        return;
      }
      // Cap to 4 after filtering.
      Array.from(items)
        .slice(4)
        .forEach((el) => el.remove());
      this.upsellBody.innerHTML = content.innerHTML;
      this.upsellEl.hidden = false;
    } catch {
      this.upsellEl.hidden = true;
    }
  }

  lineHTML(item) {
    const img = item.image
      ? `<img src="${item.image.replace(/(\.[^.]+)$/, '_120x$1')}" alt="${this.escape(item.product_title)}" width="60" height="60" loading="lazy">`
      : '';
    const variant =
      item.variant_title && !/^default title$/i.test(item.variant_title)
        ? `<span class="cart-drawer__variant">${this.escape(item.variant_title)}</span>`
        : '';
    return `
      <div class="cart-drawer__item" data-line-key="${item.key}">
        ${img}
        <div class="cart-drawer__item-info">
          <a href="${item.url}">${this.escape(item.product_title)}</a>
          ${variant}
          <div class="cart-drawer__qty">
            <button type="button" data-qty-change="${item.quantity - 1}" data-key="${item.key}" aria-label="نقص">−</button>
            <span>${item.quantity}</span>
            <button type="button" data-qty-change="${item.quantity + 1}" data-key="${item.key}" aria-label="زيادة">+</button>
          </div>
          <p class="cart-drawer__line-price">${this.money(item.final_line_price)}</p>
        </div>
        <button type="button" class="cart-drawer__remove" data-remove-line="${item.key}" aria-label="حذف">&times;</button>
      </div>`;
  }

  /** Line items that count toward free shipping (excludes discounted / sale items). */
  eligibleShippingTotal(cart) {
    if (!cart?.items?.length) return 0;
    return cart.items.reduce((sum, item) => {
      const compareAt = Number(item.compare_at_price) || 0;
      const price = Number(item.final_price ?? item.price) || 0;
      const originalLine = Number(item.original_line_price) || 0;
      const finalLine = Number(item.final_line_price ?? item.line_price) || 0;
      const onSale = (compareAt > 0 && compareAt > price) || originalLine > finalLine;
      return onSale ? sum : sum + finalLine;
    }, 0);
  }

  renderShippingBar(cartOrTotal) {
    if (!this.bar || !this.threshold) return;
    const total =
      typeof cartOrTotal === 'number' ? cartOrTotal : this.eligibleShippingTotal(cartOrTotal);
    const remaining = Math.max(0, this.threshold - total);
    const progress = Math.min(100, (total / this.threshold) * 100);
    const msg = this.bar.querySelector('[data-shipping-message]');
    const progressBar = this.bar.querySelector('[data-shipping-progress]');
    if (msg) {
      msg.textContent =
        remaining <= 0
          ? 'مبروك! حصلتي على توصيل مجاني 🎉'
          : `باقي ${this.money(remaining)} وتحصلين توصيل مجاني`;
    }
    if (progressBar) progressBar.style.width = `${progress}%`;
  }

  escape(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.cartDrawer = new CartDrawer();
});
