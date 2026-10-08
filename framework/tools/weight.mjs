#!/usr/bin/env node
/**
 * Page weight report of a built site.
 *   node framework/tools/weight.mjs <site> [--build] [--budget-mb=N]
 * Lists the heaviest files in dist/, totals by type and estimates the size of the single-file export
 * (base64 adds a third). Exit code 2 when the estimate is over the budget (default 25 MB, decision 0014).
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { findSite } from './lib.mjs';
import { ERROR_BYTES, WARN_BYTES, mb } from './export-lib.mjs';

const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith('--'));
if (!slug) {
  console.error('Usage: node framework/tools/weight.mjs <site> [--build] [--budget-mb=N]');
  process.exit(1);
}
const site = findSite(slug);
if (!site) {
  console.error(`Site "${slug}" not found.`);
  process.exit(1);
}
const dist = path.join(site.dir, 'dist');
if (args.includes('--build') || !fs.existsSync(dist)) execSync('npm run build', { cwd: site.dir, stdio: 'inherit' });

const files = [];
const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else files.push({ name: path.relative(dist, p).split(path.sep).join('/'), bytes: fs.statSync(p).size });
  }
};
walk(dist);

const total = files.reduce((a, f) => a + f.bytes, 0);
const byType = new Map();
for (const f of files) {
  const ext = path.extname(f.name).toLowerCase() || '(none)';
  byType.set(ext, (byType.get(ext) ?? 0) + f.bytes);
}
const budgetArg = args.find((a) => a.startsWith('--budget-mb='));
const budget = budgetArg ? Number(budgetArg.slice(12)) * 1024 * 1024 : ERROR_BYTES;
// text (scripts, styles, markup) is inlined as it is, everything else as base64 (+33%)
const isText = (n) => /.(js|mjs|css|html|svg|json)$/i.test(n);
const estimate = Math.round(files.reduce((a, f) => a + f.bytes * (isText(f.name) ? 1 : 4 / 3), 0));

console.log(`${slug}: ${files.length} files, ${mb(total)} MB in dist/`);
console.log('\nHeaviest files:');
for (const f of [...files].sort((a, b) => b.bytes - a.bytes).slice(0, 8)) {
  console.log(`  ${(f.bytes / 1024).toFixed(0).padStart(8)} KB  ${f.name}`);
}
console.log('\nBy type:');
for (const [ext, bytes] of [...byType.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)) {
  console.log(`  ${(bytes / 1024).toFixed(0).padStart(8)} KB  ${ext}`);
}
console.log(
  `\nEstimated single-file export: about ${mb(estimate)} MB (limit ${mb(budget)} MB, warning at ${mb(WARN_BYTES)} MB)`,
);
if (estimate > budget) {
  console.error('Over the limit: use fewer or smaller frames, a smaller HDRI, or export with --light.');
  process.exitCode = 2;
} else if (estimate > WARN_BYTES) console.log('Over the warning line: consider --light for a version to send.');
