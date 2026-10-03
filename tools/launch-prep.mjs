#!/usr/bin/env node
/**
 *   node tools/launch-prep.mjs <site> --domain example.de [--host cloudflare-pages|netlify|vercel|github-pages|own-hosting|wix-hosted] [--www] [--force]
 * Prepares everything for deployment that needs no account: launch guide and handover templates in launch/,
 * robots.txt, sitemap.xml, security headers file for the chosen host, the site address in astro.config.mjs,
 * and the brief's front matter. No network access, nothing is published.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { root, findSite, die } from './lib.mjs';
import { parseFrontMatter, setFrontMatter } from './brief.mjs';

const HOSTS = ['cloudflare-pages', 'netlify', 'vercel', 'github-pages', 'own-hosting', 'wix-hosted'];
const DOMAIN_RE = /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))+$/;

export const isDomain = (d) => DOMAIN_RE.test(d);

/** Routes of a site from src/pages (static pages only). */
export function routesOf(siteDir) {
  const pages = path.join(siteDir, 'src', 'pages');
  const out = [];
  const walk = (dir, prefix) => {
    if (!fs.existsSync(dir)) return;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name.startsWith('_') || e.name.includes('[')) continue;
      if (e.isDirectory()) walk(path.join(dir, e.name), `${prefix}${e.name}/`);
      else if (/\.(astro|md|mdx|html)$/.test(e.name)) {
        const base = e.name.replace(/\.(astro|md|mdx|html)$/, '');
        if (base === '404' || base === '500') continue;
        out.push(base === 'index' ? prefix : `${prefix}${base}/`);
      }
    }
  };
  walk(pages, '/');
  return [...new Set(out)].sort();
}

export function sitemapXml(domainHost, routes) {
  const urls = routes.map((r) => `  <url><loc>https://${domainHost}${r}</loc></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function robotsTxt(domainHost) {
  return `User-agent: *\nAllow: /\n\nSitemap: https://${domainHost}/sitemap.xml\n`;
}

export const headersFile = `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: SAMEORIGIN
  Permissions-Policy: camera=(), microphone=(), geolocation=()
/_astro/*
  Cache-Control: public, max-age=31536000, immutable
`;

export const vercelJson = JSON.stringify(
  {
    headers: [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ],
  },
  null,
  2,
);

/** Put or replace `site: 'https://host'` in astro.config.mjs. */
export function setAstroSite(configText, url) {
  if (/\bsite:\s*['"][^'"]*['"]/.test(configText))
    return configText.replace(/\bsite:\s*['"][^'"]*['"]/, `site: '${url}'`);
  return configText.replace(/defineConfig\(\{/, `defineConfig({\n  site: '${url}',`);
}

function copyTemplates(siteDir, vars, force) {
  const src = path.join(root, 'framework', 'templates', 'launch');
  const dest = path.join(siteDir, 'launch');
  fs.mkdirSync(dest, { recursive: true });
  const written = [];
  for (const name of fs.readdirSync(src)) {
    const to = path.join(dest, name);
    if (fs.existsSync(to) && !force) continue;
    let text = fs.readFileSync(path.join(src, name), 'utf8');
    for (const [k, v] of Object.entries(vars)) text = text.replaceAll(`__${k}__`, v);
    fs.writeFileSync(to, text);
    written.push(`launch/${name}`);
  }
  return written;
}

function main() {
  const args = process.argv.slice(2);
  const slug = args.find((a) => !a.startsWith('--'));
  const opt = (k) => {
    const i = args.indexOf(k);
    return i > -1 ? args[i + 1] : undefined;
  };
  if (!slug)
    die('Usage: node tools/launch-prep.mjs <site> --domain example.de [--host cloudflare-pages] [--www] [--force]');
  const site = findSite(slug);
  if (!site) die(`Site "${slug}" not found. Run: npm run list`);
  const domain = (opt('--domain') ?? '').toLowerCase();
  const host = opt('--host') ?? 'cloudflare-pages';
  if (domain && !isDomain(domain)) die(`"${domain}" does not look like a domain name (example: meyer-architekten.de).`);
  if (!HOSTS.includes(host)) die(`Unknown host "${host}". Use one of: ${HOSTS.join(', ')}`);
  const briefFile = path.join(site.dir, 'brief', 'BRIEF.md');
  const fm = fs.existsSync(briefFile) ? parseFrontMatter(fs.readFileSync(briefFile, 'utf8')) : {};
  const canonicalHost = domain
    ? args.includes('--www')
      ? `www.${domain.replace(/^www\./, '')}`
      : domain.replace(/^www\./, '')
    : '';
  const vars = {
    SLUG: slug,
    NAME: fm.name ?? slug,
    DOMAIN: domain || 'YOUR-DOMAIN.de',
    CANONICAL_HOST: canonicalHost || 'YOUR-DOMAIN.de',
    HOST: host,
    DATE: new Date().toISOString().slice(0, 10),
  };
  const written = copyTemplates(site.dir, vars, args.includes('--force'));

  const pub = path.join(site.dir, 'public');
  fs.mkdirSync(pub, { recursive: true });
  if (canonicalHost) {
    fs.writeFileSync(path.join(pub, 'robots.txt'), robotsTxt(canonicalHost));
    fs.writeFileSync(path.join(pub, 'sitemap.xml'), sitemapXml(canonicalHost, routesOf(site.dir)));
    written.push('public/robots.txt', 'public/sitemap.xml');
    const cfg = path.join(site.dir, 'astro.config.mjs');
    if (fs.existsSync(cfg)) {
      fs.writeFileSync(cfg, setAstroSite(fs.readFileSync(cfg, 'utf8'), `https://${canonicalHost}`));
      written.push('astro.config.mjs (site address)');
    }
  }
  if (host === 'cloudflare-pages' || host === 'netlify') {
    fs.writeFileSync(path.join(pub, '_headers'), headersFile);
    written.push('public/_headers');
  } else if (host === 'vercel') {
    fs.writeFileSync(path.join(site.dir, 'vercel.json'), `${vercelJson}\n`);
    written.push('vercel.json');
  }
  if (fs.existsSync(briefFile)) {
    setFrontMatter(briefFile, { launch: 'prepared', host, ...(domain ? { domain } : {}) });
  }
  console.log(`Launch prepared for ${slug} (${host}${domain ? `, ${domain}` : ', no domain yet'}).`);
  for (const w of written) console.log(`  wrote ${w}`);
  console.log(
    '\nNext: npm run launch-check -- ' +
      slug +
      (domain ? ` --domain ${domain}` : '') +
      '  then follow sites/' +
      slug +
      '/launch/LAUNCH.md',
  );
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) main();
