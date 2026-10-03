#!/usr/bin/env node
/**
 * Smoke test: builds the starter template and the reference example from scratch.
 *   node dev/scripts/smoke.mjs            starter only (fast)
 *   node dev/scripts/smoke.mjs --examples also install and build every example
 * Work happens in the git-ignored folder dev/.smoke/ (overwritten on each run, never cleaned automatically).
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { root, listSites, die } from '../../framework/tools/lib.mjs';

const dir = path.join(root, 'dev', '.smoke');
fs.mkdirSync(dir, { recursive: true });
const slug = 'smoke-starter';
const dest = path.join(dir, slug);
fs.mkdirSync(dest, { recursive: true });

function copy(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    if (['node_modules', 'dist', '.astro'].includes(e.name)) continue;
    const a = path.join(from, e.name);
    const b = path.join(to, e.name);
    if (e.isDirectory()) copy(a, b);
    else fs.copyFileSync(a, b);
  }
}
copy(path.join(root, 'framework', 'templates', 'starter'), dest);
const pkg = path.join(dest, 'package.json');
fs.writeFileSync(pkg, fs.readFileSync(pkg, 'utf8').replaceAll('__SLUG__', slug));
fs.writeFileSync(
  path.join(dest, 'src/content/site.ts'),
  fs.readFileSync(path.join(dest, 'src/content/site.ts'), 'utf8').replaceAll('__NAME__', 'Smoke'),
);

const run = (cwd, cmd) => execSync(cmd, { cwd, stdio: 'inherit' });
console.log('Starter: install and build');
run(dest, 'npm install');
run(dest, 'npm run build');
if (!fs.existsSync(path.join(dest, 'dist', 'index.html'))) die('Starter build produced no dist/index.html');
console.log('OK starter builds');

if (process.argv.includes('--examples')) {
  for (const s of listSites().filter((x) => x.group === 'examples')) {
    console.log(`Example ${s.slug}: install and build`);
    run(s.dir, 'npm install');
    run(s.dir, 'npm run build');
    if (!fs.existsSync(path.join(s.dir, 'dist', 'index.html'))) die(`Example ${s.slug} produced no dist/index.html`);
    console.log(`OK example ${s.slug} builds`);
  }
}
