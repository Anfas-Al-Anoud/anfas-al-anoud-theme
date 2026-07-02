#!/usr/bin/env node
/**
 * Automates Shopify Admin setup via `shopify store execute` GraphQL CLI.
 * Store must be authenticated: shopify store auth -s 564178-5f.myshopify.com
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync, writeFileSync, mkdtempSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const STORE = '564178-5f.myshopify.com';

const COLLECTIONS = [
  {
    title: 'دخون السنع',
    handle: 'dokhoon-al-san3',
    smart: true,
    rules: [{ column: 'TYPE', relation: 'EQUALS', condition: 'دخون السنع' }],
  },
  {
    title: 'عطور الكشخة',
    handle: 'perfumes',
    smart: true,
    rules: [{ column: 'TYPE', relation: 'EQUALS', condition: 'عطور الكشخة' }],
  },
  {
    title: 'دلع وعناية',
    handle: 'care',
    smart: true,
    rules: [{ column: 'TYPE', relation: 'EQUALS', condition: 'منتجات العناية' }],
  },
  {
    title: 'بوكسات الزين',
    handle: 'gift-boxes',
    smart: true,
    rules: [{ column: 'TITLE', relation: 'CONTAINS', condition: 'مجموعة' }],
  },
  {
    title: 'Best Sellers',
    handle: 'best-sellers',
    smart: false,
  },
];

const PAGES = [
  { title: 'سياسة الخصوصية', handle: 'privacy-policy', templateSuffix: 'privacy-policy' },
  { title: 'روابط أنفاس العنود', handle: 'link-hub', templateSuffix: 'link-hub' },
  { title: 'الشروط والأحكام', handle: 'terms', templateSuffix: 'terms' },
  { title: 'سياسة الإرجاع', handle: 'returns', templateSuffix: 'returns' },
  { title: 'الشحن والتوصيل', handle: 'shipping', templateSuffix: 'shipping' },
  { title: 'طرق الدفع', handle: 'payment-methods', templateSuffix: 'payment-methods' },
  { title: 'تتبع الطلب', handle: 'order-tracking', templateSuffix: 'order-tracking' },
  { title: 'LLMs.txt', handle: 'llms-txt', templateSuffix: 'llms.txt' },
  { title: 'Agents MD', handle: 'agents-md', templateSuffix: 'agents.md' },
];

function stripAnsi(text) {
  return text.replace(/\x1B\[[0-9;]*[A-Za-z]/g, '');
}

const TMP_DIR = mkdtempSync(join(tmpdir(), 'anfas-setup-'));

function gql(query, variables = {}, { allowMutations = false } = {}) {
  const queryFile = join(TMP_DIR, `query-${Date.now()}-${Math.random().toString(36).slice(2)}.graphql`);
  writeFileSync(queryFile, query, 'utf8');

  const args = ['store', 'execute', '-s', STORE, '--json', '--query-file', queryFile];
  if (Object.keys(variables).length > 0) {
    const variableFile = `${queryFile}.vars.json`;
    writeFileSync(variableFile, JSON.stringify(variables), 'utf8');
    args.push('--variable-file', variableFile);
  }
  if (allowMutations) {
    args.push('--allow-mutations');
  }

  const { status, stdout, stderr, error } = spawnSync('shopify', args, {
    encoding: 'utf8',
    cwd: ROOT,
    maxBuffer: 20 * 1024 * 1024,
    shell: true,
  });

  if (status !== 0) {
    const detail = stripAnsi(stderr || stdout || error?.message || 'shopify store execute failed');
    throw new Error(detail);
  }

  const cleaned = stripAnsi(stdout).trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error(`No JSON in CLI output:\n${cleaned}`);
  }
  return JSON.parse(cleaned.slice(start, end + 1));
}

function log(section, message) {
  console.log(`[${section}] ${message}`);
}

async function getProductsCount() {
  const data = gql(`query { productsCount { count } }`);
  return data.productsCount.count;
}

function getCollectionByHandle(handle) {
  const data = gql(
    'query ($handle: String!) { collectionByHandle(handle: $handle) { id title handle } }',
    { handle }
  );
  return data.collectionByHandle;
}

function createSmartCollection({ title, handle, rules }) {
  return gql(
    'mutation ($input: CollectionInput!) { collectionCreate(input: $input) { collection { id handle title } userErrors { field message } } }',
    {
      input: {
        title,
        handle,
        ruleSet: {
          appliedDisjunctively: false,
          rules,
        },
      },
    },
    { allowMutations: true }
  );
}

function createManualCollection({ title, handle }) {
  return gql(
    'mutation ($input: CollectionInput!) { collectionCreate(input: $input) { collection { id handle title } userErrors { field message } } }',
    { input: { title, handle } },
    { allowMutations: true }
  );
}

function getTopProductIds(limit = 8) {
  const data = gql(
    'query ($first: Int!) { products(first: $first, sortKey: CREATED_AT, reverse: true) { edges { node { id title } } } }',
    { first: limit }
  );
  return data.products.edges.map((e) => e.node);
}

function addProductsToCollection(collectionId, productIds) {
  if (!productIds.length) return null;
  return gql(
    'mutation ($id: ID!, $productIds: [ID!]!) { collectionAddProducts(id: $id, productIds: $productIds) { collection { id } userErrors { field message } } }',
    { id: collectionId, productIds },
    { allowMutations: true }
  );
}

function getPageByHandle(handle) {
  const data = gql(
    'query ($query: String!) { pages(first: 1, query: $query) { edges { node { id title handle templateSuffix } } } }',
    { query: `handle:${handle}` }
  );
  return data.pages.edges[0]?.node ?? null;
}

function createPage({ title, handle, templateSuffix }) {
  return gql(
    'mutation ($page: PageCreateInput!) { pageCreate(page: $page) { page { id handle title templateSuffix } userErrors { field message } } }',
    {
      page: {
        title,
        handle,
        templateSuffix,
        isPublished: true,
        body: `<p>محتوى الصفحة يُدار من قالب الثيم (${templateSuffix}).</p>`,
      },
    },
    { allowMutations: true }
  );
}

function getProductByHandle(handle) {
  const data = gql(
    'query ($handle: String!) { productByHandle(handle: $handle) { id handle title seo { title description } } }',
    { handle }
  );
  return data.productByHandle;
}

function updateProductSeo(id, seoTitle, seoDescription) {
  return gql(
    'mutation ($input: ProductInput!) { productUpdate(input: $input) { product { id handle } userErrors { field message } } }',
    {
      input: {
        id,
        seo: {
          title: seoTitle || undefined,
          description: seoDescription || undefined,
        },
      },
    },
    { allowMutations: true }
  );
}

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function loadAltCsv() {
  const path = join(ROOT, 'products_alt_text_update.csv');
  if (!existsSync(path)) return [];

  const text = readFileSync(path, 'utf8').replace(/^\uFEFF/, '');
  const lines = text.split(/\r?\n/).filter(Boolean);
  const header = parseCsvLine(lines[0]);
  const idx = {
    handle: header.indexOf('Handle'),
    seoTitle: header.indexOf('SEO Title'),
    seoDescription: header.indexOf('SEO Description'),
  };

  return lines.slice(1).map((line) => {
    const cols = parseCsvLine(line);
    return {
      handle: cols[idx.handle],
      seoTitle: cols[idx.seoTitle],
      seoDescription: cols[idx.seoDescription],
    };
  }).filter((row) => row.handle);
}

async function main() {
  const report = {
    productsCount: 0,
    collections: { created: [], skipped: [], errors: [] },
    pages: { created: [], skipped: [], errors: [] },
    seoUpdates: { updated: 0, skipped: 0, errors: [] },
  };

  log('products', 'Checking product count...');
  report.productsCount = await getProductsCount();
  log('products', `Found ${report.productsCount} products`);

  for (const spec of COLLECTIONS) {
    const existing = getCollectionByHandle(spec.handle);
    if (existing) {
      report.collections.skipped.push(spec.handle);
      log('collections', `Skip (exists): ${spec.handle}`);
      continue;
    }

    try {
      const result = spec.smart
        ? createSmartCollection(spec)
        : createManualCollection(spec);
      const payload = result.collectionCreate;
      if (payload.userErrors?.length) {
        report.collections.errors.push({ handle: spec.handle, errors: payload.userErrors });
        log('collections', `Error ${spec.handle}: ${payload.userErrors.map((e) => e.message).join('; ')}`);
        continue;
      }

      report.collections.created.push(spec.handle);
      log('collections', `Created: ${spec.handle}`);

      if (!spec.smart && payload.collection?.id) {
        const products = getTopProductIds(8);
        if (products.length) {
          addProductsToCollection(
            payload.collection.id,
            products.map((p) => p.id)
          );
          log('collections', `Added ${products.length} products to best-sellers`);
        }
      }
    } catch (err) {
      report.collections.errors.push({ handle: spec.handle, errors: [{ message: String(err.message || err) }] });
      log('collections', `Failed ${spec.handle}: ${err.message || err}`);
    }
  }

  for (const page of PAGES) {
    try {
      const existing = getPageByHandle(page.handle);
      if (existing) {
        report.pages.skipped.push(page.handle);
        log('pages', `Skip (exists): ${page.handle}`);
        continue;
      }

      const result = createPage(page);
      const payload = result.pageCreate;
      if (payload.userErrors?.length) {
        report.pages.errors.push({ handle: page.handle, errors: payload.userErrors });
        log('pages', `Error ${page.handle}: ${payload.userErrors.map((e) => e.message).join('; ')}`);
        continue;
      }
      report.pages.created.push(page.handle);
      log('pages', `Created: ${page.handle} (template: ${page.templateSuffix})`);
    } catch (err) {
      report.pages.errors.push({ handle: page.handle, errors: [{ message: String(err.message || err) }] });
      log('pages', `Failed ${page.handle}: ${err.message || err}`);
    }
  }

  const rows = loadAltCsv();
  if (rows.length && report.productsCount > 0) {
    log('seo', `Updating SEO for up to ${rows.length} products from CSV...`);
    for (const row of rows) {
      try {
        const product = getProductByHandle(row.handle);
        if (!product) {
          report.seoUpdates.skipped++;
          continue;
        }
        const res = updateProductSeo(product.id, row.seoTitle, row.seoDescription);
        if (res.productUpdate?.userErrors?.length) {
          report.seoUpdates.errors.push({ handle: row.handle, errors: res.productUpdate.userErrors });
        } else {
          report.seoUpdates.updated++;
        }
      } catch (err) {
        report.seoUpdates.errors.push({ handle: row.handle, errors: [{ message: String(err.message || err) }] });
      }
    }
    log('seo', `Updated ${report.seoUpdates.updated}, skipped ${report.seoUpdates.skipped}`);
  } else {
    log('seo', 'Skipped SEO CSV updates (no products or CSV missing)');
  }

  console.log('\n=== SETUP REPORT ===');
  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
