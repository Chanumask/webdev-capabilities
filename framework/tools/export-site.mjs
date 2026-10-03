#!/usr/bin/env node
/**
 * Export a site as standalone HTML you can mail to anyone.
 *   node framework/tools/export-site.mjs <site> [--no-build] [--zip]
 *
 * Builds the site, then inlines every script, stylesheet, font and image into each HTML file,
 * so a double-click opens it in any browser, offline, with all animations.
 * Output: exports/<site>/index.html (+ other pages in their own folders), exports/<site>.zip with --zip.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { findSite, root } from './lib.mjs';

const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith('--'));
if (!slug) {
  console.error('Usage: node framework/tools/export-site.mjs <site> [--no-build] [--zip]');
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

const esbuild = createRequire(path.join(siteDir, 'package.json'))('esbuild');
const MIME = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.mp4': 'video/mp4',
  '.glb': 'model/gltf-binary',
};
const uri = (file) => {
  const mime = MIME[path.extname(file).toLowerCase()];
  if (!mime || !fs.existsSync(file)) return null;
  return `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;
};
const fromDist = (ref, base) => (ref.startsWith('/') ? path.join(dist, ref) : path.resolve(base, ref));

function inlineCss(file) {
  const dir = path.dirname(file);
  return fs.readFileSync(file, 'utf8').replace(/url\(\s*["']?([^"')]+)["']?\s*\)/g, (m, ref) => {
    if (/^(data:|https?:|#)/.test(ref)) return m;
    const u = uri(fromDist(ref.split(/[?#]/)[0], dir));
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

const outDir = path.join(root, 'exports', slug);
fs.rmSync(outDir, { recursive: true, force: true });
let total = 0;
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
    const safe = code.replace(/<\/script/gi, '<\\/script');
    return `<script>document.addEventListener('DOMContentLoaded',function(){${safe}});</script>`;
  });
  html = html.replace(
    /(\s(?:src|href|poster))="(\/[^"#?]+\.(?:jpe?g|png|webp|svg|ico|gif|mp4|glb))"/g,
    (m, attr, ref) => {
      const u = uri(path.join(dist, ref));
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

  const dest = path.join(outDir, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, html);
  total += html.length;
  console.log(`  ${rel}  ${(html.length / 1024 / 1024).toFixed(2)} MB`);
}
console.log(`\nExported to exports/${slug}/  (open index.html in any browser, no internet needed)`);
if (args.includes('--zip')) {
  const zip = path.join(root, 'exports', `${slug}.zip`);
  fs.rmSync(zip, { force: true });
  execSync(`tar -a -c -f "${zip}" -C "${outDir}" .`, { stdio: 'inherit' });
  console.log(`Zip: exports/${slug}.zip`);
}
void total;
