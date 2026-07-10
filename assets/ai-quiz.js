/*
 * Anfas Al-Anoud — مساعد العنود (smart scent advisor)
 * Client-side engine tuned to the real catalog product types:
 * bakhoor | perfume | spray | body-oil | care-* | bundle
 */
(function () {
  'use strict';

  const TYPE_RULES = {
    dokhoon: {
      types: ['bakhoor', 'دخون', 'بخور', 'معمول'],
      title: ['دخون', 'بخور', 'معمول'],
      softTypes: ['bundle'],
      softTitle: ['مجموعة الدخون', 'مجموعة'],
    },
    perfume: {
      types: ['perfume', 'عطر', 'عطور'],
      title: ['عطر'],
      softTypes: ['spray'],
      softTitle: ['مرش'],
    },
    care: {
      types: [
        'body-oil',
        'body oil',
        'care',
        'care-shampoo',
        'care-shower',
        'care-lotion',
        'عناية',
        'لوشن',
        'شامبو',
      ],
      title: ['بدي', 'أويل', 'اويل', 'لوشن', 'شامبو', 'شاور', 'مرطب', 'سكراب', 'زيت جسم'],
    },
    box: {
      types: ['bundle', 'بوكس', 'بوكسات', 'هدايا', 'طقم', 'set', 'gift'],
      title: ['مجموعة', 'بوكس', 'بوكسات', 'طقم', 'هدية'],
    },
  };

  const OCCASION_RULES = {
    work: {
      collections: ['anoud-vibe-daily'],
      scents: ['الياسي', 'مليح', 'ليلى', 'إيفا', 'ايفا', 'نسمة', 'بريس', 'breeze'],
      softScents: ['مهرة', 'ظبي'],
      preferKinds: ['perfume', 'body-oil', 'spray'],
      label: 'دوامج وطلعاتج',
    },
    evening: {
      collections: ['anoud-vibe-evening'],
      scents: ['الشيوخ', 'غاوي', 'عتيق', 'عود', 'الملكي', 'ملكي'],
      softScents: ['غناتي', 'بلوسم', 'الحصن'],
      preferKinds: ['bakhoor', 'perfume'],
      label: 'سهراتج وعزايمج',
    },
    home: {
      collections: ['anoud-vibe-majlis'],
      scents: ['الميث', 'الحصن', 'عتيق', 'النوخذة', 'المزون', 'الطارش', 'الميل'],
      softScents: ['مليح', 'الياسي', 'خانين'],
      preferKinds: ['bakhoor', 'spray'],
      label: 'ميلسج ومواجيبج',
    },
    gift: {
      collections: ['anoud-vibe-bride'],
      scents: ['غناتي', 'الميث', 'غاوي', 'عود', 'بلوسم', 'الملكي', 'ملكي'],
      softScents: ['مهرة', 'مليح'],
      preferKinds: ['bundle'],
      boostTitle: ['مجموعة', 'بوكس', 'هدية', 'طقم'],
      label: 'هدية تبيض الويه',
    },
  };

  const MOOD_RULES = {
    light: {
      scents: ['الياسي', 'مليح', 'نسمة', 'بريس', 'breeze', 'إيفا', 'ايفا', 'ليلى', 'ظبي', 'خانين'],
      keywords: ['خفيف', 'منعش', 'صيفي', 'fresh', 'light', 'citrus'],
      label: 'خفيف ومنعش',
    },
    rich: {
      scents: [
        'الشيوخ',
        'غاوي',
        'عتيق',
        'عود',
        'الملكي',
        'ملكي',
        'الحصن',
        'الميث',
        'النوخذة',
        'الميل',
      ],
      keywords: ['فخم', 'قوي', 'ثقيل', 'شرقي', 'rich', 'oud', 'oriental'],
      label: 'فخم وقوي',
    },
    soft: {
      scents: ['غناتي', 'بلوسم', 'مهرة', 'ليلى', 'المزون', 'blossom'],
      keywords: ['ناعم', 'رومانسي', 'وردي', 'زهري', 'soft', 'floral', 'rose'],
      label: 'ناعم ورومانسي',
    },
  };

  const TYPE_LABELS = {
    dokhoon: 'دخون',
    perfume: 'عطور',
    care: 'دلع وعناية',
    box: 'بوكسات',
  };

  const LOADING_LINES = [
    'لحظة أشمّ لج الخلطات...',
    'أقارن بين اللي يلوق على جوج...',
    'أرتّب لج أحلى اقتراحات...',
  ];

  function normalize(str) {
    return String(str || '')
      .toLowerCase()
      .replace(/أ|إ|آ/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .replace(/ؤ|ئ/g, 'ء')
      .replace(/[\u064B-\u065F]/g, '')
      .trim();
  }

  function includesAny(haystack, needles) {
    if (!haystack || !needles?.length) return false;
    const h = normalize(haystack);
    return needles.some((n) => h.includes(normalize(n)));
  }

  function listIncludesAny(list, needles) {
    if (!Array.isArray(list) || !needles?.length) return false;
    return list.some((item) => includesAny(item, needles));
  }

  function productKind(product) {
    const type = normalize(product.type);
    const title = normalize(product.title);
    const handle = normalize(product.handle);
    if (type.includes('bundle') || includesAny(title, ['مجموعه', 'بوكس'])) return 'bundle';
    if (type.includes('bakhoor') || includesAny(title, ['دخون', 'بخور'])) return 'bakhoor';
    if (type.includes('perfume') || (includesAny(title, ['عطر']) && !includesAny(title, ['مرش']))) {
      return 'perfume';
    }
    if (type.includes('spray') || includesAny(title, ['مرش'])) return 'spray';
    if (
      type.includes('body') ||
      type.includes('care') ||
      includesAny(title, ['بدي', 'اويل', 'لوشن', 'شامبو', 'شاور'])
    ) {
      return 'care';
    }
    if (handle.includes('مجموعه') || handle.includes('بوكس')) return 'bundle';
    return type || 'other';
  }

  function detectScent(product) {
    const blob = [product.title, product.handle, ...(product.tags || [])].join(' ');
    const n = normalize(blob);
    const known = [
      'غناتي',
      'الميث',
      'الملكي',
      'ملكي',
      'غاوي',
      'مليح',
      'مهرة',
      'الشيوخ',
      'الحصن',
      'الياسي',
      'خانين',
      'ظبي',
      'الميل',
      'النوخذة',
      'المزون',
      'الطارش',
      'إيفا',
      'ايفا',
      'ليلى',
      'عود',
      'بلوسم',
      'بريس',
      'نسمة',
      'عتيق',
    ];
    for (const scent of known) {
      if (n.includes(normalize(scent))) return scent;
    }
    return '';
  }

  function scoreProduct(product, answers) {
    const reasons = [];
    let score = 0;
    const typeRule = TYPE_RULES[answers.type];
    const occasion = OCCASION_RULES[answers.occasion];
    const mood = MOOD_RULES[answers.mood];
    const kind = productKind(product);
    const scent = detectScent(product);
    const title = product.title || '';
    const type = product.type || '';
    const handle = product.handle || '';
    const tags = Array.isArray(product.tags) ? product.tags : [];
    const collections = Array.isArray(product.collections) ? product.collections : [];
    const blob = [title, handle, type, tags.join(' ')].join(' ');

    // --- Product type (hard signal) ---
    let typeHit = false;
    if (typeRule) {
      if (includesAny(type, typeRule.types) || includesAny(title, typeRule.title)) {
        score += 14;
        typeHit = true;
        reasons.push(`يناسب طلبج لـ${TYPE_LABELS[answers.type] || 'المنتج'}`);
      } else if (
        includesAny(type, typeRule.softTypes) ||
        includesAny(title, typeRule.softTitle || [])
      ) {
        score += 6;
        typeHit = true;
        reasons.push('قريب من النوع اللي تبينه');
      } else if (answers.type === 'box' && kind === 'bundle') {
        score += 14;
        typeHit = true;
        reasons.push('بوكس جاهز للإهداء');
      } else {
        score -= 10;
      }
    }

    // --- Occasion ---
    if (occasion) {
      if (listIncludesAny(collections, occasion.collections)) {
        score += 9;
        reasons.push(`مختار لـ${occasion.label}`);
      }
      if (scent && includesAny(scent, occasion.scents)) {
        score += 11;
        reasons.push(`خلطة ${scent} تلوق على ${occasion.label}`);
      } else if (scent && includesAny(scent, occasion.softScents || [])) {
        score += 5;
      } else if (includesAny(blob, occasion.scents)) {
        score += 8;
        reasons.push(`يلوق على ${occasion.label}`);
      }
      if (occasion.preferKinds?.includes(kind)) score += 3;
      if (occasion.boostTitle && includesAny(title, occasion.boostTitle)) {
        score += 12;
        reasons.push('مثالي كهدية');
      }
    }

    // --- Mood / scent personality ---
    if (mood) {
      if (scent && includesAny(scent, mood.scents)) {
        score += 12;
        reasons.push(`مزاج ${mood.label}`);
      } else if (includesAny(blob, mood.scents) || includesAny(blob, mood.keywords)) {
        score += 7;
        reasons.push(`يحسّسج بـ${mood.label}`);
      } else if (listIncludesAny(tags, mood.keywords)) {
        score += 5;
      }
    }

    // --- Availability & quality nudges ---
    if (product.available !== false) score += 2;
    else score -= 6;

    // Prefer in-stock exact matches over weak soft matches
    if (typeHit && product.available !== false) score += 1;

    // Gift + non-box still OK if scent is gift-worthy
    if (answers.occasion === 'gift' && answers.type !== 'box' && kind === 'bundle') {
      score += 4;
    }

    return {
      score,
      reasons: unique(reasons).slice(0, 2),
      kind,
      scent,
    };
  }

  function unique(arr) {
    return [...new Set(arr.filter(Boolean))];
  }

  function diversify(ranked, limit) {
    const picked = [];
    const usedScents = new Set();
    const usedKinds = new Set();

    // Pass 1: prefer unique scent + kind
    for (const item of ranked) {
      if (picked.length >= limit) break;
      const scentKey = normalize(item.scent) || normalize(item.title);
      const kindKey = item.kind || 'other';
      if (item.scent && usedScents.has(scentKey) && picked.length < limit - 1) continue;
      if (usedKinds.has(kindKey) && usedScents.has(scentKey)) continue;
      picked.push(item);
      if (item.scent) usedScents.add(scentKey);
      usedKinds.add(kindKey);
    }

    // Pass 2: fill remaining by score
    for (const item of ranked) {
      if (picked.length >= limit) break;
      if (!picked.includes(item)) picked.push(item);
    }
    return picked.slice(0, limit);
  }

  function buildResultsTitle(answers, isFallback, top) {
    if (isFallback) {
      return 'ما لقيت مطابقة تامة، بس هذي من أحلى اختيارات العنود لج:';
    }
    const occasion = OCCASION_RULES[answers.occasion]?.label || '';
    const mood = MOOD_RULES[answers.mood]?.label || '';
    const type = TYPE_LABELS[answers.type] || '';
    if (top?.scent) {
      return `حسّيت إن «${top.scent}» بيلوق عليج — اقتراحاتي لـ${type}${occasion ? ` و${occasion}` : ''}:`;
    }
    return `هذي اقتراحاتي لج${mood ? ` بمزاج ${mood}` : ''}:`;
  }

  function loadingCopy(answers) {
    const type = TYPE_LABELS[answers.type];
    if (type) return `لحظة أختار لج أنسب ${type}...`;
    return LOADING_LINES[Math.floor(Math.random() * LOADING_LINES.length)];
  }

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
    if (!Array.isArray(catalog) || !catalog.length) return;

    const answers = {};
    let step = 1;
    const totalSteps = 3;
    const stepKeys = { 1: 'occasion', 2: 'mood', 3: 'type' };
    const progress = widget.querySelectorAll('[data-quiz-progress] span');
    const loadingEl = widget.querySelector('[data-quiz-loading]');
    const loadingText = widget.querySelector('[data-quiz-loading-text]');
    const resultsEl = widget.querySelector('[data-quiz-results]');
    const productsEl = widget.querySelector('[data-quiz-products]');
    const resultsTitle = widget.querySelector('[data-quiz-results-title]');
    const liveRegion = widget.querySelector('[data-quiz-live]');

    function announce(msg) {
      if (liveRegion) liveRegion.textContent = msg;
    }

    function showStep(n) {
      widget.querySelectorAll('[data-quiz-step]').forEach((el) => {
        el.hidden = Number(el.dataset.quizStep) !== n;
      });
      progress.forEach((dot, i) => {
        const active = i < n;
        dot.classList.toggle('is-active', active);
        dot.setAttribute('aria-current', i === n - 1 ? 'step' : 'false');
      });
      const stepRoot = widget.querySelector(`[data-quiz-step="${n}"]`);
      const question = stepRoot?.querySelector('.ai-quiz__question');
      if (question) announce(question.textContent.trim());
      stepRoot?.querySelector('.ai-quiz__option, [data-quiz-back]')?.focus?.();
    }

    function markSelected(option) {
      const group = option.closest('.ai-quiz__options');
      group?.querySelectorAll('.ai-quiz__option').forEach((btn) => {
        btn.classList.toggle('is-selected', btn === option);
        btn.setAttribute('aria-pressed', btn === option ? 'true' : 'false');
      });
    }

    widget.addEventListener('click', (e) => {
      const option = e.target.closest('[data-quiz-value]');
      if (option) {
        markSelected(option);
        answers[stepKeys[step]] = option.dataset.quizValue;
        if (step < totalSteps) {
          step += 1;
          window.setTimeout(() => showStep(step), 120);
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
          .then(() => {
            add.textContent = 'تمت الإضافة ✓';
          })
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
      loadingEl.hidden = true;
      widget.querySelectorAll('.ai-quiz__option').forEach((btn) => {
        btn.classList.remove('is-selected');
        btn.setAttribute('aria-pressed', 'false');
      });
      showStep(1);
      announce('رجعتي لبداية المساعدة');
    }

    function runMatch() {
      widget.querySelectorAll('[data-quiz-step]').forEach((el) => {
        el.hidden = true;
      });
      if (loadingText) loadingText.textContent = loadingCopy(answers);
      loadingEl.hidden = false;
      resultsEl.hidden = true;
      announce(loadingText?.textContent || 'جارٍ اختيار الاقتراحات');

      const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 120 : 700;

      window.setTimeout(() => {
        const ranked = catalog
          .map((p) => {
            const result = scoreProduct(p, answers);
            return { ...p, ...result };
          })
          .sort((a, b) => b.score - a.score || String(a.title).localeCompare(String(b.title), 'ar'));

        const strong = ranked.filter((p) => p.score >= 12 && p.available !== false);
        const medium = ranked.filter((p) => p.score >= 6 && p.available !== false);
        const isFallback = strong.length === 0;
        const pool = (strong.length ? strong : medium.length ? medium : ranked).filter(
          (p) => p.available !== false
        );
        const list = diversify(pool.length ? pool : ranked, 4);

        resultsTitle.textContent = buildResultsTitle(answers, isFallback, list[0]);
        productsEl.innerHTML = list.map((p, i) => cardHTML(p, i === 0)).join('');
        loadingEl.hidden = true;
        resultsEl.hidden = false;
        announce(`${resultsTitle.textContent} — ${list.length} اقتراحات`);
        resultsEl.querySelector('[data-quiz-restart]')?.focus?.();
      }, delay);
    }

    function cardHTML(p, isTop) {
      const canAdd = p.available !== false && p.variant_id && p.variant_id !== 0;
      const addBtn = canAdd
        ? `<button type="button" class="ai-quiz__product-add" data-quiz-add data-variant-id="${p.variant_id}">أضيفي للسلة</button>`
        : `<a class="ai-quiz__product-add" href="${escapeAttr(p.url)}">التفاصيل</a>`;
      const reason = (p.reasons && p.reasons[0]) || (isTop ? 'أقرب اختيار لج من العنود' : '');
      const badge = isTop ? '<span class="ai-quiz__badge">أنسب لج</span>' : '';
      return `
      <article class="ai-quiz__product${isTop ? ' ai-quiz__product--top' : ''}">
        <img src="${escapeAttr(p.image)}" alt="${escapeHTML(p.title)}" width="64" height="64" loading="lazy">
        <div class="ai-quiz__product-body">
          ${badge}
          <a class="ai-quiz__product-title" href="${escapeAttr(p.url)}">${escapeHTML(p.title)}</a>
          ${reason ? `<p class="ai-quiz__product-reason">${escapeHTML(reason)}</p>` : ''}
          <span class="ai-quiz__product-price">${escapeHTML(p.price)}</span>
        </div>
        ${addBtn}
      </article>`;
    }

    function escapeHTML(str) {
      const d = document.createElement('div');
      d.textContent = str || '';
      return d.innerHTML;
    }

    function escapeAttr(str) {
      return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;');
    }

    widget.querySelectorAll('.ai-quiz__option').forEach((btn) => {
      btn.setAttribute('aria-pressed', 'false');
    });

    showStep(1);
  });
})();
