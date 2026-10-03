#!/usr/bin/env node
/**
 *   node framework/tools/cms-check.mjs <site>
 * Tests the CMS connection configured in the site's .env (CMS_PROVIDER=wix ...). Read only, never writes to the CMS.
 * Providers live in framework/capabilities/cms-providers/<name>/ and export checkConnection(env, collections).
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { root, findSite, die } from './lib.mjs';

export function parseEnv(text) {
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const m = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/.exec(line);
    if (!m || line.trim().startsWith('#')) continue;
    env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return env;
}

async function main() {
  const slug = process.argv[2];
  if (!slug) die('Usage: node framework/tools/cms-check.mjs <site>');
  const site = findSite(slug);
  if (!site) die(`Site "${slug}" not found. Run: npm run list`);
  const envFile = path.join(site.dir, '.env');
  if (!fs.existsSync(envFile))
    die(
      `No .env in ${site.dir}. Copy .env.example to .env in that folder and fill in the values yourself (do not paste them in the chat).`,
    );
  const env = parseEnv(fs.readFileSync(envFile, 'utf8'));
  const provider = env.CMS_PROVIDER;
  if (!provider || provider === 'files') {
    console.log('CMS_PROVIDER is "files" (content lives in src/content). Nothing to check.');
    return;
  }
  const modFile = path.join(root, 'framework', 'capabilities', 'cms-providers', provider, `${provider}.mjs`);
  if (!fs.existsSync(modFile))
    die(
      `Unknown provider "${provider}". Available: ${fs
        .readdirSync(path.join(root, 'framework', 'capabilities', 'cms-providers'))
        .filter((n) => !n.endsWith('.md'))
        .join(', ')}`,
    );
  const mod = await import(pathToFileURL(modFile).href);
  const collections = (env.WIX_COLLECTIONS ?? env.CMS_COLLECTIONS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const rows = await mod.checkConnection(env, collections);
  for (const r of rows) console.log(`${r.ok ? 'OK  ' : 'FAIL'} ${r.collection} - ${r.message}`);
  process.exit(rows.every((r) => r.ok) ? 0 : 1);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) await main();
