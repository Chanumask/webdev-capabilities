#!/usr/bin/env node
/**
 *   node framework/tools/launch-check.mjs <site> [--no-build] [--domain example.de]
 * Pre-launch checks on the built site (dist/): leftover placeholders, SEO basics, links, third-party requests,
 * legal pages, weight. FAIL blocks the launch, WARN should be reviewed, PASS is fine.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { findSite, die } from './lib.mjs';

const FAIL_MARKERS = [
  /platzhalter/i,
  /lorem ipsum/i,
  /\bTODO\b/,
  /__(SLUG|NAME|DATE|DOMAIN)__/,
  /example\.com/i,
  /@[a-z0-9.-]*\.example\b/i,
  /\+49 000/,
];
const WARN_MARKERS = [/\bbeispiel/i, /demo[- ]?website/i, /\bdemo\b/i];

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const textOf = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ');

/** Pure-ish: inspects a dist folder, returns [{ level, check, message }]. */
export function checkDist(dist, opts = {}) {
  const res = [];
  const add = (level, check, message) => res.push({ level, check, message });
  const files = walk(dist);
  const pages = files.filter((f) => f.endsWith('.html'));
  if (!pages.length) return [{ level: 'FAIL', check: 'build', message: 'No HTML pages found in dist/. Build first.' }];

  const rel = (f) => path.relative(dist, f).split(path.sep).join('/');
  let lang = '';
  let hasImpressum = false;
  let hasDatenschutz = false;
  const thirdParty = new Set();
  const placeholderHits = new Map();
  const warnHits = new Map();

  for (const f of pages) {
    const html = fs.readFileSync(f, 'utf8');
    const name = rel(f);
    const text = textOf(html);
    if (!/<title>[^<]{3,}<\/title>/i.test(html)) add('FAIL', 'title', `${name}: missing or empty <title>`);
    const l = /<html[^>]*\blang="([^"]+)"/i.exec(html)?.[1];
    if (!l) add('FAIL', 'lang', `${name}: <html> has no lang attribute`);
    else lang = lang || l;
    if (!/<meta[^>]+name="description"[^>]+content="[^"]{20,}"/i.test(html))
      add('WARN', 'description', `${name}: no meta description of reasonable length`);
    const h1 = (html.match(/<h1[\s>]/gi) ?? []).length;
    if (name !== '404.html') {
      if (h1 === 0) add('FAIL', 'h1', `${name}: no <h1>`);
      else if (h1 > 1) add('WARN', 'h1', `${name}: ${h1} <h1> elements`);
    }
    const imgs = html.match(/<img\b[^>]*>/gi) ?? [];
    const noAlt = imgs.filter((i) => !/\balt=/.test(i)).length;
    if (noAlt) add('WARN', 'alt', `${name}: ${noAlt} image(s) without alt text`);
    if (!/rel="icon"/i.test(html)) add('WARN', 'favicon', `${name}: no favicon link`);
    if (opts.domain && name !== '404.html' && !/rel="canonical"/i.test(html))
      add('WARN', 'canonical', `${name}: no canonical link (set the site address in astro.config.mjs)`);
    for (const re of FAIL_MARKERS)
      if (re.test(text) || re.test(html.replace(/<script[\s\S]*?<\/script>/gi, '')))
        placeholderHits.set(re.source, [...(placeholderHits.get(re.source) ?? []), name]);
    for (const re of WARN_MARKERS)
      if (re.test(text)) warnHits.set(re.source, [...(warnHits.get(re.source) ?? []), name]);
    if (/impressum/i.test(text)) hasImpressum = true;
    if (/datenschutz/i.test(text)) hasDatenschutz = true;
    for (const m of html.matchAll(/\b(?:src|href)="(https?:\/\/[^"]+)"/gi)) {
      const url = m[1];
      const isAnchor = new RegExp(`<a\\b[^>]*href="${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'i').test(html);
      if (!isAnchor) thirdParty.add(new URL(url).host);
    }
    // internal links
    for (const m of html.matchAll(/\bhref="(\/[^"#?]*)(?:[#?][^"]*)?"/gi)) {
      const href = m[1];
      if (href.startsWith('//')) continue;
      const candidates = [href, `${href.replace(/\/$/, '')}/index.html`, `${href}.html`];
      if (!candidates.some((c) => fs.existsSync(path.join(dist, c)) && fs.statSync(path.join(dist, c)).isFile()))
        add('FAIL', 'links', `${name}: broken internal link ${href}`);
    }
  }

  for (const [src, where] of placeholderHits)
    add('FAIL', 'placeholder', `Leftover placeholder /${src}/ in ${[...new Set(where)].join(', ')}`);
  for (const [src, where] of warnHits)
    add(
      'WARN',
      'sample-content',
      `Text matching /${src}/ in ${[...new Set(where)].join(', ')}: fine only if it is real wording`,
    );
  if (thirdParty.size)
    add(
      'WARN',
      'third-party',
      `Requests to other hosts: ${[...thirdParty].join(', ')} (privacy/consent, check the brief)`,
    );
  if (!fs.existsSync(path.join(dist, '404.html'))) add('WARN', '404', 'No 404 page (add src/pages/404.astro)');
  if (!fs.existsSync(path.join(dist, 'robots.txt'))) add('WARN', 'robots', 'No robots.txt (run launch-prep)');
  if (!fs.existsSync(path.join(dist, 'sitemap.xml'))) add('WARN', 'sitemap', 'No sitemap.xml (run launch-prep)');
  if (/^de/i.test(lang)) {
    if (!hasImpressum) add('FAIL', 'impressum', 'German site without an Impressum link or page');
    if (!hasDatenschutz) add('FAIL', 'datenschutz', 'German site without a Datenschutz link or page');
  }
  const total = files.reduce((s, f) => s + fs.statSync(f).size, 0);
  if (total > 8 * 1024 * 1024)
    add('WARN', 'weight', `Whole site is ${(total / 1048576).toFixed(1)} MB; check images and models`);
  if (!res.some((r) => r.level === 'FAIL')) add('PASS', 'blocking', 'No blocking problems found');
  return res;
}

function main() {
  const args = process.argv.slice(2);
  const slug = args.find((a) => !a.startsWith('--'));
  if (!slug) die('Usage: node framework/tools/launch-check.mjs <site> [--no-build] [--domain example.de]');
  const site = findSite(slug);
  if (!site) die(`Site "${slug}" not found. Run: npm run list`);
  if (!args.includes('--no-build')) execSync('npm run build', { cwd: site.dir, stdio: 'ignore' });
  const di = args.indexOf('--domain');
  const results = checkDist(path.join(site.dir, 'dist'), { domain: di > -1 ? args[di + 1] : undefined });
  for (const r of results) console.log(`${r.level.padEnd(4)} ${r.check.padEnd(14)} ${r.message}`);
  const fails = results.filter((r) => r.level === 'FAIL').length;
  const warns = results.filter((r) => r.level === 'WARN').length;
  console.log(`\n${fails} blocking, ${warns} to review.`);
  process.exit(fails ? 1 : 0);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) main();
