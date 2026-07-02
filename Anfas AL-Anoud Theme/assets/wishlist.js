const WISHLIST_KEY = 'anfas_wishlist';

function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveWishlist(items) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
  renderWishlistDrawer();
  syncWishlistButtons();
}

function syncWishlistButtons() {
  const ids = getWishlist().map((i) => String(i.id));
  document.querySelectorAll('[data-wishlist-toggle]').forEach((btn) => {
    btn.classList.toggle('is-active', ids.includes(btn.dataset.productId));
  });
}

function renderWishlistDrawer() {
  const container = document.querySelector('[data-wishlist-items]');
  if (!container) return;
  const items = getWishlist();
  if (!items.length) {
    container.innerHTML = '<p style="text-align:center;color:#999;padding:2rem">مفضلتج فاضية</p>';
    return;
  }
  container.innerHTML = items
    .map(
      (item) => `
    <a href="${item.url}" style="display:flex;gap:0.75rem;align-items:center;padding:0.75rem 0;text-decoration:none;color:inherit;border-bottom:1px solid var(--color-sand)">
      <img src="${item.image}" alt="${item.title}" width="60" height="60" style="border-radius:8px;object-fit:cover">
      <div><strong>${item.title}</strong><br><span>${item.price}</span></div>
    </a>`
    )
    .join('');
}

document.addEventListener('DOMContentLoaded', () => {
  syncWishlistButtons();
  renderWishlistDrawer();

  document.addEventListener('click', (e) => {
    const toggle = e.target.closest('[data-wishlist-toggle]');
    if (toggle) {
      const item = {
        id: toggle.dataset.productId,
        title: toggle.dataset.productTitle,
        url: toggle.dataset.productUrl,
        image: toggle.dataset.productImage,
        price: toggle.dataset.productPrice,
      };
      let items = getWishlist();
      const idx = items.findIndex((i) => String(i.id) === String(item.id));
      if (idx >= 0) items.splice(idx, 1);
      else items.push(item);
      saveWishlist(items);
    }
  });
});
