#!/usr/bin/env node
/**
 * Fetch CC0 assets from Poly Haven into a site, once, by id (decisions 0016 and 0017).
 *   node framework/tools/assets.mjs add <site> <models|textures|hdris>/<id> [--res 2k] [--allow-large]
 * Files land in sites/<site>/assets/polyhaven/<kind>/<id>/ and a row is added to sites/<site>/ASSETS.md.
 * Anything over 50 MB (scanned trees reach 0.5 to 1 GB) needs --allow-large. Nothing is fetched at build time.
 */
import fs from 'node:fs';
import path from 'node:path';
import { findSite } from './lib.mjs';
import { KINDS, LARGE_BYTES, planDownload, totalBytes, ledgerRow, appendLedger } from './polyhaven-lib.mjs';

const args = process.argv.slice(2);
const [cmd, slug, spec] = args.filter((a, i) => !a.startsWith('--') && !(args[i - 1] === '--res'));
const resIdx = args.indexOf('--res');
const res = resIdx >= 0 ? args[resIdx + 1] : '2k';

function fail(msg) {
  console.error(msg);
  process.exitCode = 1;
}

if (cmd !== 'add' || !slug || !spec?.includes('/')) {
  fail('Usage: node framework/tools/assets.mjs add <site> <models|textures|hdris>/<id> [--res 2k] [--allow-large]');
} else {
  const [kind, id] = spec.split('/');
  const site = findSite(slug);
  if (!site) fail(`Site "${slug}" not found (npm run list).`);
  else if (!KINDS.includes(kind) || !/^[A-Za-z0-9_]+$/.test(id))
    fail(`Use <${KINDS.join('|')}>/<id>, for example models/pocket_watch`);
  else {
    const headers = { 'user-agent': 'webdev-capabilities (vendoring CC0 assets once)' };
    const r = await fetch(`https://api.polyhaven.com/files/${id}`, { headers });
    if (!r.ok) fail(`Poly Haven has no asset "${id}" (HTTP ${r.status}).`);
    else {
      const plan = planDownload(await r.json(), kind, id, res);
      const bytes = totalBytes(plan);
      console.log(`${kind}/${id} at ${res}: ${plan.length} file(s), ${(bytes / 1024 / 1024).toFixed(1)} MB`);
      if (bytes > LARGE_BYTES && !args.includes('--allow-large')) {
        fail(
          `That is over 50 MB. Large scans are fine for offline renders but never for real-time. Add --allow-large to download it anyway.`,
        );
      } else {
        const dir = path.join(site.dir, 'assets', 'polyhaven', kind, id);
        for (const f of plan) {
          const dest = path.join(dir, f.rel);
          fs.mkdirSync(path.dirname(dest), { recursive: true });
          if (fs.existsSync(dest)) continue;
          const res2 = await fetch(f.url, { headers });
          if (!res2.ok) throw new Error(`Download failed (${res2.status}): ${f.url}`);
          fs.writeFileSync(dest, Buffer.from(await res2.arrayBuffer()));
        }
        const row = ledgerRow({ kind, id, res, bytes, date: new Date().toISOString().slice(0, 10) });
        const added = appendLedger(site.dir, row, `${kind}/${id}`);
        console.log(
          `Saved to ${path.relative(site.dir, dir)}${added ? ' and listed in ASSETS.md' : ' (already listed in ASSETS.md)'}`,
        );
      }
    }
  }
}
