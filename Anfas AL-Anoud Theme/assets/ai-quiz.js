const QUIZ_RULES = {
  work: { types: ['بدي أويل', 'عطور'], tags: ['دوام'] },
  evening: { types: ['دخون', 'عطور'], tags: ['سهرة'] },
  home: { types: ['دخون السنع', 'دخون'], tags: ['ميلس'] },
  gift: { types: ['بوكسات'], tags: ['هدية'] },
  dokhoon: { types: ['دخون', 'دخون السنع'] },
  perfume: { types: ['عطور', 'بدي أويل'] },
  care: { types: ['منتجات العناية', 'بدي أويل'] },
  box: { types: ['بوكسات'] },
  light: { tags: ['خفيف', 'منعش'] },
  rich: { tags: ['فخم', 'قوي'] },
  soft: { tags: ['ناعم', 'رومانسي'] },
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

  const answers = {};
  let step = 1;

  widget.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-quiz-value]');
    if (!btn) return;

    const stepEl = widget.querySelector(`[data-quiz-step="${step}"]`);
    const key = step === 1 ? 'occasion' : step === 2 ? 'type' : 'mood';
    answers[key] = btn.dataset.quizValue;

    stepEl.hidden = true;
    step++;

    if (step <= 3) {
      widget.querySelector(`[data-quiz-step="${step}"]`).hidden = false;
    } else {
      showResults();
    }
  });

  widget.querySelector('[data-quiz-restart]')?.addEventListener('click', () => {
    step = 1;
    Object.keys(answers).forEach((k) => delete answers[k]);
    widget.querySelector('[data-quiz-results]').hidden = true;
    widget.querySelectorAll('[data-quiz-step]').forEach((el, i) => {
      el.hidden = i !== 0;
    });
  });

  function scoreProduct(product) {
    let score = 0;
    const rules = QUIZ_RULES[answers.occasion];
    const typeRules = QUIZ_RULES[answers.type];

    if (rules?.types?.some((t) => product.type?.includes(t))) score += 3;
    if (typeRules?.types?.some((t) => product.type?.includes(t))) score += 4;
    if (rules?.tags?.some((t) => product.tags?.some((tag) => tag.includes(t)))) score += 2;

    return score;
  }

  function showResults() {
    const results = widget.querySelector('[data-quiz-results]');
    const container = widget.querySelector('[data-quiz-products]');
    results.hidden = false;

    const ranked = catalog
      .map((p) => ({ ...p, score: scoreProduct(p) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

    container.innerHTML = ranked
      .map(
        (p) => `
      <a href="${p.url}" class="ai-quiz__product-link">
        <img src="${p.image}" alt="${p.title}" width="64" height="64" loading="lazy">
        <div><strong>${p.title}</strong><br><span>${p.price}</span></div>
      </a>`
      )
      .join('');
  }
});
