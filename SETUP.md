# Anfas Al-Anoud — Store setup checklist

Project root: `متجر أنفاس العنود`

## Prerequisites

- Shopify store: **564178-5f.myshopify.com** (CLI already authenticated on this machine)
- Theme folder: `Anfas AL-Anoud Theme`
- Product CSV files (verified present):
  - `products_export_1.csv` — full product import
  - `products_alt_text_update.csv` — image alt text updates

---

## 1. GitHub repository

Remote `origin` is configured but the org repo does not exist yet (`Repository not found`).

**Option A — GitHub CLI** (install [GitHub CLI](https://cli.github.com/) if needed):

```bash
cd "C:\Projects\Cursor\متجر أنفاس العنود"
gh auth login
gh repo create Anfas-Al-Anoud/anfas-al-anoud-theme --public --source=. --remote=origin --push
```

**Option B — if the repo already exists:**

```bash
cd "C:\Projects\Cursor\متجر أنفاس العنود"
git remote set-url origin https://github.com/Anfas-Al-Anoud/anfas-al-anoud-theme.git
git push -u origin main
```

Target URL: https://github.com/Anfas-Al-Anoud/anfas-al-anoud-theme

Commit local theme fixes (font, GEO templates, index collection) before pushing if desired.

---

## 2. Shopify theme (CLI)

Store is linked via CLI session (no `.shopify/` folder; `shopify.theme.toml` has `store = "564178-5f.myshopify.com"`).

**Unpublished theme already uploaded:**

| Field | Value |
|-------|--------|
| Theme ID | `163177332957` |
| Name | Anfas Al-Anoud Theme |
| Role | unpublished |
| Editor | https://564178-5f.myshopify.com/admin/themes/163177332957/editor |
| Preview | https://564178-5f.myshopify.com?preview_theme_id=163177332957 |

**Push / update theme** (non-interactive; do not use `theme dev` in automation):

```bash
cd "C:\Projects\Cursor\متجر أنفاس العنود\Anfas AL-Anoud Theme"
shopify auth login
shopify theme push --theme 163177332957
```

**First-time unpublished theme** (if you need a new copy):

```bash
shopify theme push --unpublished --theme "Anfas Al-Anoud Theme"
```

**Font schema note:** `config/settings_schema.json` uses `assistant_n4` as the default font handle (Shopify-valid). After changing fonts, pick **Noto Sans Arabic** or **Tajawal** in **Online Store → Themes → Customize → Theme settings → Typography**, then save.

---

## 3. Products & collections (Admin)

Shopify CLI has no `product import` command. Use Admin CSV import.

### Import products

1. **Products → Import**
2. Upload `products_export_1.csv`
3. Map columns if prompted; confirm import

### Update image alt text

1. **Products → Import** (or bulk edit)
2. Upload `products_alt_text_update.csv` (update existing products by handle/SKU)

### Create collections

**Products → Collections → Create collection**:

| Title | Suggested handle |
|-------|------------------|
| دخون السنع | match navigation / SEO handle |
| عطور الكشخة | match navigation |
| دلع وعناية | match navigation |
| بوكسات الزين | match navigation |
| Best Sellers | `best-sellers` |

Homepage **Featured collection** in `templates/index.json` uses handle **`best-sellers`**.

### Policy & utility pages

**Online Store → Pages → Add page**:

| Page title (suggested) | Handle | Theme template |
|------------------------|--------|----------------|
| سياسة الخصوصية | `privacy-policy` | `page.privacy-policy` |
| Link hub | `link-hub` | `page.link-hub` |
| الشروط والأحكام | `terms` | `page.terms` |
| الإرجاع | `returns` | `page.returns` |
| الشحن | `shipping` | `page.shipping` |
| طرق الدفع | `payment-methods` | `page.payment-methods` |
| تتبع الطلب | `order-tracking` | `page.order-tracking` |

---

## 4. GEO / AI discovery pages

Templates:

- `templates/page.llms.txt.liquid` → **page.llms.txt**
- `templates/page.agents.md.liquid` → **page.agents.md**

**Pages:**

| Title | Handle | Theme template |
|-------|--------|----------------|
| LLMs.txt | `llms-txt` | `page.llms.txt` |
| Agents MD | `agents-md` | `page.agents.md` |

URLs: `/pages/llms-txt`, `/pages/agents-md`

---

## 5. Theme images

See **`Google AI Pro/Anfas_AlAnoud_Images_Guide.txt`** (Hero, About, Quiz sections in Theme Editor).

---

## 6. Go live

- [ ] Products imported
- [ ] Collections + Best Sellers
- [ ] All pages + GEO pages
- [ ] Images per guide
- [ ] WhatsApp in theme settings
- [ ] Publish theme when ready