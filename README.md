# Anfas Al-Anoud Theme

سمة Shopify Liquid مخصصة لمتجر **أنفاس العنود** — دخون، عطور، ومنتجات عناية فاخرة للسوق الإماراتي.

## المتطلبات

- [Shopify CLI](https://shopify.dev/docs/api/shopify-cli)
- حساب Shopify Partner أو متجر
- Ruby (لـ Theme Check)

## CI/CD — GitHub ↔ Shopify Sync

**قواعد إلزامية:**

1. **المزامنة اللحظية:** `git push origin main` يُطبّق التغييرات على المتجر تلقائيًا عبر GitHub integration.
2. **ممنوع:** لا تستخدم `shopify theme push` — يتسبب بتضارب مع المزامنة.
3. **مزامنة الإصدار (Version sync rule):** حدّثي دائمًا `theme_version` في `config/settings_schema.json` ليطابق tag إصدار GitHub (بدون البادئة `v`، مثال: `v1.0.2` → `"1.0.2"`) **قبل** إنشاء الإصدار.
4. **ترتيب إنشاء الإصدار (Release workflow order):**
   1. حدّثي `theme_version` في `config/settings_schema.json`
   2. `git commit` و `git push` إلى `main`
   3. `gh release create v1.0.x --title "عنوان التحديث" --generate-notes`
5. **Releases:** بعد كل تحديث رئيسي:
   ```bash
   gh release create v1.0.x --title "عنوان التحديث" --generate-notes
   ```

### الدفع اليدوي إلى main (عند الحاجة)

> **ملاحظة:** عند العمل مع وكيل Cursor، الوكيل يتولى `git push` تلقائيًا — لا حاجة للخطوات التالية إلا عند الدفع يدويًا.

1. افتحي الطرفية (Terminal) داخل مجلد السمة: `Anfas AL-Anoud Theme`
2. `git status` — لمعاينة التغييرات
3. `git add .`
4. `git commit -m "رسالتك هنا"`
5. `git push origin main`
6. تحققي من Shopify Admin → **Themes** → **View logs** للتأكد من نجاح المزامنة

## التطوير المحلي

```bash
shopify theme dev
```

## المنتجات

المنتجات مسحوبة مباشرةً من المتجر (Shopify Admin) — لا يتم الاعتماد على أي ملف CSV. السمة تعرض المنتجات والصور والأوصاف كما هي في المتجر.

- تأكدي أن لكل منتج صورة ووصف ونص Alt عربي.
- المخزون والأسعار تُدار من Shopify Admin.

### المجموعات المقترحة

| المجموعة | المصدر |
|----------|--------|
| دخون السنع | حسب نوع المنتج |
| عطور الكشخة | حسب نوع المنتج |
| دلع وعناية | حسب نوع المنتج |
| بوكسات الزين | حسب نوع المنتج |
| الأكثر مبيعًا | ترتيب تلقائي حسب المبيعات (Best selling) |

## الصور (Theme Editor)

راجع `Google AI Pro/Anfas_AlAnoud_Images_Guide.txt` لرفع:

- `hero_banner_desktop.jpg` / `hero_banner_mobile.jpg`
- `emirati_woman_modest.jpg` (صفحة من نحن — لاحقًا)
- `quiz_mood_1.jpg`, `quiz_mood_2.jpg`

**الشعار:** السمة تستخدم `assets/anfas-alanoud-logo.png` تلقائيًا إن كان حقل الشعار فارغًا. اختياريًا ارفعي شعارًا من **تخصيص → إعدادات السمة → العلامة التجارية → الشعار**.

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
cd "C:\Projects\Cursor\متجر أنفاس العنود\Anfas AL-Anoud Theme"
shopify theme check --path .
```

## الميزات

- RTL عربي كامل + دعم كامل للهواتف
- سلة AJAX (Cart drawer + صفحة السلة) مع شريط شحن مجاني وعدّاد حيّ
- صفحة منتج: اختيار المتغيرات (swatches)، معرض صور، عدّاد كمية، إضافة للسلة بدون تحديث
- بطاقة منتج: صورة ثانية عند المرور، إضافة سريعة، شارات مترجمة
- صفحة المجموعة: عوامل تصفية (facets) + ترقيم صفحات مرقّم
- Wishlist (localStorage) + درج مفضلة
- مساعد اختيار المنتج الذكي (تحليل الإجابات + اقتراحات مع إضافة للسلة)
- SEO/GEO: JSON-LD (Organization + sameAs + contactPoint، WebSite، BreadcrumbList، Product)، Open Graph (ar_AE)، hreflang
- WhatsApp float
- بدون Linktree — صفحة link-hub داخلية
