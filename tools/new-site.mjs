#!/usr/bin/env node
/**
 *   node tools/new-site.mjs <slug> ["Display Name"] [--no-install]
 * Creates sites/<slug> from templates/starter and the brief folder from framework/templates.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { root, findSite, die } from './lib.mjs';

const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith('--'));
const name = args.filter((a) => !a.startsWith('--'))[1] ?? slug;
if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) die('Usage: node tools/new-site.mjs <slug> ["Display Name"]\nThe slug must be lowercase letters, numbers and dashes, e.g. "meyer-architekten".');
if (findSite(slug) || fs.existsSync(path.join(root, 'sites', slug))) die(`Site "${slug}" already exists.`);

const SKIP = new Set(['node_modules', 'dist', '.astro', 'dist-export']);
function copy(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const a = path.join(from, e.name), b = path.join(to, e.name);
    if (e.isDirectory()) copy(a, b); else fs.copyFileSync(a, b);
  }
}
const fill = (file) => {
  if (!fs.existsSync(file)) return;
  fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replaceAll('__SLUG__', slug).replaceAll('__NAME__', name).replaceAll('__DATE__', new Date().toISOString().slice(0, 10)));
};

const dest = path.join(root, 'sites', slug);
copy(path.join(root, 'templates', 'starter'), dest);
copy(path.join(root, 'framework', 'templates', 'brief'), path.join(dest, 'brief'));
for (const f of ['package.json', 'README.md', 'src/content/site.ts', 'brief/BRIEF.md', 'brief/INTAKE.md', 'brief/CHANGELOG.md', 'brief/ACCEPTANCE.md']) fill(path.join(dest, f));

if (!args.includes('--no-install')) { console.log('Installing dependencies...'); execSync('npm install', { cwd: dest, stdio: 'inherit' }); }
console.log(`\nCreated sites/${slug}\n  brief:   sites/${slug}/brief/\n  run:     npm run dev -- ${slug}\n  export:  npm run export -- ${slug}\n`);
