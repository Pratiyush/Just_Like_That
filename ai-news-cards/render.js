#!/usr/bin/env node
/*
 * Render card designs to Instagram-ready PNGs (1080 x 1350).
 *
 *   node render.js                          every design with its own sample content -> output/
 *   node render.js --only 02,stat           only designs whose id starts with/contains these
 *   node render.js --data my-news.json      your content applied to every design -> output/<name>/
 *   node render.js --out some/dir           custom output folder
 *   node render.js --scale 2                2x pixel density (2160 x 2700)
 *   node render.js --jpg                    JPEG instead of PNG
 *   node render.js --sheet                  also write contact-sheet.png (grid of all rendered cards)
 *
 * --data accepts one object or an array of objects. Each object may have:
 *   "slug": "folder-name"        output sub-folder for that item
 *   "designs": ["02", "07"]      only render these designs for that item
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright');

const ROOT = __dirname;
const DESIGNS_DIR = path.join(ROOT, 'designs');

function parseArgs(argv) {
  const args = { only: null, data: null, out: null, scale: 1, jpg: false, sheet: false, concurrency: 4 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    if (a === '--only') args.only = next().split(',').map((s) => s.trim()).filter(Boolean);
    else if (a === '--data') args.data = next();
    else if (a === '--out') args.out = next();
    else if (a === '--scale') args.scale = Number(next()) || 1;
    else if (a === '--jpg' || a === '--jpeg') args.jpg = true;
    else if (a === '--sheet') args.sheet = true;
    else if (a === '--concurrency') args.concurrency = Math.max(1, Number(next()) || 4);
    else if (a === '-h' || a === '--help') {
      console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0]);
      process.exit(0);
    } else {
      console.error(`Unknown argument: ${a}`);
      process.exit(1);
    }
  }
  return args;
}

function listDesigns() {
  if (!fs.existsSync(DESIGNS_DIR)) return [];
  return fs
    .readdirSync(DESIGNS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !/^[_.]/.test(d.name) && fs.existsSync(path.join(DESIGNS_DIR, d.name, 'card.html')))
    .map((d) => d.name)
    .sort();
}

function matches(id, filters) {
  if (!filters || filters.length === 0) return true;
  return filters.some((f) => id === f || id.startsWith(f) || id.includes(f));
}

function slugify(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'item';
}

async function renderOne(browser, design, data, outFile, opts) {
  const context = await browser.newContext({
    viewport: { width: 1080, height: 1350 },
    deviceScaleFactor: opts.scale,
  });
  const page = await context.newPage();
  const problems = [];
  page.on('console', (msg) => {
    if (msg.type() === 'warning' || msg.type() === 'error') problems.push(`${msg.type()}: ${msg.text()}`);
  });
  page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));
  page.on('requestfailed', (req) => problems.push(`request failed: ${req.url()} (${req.failure() && req.failure().errorText})`));

  await page.addInitScript((d) => {
    window.__RENDER__ = true;
    if (d) window.CARD_DATA = d;
  }, data || null);

  const url = pathToFileURL(path.join(DESIGNS_DIR, design, 'card.html')).href;
  await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  try {
    await page.waitForFunction(() => document.documentElement.getAttribute('data-ready') === '1', null, { timeout: 30000 });
  } catch (e) {
    problems.push('timed out waiting for data-ready (is shared/card.js included?)');
  }
  await page.waitForTimeout(150);

  // Report anything visible that spills outside the card.
  const spill = await page.evaluate(() => {
    const card = document.getElementById('card');
    if (!card) return ['no #card element'];
    const cr = card.getBoundingClientRect();
    if (Math.round(cr.width) !== 1080 || Math.round(cr.height) !== 1350) {
      return [`#card is ${Math.round(cr.width)}x${Math.round(cr.height)}, expected 1080x1350`];
    }
    return [];
  });
  problems.push(...spill);

  const card = await page.$('#card');
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  await card.screenshot({ path: outFile, type: opts.jpg ? 'jpeg' : 'png', quality: opts.jpg ? 92 : undefined });
  await context.close();
  return problems;
}

async function contactSheet(browser, files, outFile) {
  const cols = 5;
  const thumbW = 360;
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    body{margin:0;padding:40px;background:#0e0e10;font:600 18px/1.3 Inter,system-ui,sans-serif;color:#ddd}
    .grid{display:grid;grid-template-columns:repeat(${cols},${thumbW}px);gap:28px 24px}
    figure{margin:0} img{width:${thumbW}px;height:${Math.round((thumbW * 1350) / 1080)}px;display:block;border-radius:10px}
    figcaption{margin-top:10px;letter-spacing:.02em}
  </style></head><body><div class="grid">${files
    .map((f) => `<figure><img src="${pathToFileURL(f).href}"><figcaption>${path.basename(f).replace(/\.(png|jpe?g)$/, '')}</figcaption></figure>`)
    .join('')}</div></body></html>`;
  const tmp = path.join(path.dirname(outFile), '.contact-sheet.html');
  fs.writeFileSync(tmp, html);
  const page = await browser.newPage({ viewport: { width: cols * thumbW + (cols - 1) * 24 + 80, height: 800 } });
  await page.goto(pathToFileURL(tmp).href, { waitUntil: 'load' });
  await page.screenshot({ path: outFile, fullPage: true });
  await page.close();
  fs.unlinkSync(tmp);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const designs = listDesigns().filter((d) => matches(d, args.only));
  if (designs.length === 0) {
    console.error('No designs matched.');
    process.exit(1);
  }

  let jobsData = [{ data: null, slug: null, designs: null }];
  let baseOut = args.out ? path.resolve(args.out) : path.join(ROOT, 'output');
  if (args.data) {
    const raw = JSON.parse(fs.readFileSync(path.resolve(args.data), 'utf8'));
    const items = Array.isArray(raw) ? raw : [raw];
    const fileSlug = slugify(path.basename(args.data, path.extname(args.data)));
    jobsData = items.map((item, i) => ({
      data: item,
      slug: item.slug || (items.length === 1 ? fileSlug : `${fileSlug}-${i + 1}`),
      designs: Array.isArray(item.designs) ? item.designs.map(String) : null,
    }));
  }

  const jobs = [];
  for (const j of jobsData) {
    for (const d of designs) {
      if (j.designs && !matches(d, j.designs)) continue;
      const dir = j.slug ? path.join(baseOut, j.slug) : baseOut;
      jobs.push({ design: d, data: j.data, out: path.join(dir, `${d}.${args.jpg ? 'jpg' : 'png'}`) });
    }
  }

  const browser = await chromium.launch();
  const rendered = [];
  let failed = 0;
  let cursor = 0;
  async function worker() {
    while (cursor < jobs.length) {
      const job = jobs[cursor++];
      try {
        const problems = await renderOne(browser, job.design, job.data, job.out, args);
        rendered.push(job.out);
        const rel = path.relative(process.cwd(), job.out);
        if (problems.length) {
          console.log(`! ${rel}`);
          problems.forEach((p) => console.log(`    ${p}`));
        } else {
          console.log(`✓ ${rel}`);
        }
      } catch (e) {
        failed++;
        console.log(`✗ ${job.design}: ${e.message}`);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(args.concurrency, jobs.length) }, worker));

  if (args.sheet && rendered.length) {
    const byDir = {};
    rendered.forEach((f) => (byDir[path.dirname(f)] = byDir[path.dirname(f)] || []).push(f));
    for (const [dir, files] of Object.entries(byDir)) {
      const sheet = path.join(dir, 'contact-sheet.png');
      await contactSheet(browser, files.sort(), sheet);
      console.log(`✓ ${path.relative(process.cwd(), sheet)}`);
    }
  }
  await browser.close();
  console.log(`\n${rendered.length} rendered, ${failed} failed.`);
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
