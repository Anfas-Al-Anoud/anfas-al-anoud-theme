class CartDrawer {
  constructor() {
    this.drawer = document.querySelector('[data-cart-drawer]');
    if (!this.drawer) return;

    document.querySelectorAll('[data-cart-open]').forEach((btn) => {
      btn.addEventListener('click', () => this.open());
    });
    document.querySelectorAll('[data-cart-close]').forEach((btn) => {
      btn.addEventListener('click', () => this.close());
    });

    this.drawer.addEventListener('click', (e) => {
      if (e.target.matches('[data-remove-line]')) {
        this.updateLine(e.target.dataset.removeLine, 0);
      }
    });

    this.updateShippingBar();
  }

  open() {
    this.drawer.classList.add('is-open');
    this.drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.drawer.classList.remove('is-open');
    this.drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  async updateLine(line, quantity) {
    const res = await fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ line, quantity }),
    });
    if (res.ok) window.location.reload();
  }

  updateShippingBar() {
    const bar = document.querySelector('[data-free-shipping-bar]');
    if (!bar) return;
    const threshold = parseInt(bar.dataset.threshold, 10);
    const subtotalEl = document.querySelector('[data-cart-subtotal]');
    if (!subtotalEl || !threshold) return;

    const subtotalText = subtotalEl.textContent.replace(/[^\d.]/g, '');
    const subtotal = parseFloat(subtotalText) * 100 || 0;
    const remaining = Math.max(0, threshold - subtotal);
    const progress = Math.min(100, (subtotal / threshold) * 100);
    const msg = bar.querySelector('[data-shipping-message]');
    const progressBar = bar.querySelector('[data-shipping-progress]');

    if (remaining <= 0) {
      msg.textContent = 'مبروك! توصيل مجاني 🎉';
    } else {
      msg.textContent = `باقي ${(remaining / 100).toFixed(0)} درهم للتوصيل المجاني`;
    }
    if (progressBar) progressBar.style.width = `${progress}%`;
  }
}

document.addEventListener('DOMContentLoaded', () => new CartDrawer());
