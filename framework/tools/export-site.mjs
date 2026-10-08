#!/usr/bin/env node
/**
 * Export a site as standalone HTML you can mail to anyone.
 *   node framework/tools/export-site.mjs <site> [--no-build] [--zip] [--light] [--max-mb=N]
 *
 * Builds the site, then inlines every script, stylesheet, font, image and every asset a script refers to
 * (frames, HDRI, models) into each HTML file, so a double-click opens it in any browser, offline.
 * Output: exports/<site>/index.html (+ other pages in their own folders), exports/<site>.zip with --zip.
 * Size (decision 0014): warning above 15 MB, error above 25 MB (exit code 2; --max-mb=N raises the limit).
 * --light: raster images are re-encoded (max 960 px, quality 60) and pages get window.__LIGHT_EXPORT = true,
 * so scripts can load a reduced asset set.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { findSite, root } from './lib.mjs';
import {
  dataUri,
  mimeFor,
  createLedger,
  inlineScriptAssets,
  budgetLevel,
  markLight,
  mb,
  ERROR_BYTES,
  WARN_BYTES,
} from './export-lib.mjs';

const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith('--'));
if (!slug) {
  console.error('Usage: node framework/tools/export-site.mjs <site> [--no-build] [--zip] [--light] [--max-mb=N]');
  process.exit(1);
}

const found = findSite(slug);
const siteDir = found?.dir;
if (!siteDir) {
  console.error(`Site "${slug}" not found in sites/, framework/examples/ or framework/templates/.`);
  process.exit(1);
}

if (!args.includes('--no-build')) execSync('npm run build', { cwd: siteDir, stdio: 'inherit' });
const dist = path.join(siteDir, 'dist');
if (!fs.existsSync(dist)) {
  console.error('No dist/ folder. Build failed?');
  process.exit(1);
}

const siteRequire = createRequire(path.join(siteDir, 'package.json'));
const esbuild = siteRequire('esbuild');
const light = args.includes('--light');
const maxArg = args.find((x) => x.startsWith('--max-mb='));
const errorBytes = maxArg ? Number(maxArg.slice(9)) * 1024 * 1024 : ERROR_BYTES;
const ledger = createLedger();

// --light: re-encode raster images up front (sharp is async, the page loop below is not)
const lightImages = new Map();
if (light) {
  const sharp = siteRequire('sharp');
  const scan = async (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) await scan(p);
      else if (/\.(jpe?g|png|webp|avif)$/i.test(e.name)) {
        const img = sharp(p).resize({ width: 960, withoutEnlargement: true });
        const ext = path.extname(e.name).toLowerCase();
        if (ext === '.png') lightImages.set(p, await img.png({ palette: true, quality: 60 }).toBuffer());
        else if (ext === '.avif') lightImages.set(p, await img.avif({ quality: 45 }).toBuffer());
        else if (ext === '.webp') lightImages.set(p, await img.webp({ quality: 60 }).toBuffer());
        else lightImages.set(p, await img.jpeg({ quality: 60 }).toBuffer());
      }
    }
  };
  await scan(dist);
}
const uri = (file) => {
  const small = lightImages.get(file);
  if (small) return `data:${mimeFor(file)};base64,${small.toString('base64')}`;
  return dataUri(file);
};
const track = (file) => {
  if (fs.existsSync(file) && fs.statSync(file).isFile()) {
    ledger.add(path.relative(dist, file).split(path.sep).join('/'), fs.statSync(file).size);
  }
};
const fromDist = (ref, base) => (ref.startsWith('/') ? path.join(dist, ref) : path.resolve(base, ref));

function inlineCss(file) {
  const dir = path.dirname(file);
  return fs.readFileSync(file, 'utf8').replace(/url\(\s*["']?([^"')]+)["']?\s*\)/g, (m, ref) => {
    if (/^(data:|https?:|#)/.test(ref)) return m;
    const f = fromDist(ref.split(/[?#]/)[0], dir);
    const u = uri(f);
    if (u) track(f);
    return u ? `url(${u})` : m;
  });
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const exportsDir = process.env.WEBDEV_EXPORTS_DIR
  ? path.resolve(process.env.WEBDEV_EXPORTS_DIR)
  : path.join(root, 'exports');
const outDir = path.join(exportsDir, slug);
fs.rmSync(outDir, { recursive: true, force: true });
let total = 0;
let tooBig = false;
for (const file of walk(dist)) {
  const rel = path.relative(dist, file);
  const pageDir = path.dirname(rel);
  let html = fs.readFileSync(file, 'utf8');

  html = html.replace(/<link rel="stylesheet" href="([^"]+)"[^>]*>/g, (m, h) => {
    const f = fromDist(h, path.dirname(file));
    return fs.existsSync(f) ? `<style>${inlineCss(f)}</style>` : m;
  });
  html = html.replace(/<script type="module" src="([^"]+)"[^>]*><\/script>/g, (m, s) => {
    const f = fromDist(s, path.dirname(file));
    if (!fs.existsSync(f)) return m;
    const code = esbuild.buildSync({
      entryPoints: [f],
      bundle: true,
      format: 'iife',
      minify: true,
      write: false,
      target: 'es2020',
      legalComments: 'none',
    }).outputFiles[0].text;
    const withAssets = inlineScriptAssets(code, dist, ledger, uri);
    const safe = withAssets.replace(/<\/script/gi, '<\\/script');
    return `<script>document.addEventListener('DOMContentLoaded',function(){${safe}});</script>`;
  });
  html = html.replace(
    /(\s(?:src|href|poster))="(\/[^"#?]+\.(?:jpe?g|png|webp|avif|svg|ico|gif|mp4|glb))"/g,
    (m, attr, ref) => {
      const f = path.join(dist, ref);
      const u = uri(f);
      if (u) track(f);
      return u ? `${attr}="${u}"` : m;
    },
  );
  // internal page links -> relative file links, so a folder of pages still works from disk
  html = html.replace(/(\shref)="(\/[^"#?]*)(#[^"]*)?"/g, (m, attr, p, hash = '') => {
    if (p.startsWith('//')) return m;
    const target = p.endsWith('/') ? p + 'index.html' : p;
    if (!fs.existsSync(path.join(dist, target))) return m;
    let r = path.posix.relative(pageDir.split(path.sep).join('/') || '.', target.slice(1));
    if (!r) r = 'index.html';
    return `${attr}="${r}${hash}"`;
  });

  if (light) html = markLight(html);
  const dest = path.join(outDir, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, html);
  total += html.length;
  const level = budgetLevel(html.length, { error: errorBytes });
  const note = level === 'warn' ? '  (warning: over 15 MB)' : level === 'error' ? '  (ERROR: over the size limit)' : '';
  console.log(`  ${rel}  ${mb(html.length)} MB${note}`);
  if (level === 'error') tooBig = true;
}
console.log(`\nExported to exports/${slug}/  (open index.html in any browser, no internet needed)`);
if (ledger.count()) {
  console.log('\nHeaviest assets inlined (source size):');
  for (const [name, bytes] of ledger.top(5)) console.log(`  ${(bytes / 1024).toFixed(0).padStart(7)} KB  ${name}`);
}
if (tooBig) {
  console.error(
    `\nThe export is over ${mb(errorBytes)} MB. Options: --light (smaller images, reduced asset set), fewer or smaller frames, or --max-mb=N to accept it.`,
  );
  process.exitCode = 2;
} else if (total > WARN_BYTES) {
  console.log('\nNote: over 15 MB, some mail systems refuse files that large. Consider --light for a version to send.');
}
if (args.includes('--zip')) {
  const zip = path.join(exportsDir, `${slug}.zip`);
  fs.rmSync(zip, { force: true });
  execSync(`tar -a -c -f "${zip}" -C "${outDir}" .`, { stdio: 'inherit' });
  console.log(`Zip: exports/${slug}.zip`);
}
