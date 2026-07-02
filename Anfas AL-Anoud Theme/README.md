# Anfas Al-Anoud Theme

سمة Shopify Liquid مخصصة لمتجر **أنفاس العنود** — دخون، عطور، ومنتجات عناية فاخرة للسوق الإماراتي.

## المتطلبات

- [Shopify CLI](https://shopify.dev/docs/api/shopify-cli)
- حساب Shopify Partner أو متجر
- Ruby (لـ Theme Check)

## التثبيت

```bash
cd "Anfas AL-Anoud Theme"
shopify theme dev
```

## ربط GitHub

المستودع: `Anfas-Al-Anoud/anfas-al-anoud-theme`

```bash
git remote add origin https://github.com/Anfas-Al-Anoud/anfas-al-anoud-theme.git
git push -u origin main
```

## استيراد المنتجات

1. من Shopify Admin: **Products → Import**
2. ارفعي `products_export_1.csv` من جذر المشروع
3. تأكدي من تطابق الصور (CDN URLs موجودة في CSV)
4. أضيفي Alt Text عربي لكل منتج (حاليًا فارغ في CSV)

### المجموعات المقترحة

| المجموعة | نوع المنتج |
|----------|------------|
| دخون السنع | دخون السنع |
| عطور الكشخة | عطور |
| دلع وعناية | منتجات العناية |
| بوكسات الزين | بوكسات |
| Best Sellers | يدوي — أشهر المنتجات |

## الصور (Theme Editor)

راجع `Google AI Pro/Anfas_AlAnoud_Images_Guide.txt` لرفع:

- `hero_banner_desktop.jpg` / `hero_banner_mobile.jpg`
- `emirati_woman_modest.jpg` (صفحة من نحن — لاحقًا)
- `quiz_mood_1.jpg`, `quiz_mood_2.jpg`

## الصفحات المطلوب إنشاؤها في Admin

| Handle | القالب |
|--------|--------|
| privacy-policy | page.privacy-policy |
| link-hub | page.link-hub |
| terms | page.terms |
| returns | page.returns |
| shipping | page.shipping |
| payment-methods | page.payment-methods |
| order-tracking | page.order-tracking |

## Spring '26

- `color_palette` في settings_schema
- `/pages/llms-txt` و `/pages/agents-md` (أنشئي صفحات بهذه الـ handles)
- CSS subsetting: كل section يستخدم `{% stylesheet %}` ذاتي

## Theme Check

```bash
gem install theme-check
cd "Anfas AL-Anoud Theme"
theme-check .
```

## الميزات

- RTL عربي كامل
- Cart drawer + شريط شحن مجاني
- Wishlist (localStorage)
- مساعد اختيار المنتج (rule-based quiz)
- SEO: JSON-LD, FAQ schema, hreflang
- WhatsApp float
- بدون Linktree — صفحة link-hub داخلية
