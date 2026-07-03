/*
 * Anfas Al-Anoud — smart product finder (client-side, no external AI).
 * Scores the store catalogue against the shopper's answers and gracefully
 * falls back to popular products when nothing matches.
 */
const QUIZ_RULES = {
  work: { types: ['بدي أويل', 'عطور', 'بادي', 'مرطب'], tags: ['دوام', 'يومي', 'خفيف'] },
  evening: { types: ['دخون', 'عطور'], tags: ['سهرة', 'مناسبات', 'فخم'] },
  home: { types: ['دخون', 'بخور', 'معمول'], tags: ['ميلس', 'بيت', 'مواجيب'] },
  gift: { types: ['بوكس', 'بوكسات', 'هدايا', 'طقم'], tags: ['هدية', 'بوكس'] },
  dokhoon: { types: ['دخون', 'بخور', 'معمول'] },
  perfume: { types: ['عطور', 'عطر', 'بدي أويل', 'بادي'] },
  care: { types: ['عناية', 'بدي', 'مرطب', 'سكراب'] },
  box: { types: ['بوكس', 'بوكسات', 'هدايا', 'طقم'] },
  light: { tags: ['خفيف', 'منعش', 'صيفي'] },
  rich: { tags: ['فخم', 'قوي', 'ثقيل', 'شرقي'] },
  soft: { tags: ['ناعم', 'رومانسي', 'وردي', 'زهري'] },
};

document.addEventListener('DOMContentLoaded', () => {
  const widget = document.querySelector('[data-ai-quiz]');
  const catalogEl = document.querySelector('[data-quiz-catalog]');
  if (!widget || !catalogEl) return;

  let catalog = [];
  try {
    catalog = JSON.parse(catalogEl.textContent);
  } catch {
    return;
  }
  if (!catalog.length) return;

  const answers = {};
  let step = 1;
  const totalSteps = 3;
  const stepKeys = { 1: 'occasion', 2: 'mood', 3: 'type' };
  const progress = widget.querySelectorAll('[data-quiz-progress] span');
  const loadingEl = widget.querySelector('[data-quiz-loading]');
  const resultsEl = widget.querySelector('[data-quiz-results]');
  const productsEl = widget.querySelector('[data-quiz-products]');
  const resultsTitle = widget.querySelector('[data-quiz-results-title]');

  function showStep(n) {
    widget.querySelectorAll('[data-quiz-step]').forEach((el) => {
      el.hidden = Number(el.dataset.quizStep) !== n;
    });
    progress.forEach((dot, i) => dot.classList.toggle('is-active', i < n));
  }

  widget.addEventListener('click', (e) => {
    const option = e.target.closest('[data-quiz-value]');
    if (option) {
      answers[stepKeys[step]] = option.dataset.quizValue;
      if (step < totalSteps) {
        step += 1;
        showStep(step);
      } else {
        runMatch();
      }
      return;
    }

    if (e.target.closest('[data-quiz-back]')) {
      if (step > 1) {
        step -= 1;
        showStep(step);
      }
      return;
    }

    if (e.target.closest('[data-quiz-restart]')) {
      restart();
      return;
    }

    const add = e.target.closest('[data-quiz-add]');
    if (add && window.cartDrawer && add.dataset.variantId !== '0') {
      add.disabled = true;
      add.textContent = 'جارٍ الإضافة...';
      window.cartDrawer
        .addItem(Number(add.dataset.variantId), 1)
        .catch(() => {
          add.disabled = false;
          add.textContent = 'أضيفي للسلة';
        });
    }
  });

  function restart() {
    step = 1;
    Object.keys(answers).forEach((k) => delete answers[k]);
    resultsEl.hidden = true;
    showStep(1);
  }

  function scoreProduct(product) {
    let score = 0;
    const type = product.type || '';
    const tags = Array.isArray(product.tags) ? product.tags : [];
    const occasion = QUIZ_RULES[answers.occasion];
    const chosenType = QUIZ_RULES[answers.type];
    const mood = QUIZ_RULES[answers.mood];

    if (chosenType?.types?.some((t) => type.includes(t))) score += 5;
    if (occasion?.types?.some((t) => type.includes(t))) score += 3;
    if (occasion?.tags?.some((t) => tags.some((tag) => tag.includes(t)))) score += 2;
    if (mood?.tags?.some((t) => tags.some((tag) => tag.includes(t)))) score += 3;
    if (product.available) score += 1;

    return score;
  }

  function runMatch() {
    widget.querySelectorAll('[data-quiz-step]').forEach((el) => (el.hidden = true));
    loadingEl.hidden = false;
    resultsEl.hidden = true;

    // Small deliberate delay so it feels considered.
    setTimeout(() => {
      const ranked = catalog
        .map((p) => ({ ...p, score: scoreProduct(p) }))
        .sort((a, b) => b.score - a.score);

      const matched = ranked.filter((p) => p.score > 1);
      const isFallback = matched.length === 0;
      const finalList = (isFallback ? ranked : matched)
        .filter((p) => p.available !== false)
        .slice(0, 4);
      const list = finalList.length ? finalList : ranked.slice(0, 4);

      resultsTitle.textContent = isFallback
        ? 'ما لقيت مطابقة تامة، بس هذي من أحلى اختياراتنا:'
        : 'هذي اقتراحاتي لج:';

      productsEl.innerHTML = list.map(cardHTML).join('');
      loadingEl.hidden = true;
      resultsEl.hidden = false;
    }, 650);
  }

  function cardHTML(p) {
    const canAdd = p.available !== false && p.variant_id && p.variant_id !== 0;
    const addBtn = canAdd
      ? `<button type="button" class="ai-quiz__product-add" data-quiz-add data-variant-id="${p.variant_id}">أضيفي للسلة</button>`
      : `<a class="ai-quiz__product-add" href="${p.url}">التفاصيل</a>`;
    return `
      <div class="ai-quiz__product">
        <img src="${p.image}" alt="${escapeHTML(p.title)}" width="64" height="64" loading="lazy">
        <div class="ai-quiz__product-body">
          <a class="ai-quiz__product-title" href="${p.url}">${escapeHTML(p.title)}</a>
          <span class="ai-quiz__product-price">${escapeHTML(p.price)}</span>
        </div>
        ${addBtn}
      </div>`;
  }

  function escapeHTML(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  }

  showStep(1);
});
