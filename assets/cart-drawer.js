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
    this.lastFocus = null;
    this.noteTimer = null;

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

  async addItem(id, quantity = 1) {
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
    this.open();
    return cart;
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
      } else {
        if (this.footerEl) this.footerEl.hidden = false;
        if (this.notesWrap) this.notesWrap.hidden = false;
        this.itemsEl.innerHTML = cart.items.map((item) => this.lineHTML(item)).join('');
      }
    }

    if (this.noteEl && document.activeElement !== this.noteEl && cart.note !== undefined) {
      this.noteEl.value = cart.note || '';
    }

    this.renderShippingBar(cart.total_price);
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

  renderShippingBar(total) {
    if (!this.bar || !this.threshold) return;
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
