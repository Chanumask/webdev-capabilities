#!/usr/bin/env node
/**
 *   node framework/tools/new-site.mjs <slug> ["Display Name"] [--no-install] [--no-git]
 * Creates sites/<slug> from framework/templates/starter and the brief folder from framework/templates.
 * Each site is its own git repository (customer work never lands in the framework repo, decision 0003).
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { root, groupDir, findSite, die } from './lib.mjs';

const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith('--'));
const slug = positional[0];
const name = positional[1] ?? slug;
if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
  die(
    'Usage: node framework/tools/new-site.mjs <slug> ["Display Name"]\nThe slug must be lowercase letters, numbers and dashes, e.g. "meyer-architekten".',
  );
}
const dest = path.join(groupDir('sites'), slug);
if (findSite(slug) || fs.existsSync(dest)) die(`Site "${slug}" already exists.`);

const SKIP = new Set(['node_modules', 'dist', '.astro', 'dist-export']);
function copy(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const a = path.join(from, e.name);
    const b = path.join(to, e.name);
    if (e.isDirectory()) copy(a, b);
    else fs.copyFileSync(a, b);
  }
}
const fill = (file) => {
  if (!fs.existsSync(file)) return;
  const text = fs.readFileSync(file, 'utf8');
  fs.writeFileSync(
    file,
    text
      .replaceAll('__SLUG__', slug)
      .replaceAll('__NAME__', name)
      .replaceAll('__DATE__', new Date().toISOString().slice(0, 10)),
  );
};

copy(path.join(root, 'framework', 'templates', 'starter'), dest);
copy(path.join(root, 'framework', 'templates', 'brief'), path.join(dest, 'brief'));
for (const f of [
  'package.json',
  'README.md',
  'src/content/site.ts',
  'brief/BRIEF.md',
  'brief/INTAKE.md',
  'brief/CHANGELOG.md',
  'brief/ACCEPTANCE.md',
  'brief/FRAMEWORK-FEEDBACK.md',
]) {
  fill(path.join(dest, f));
}

if (!args.includes('--no-install')) {
  console.log('Installing dependencies...');
  execSync('npm install', { cwd: dest, stdio: 'inherit' });
}
if (!args.includes('--no-git')) {
  try {
    execSync('git init -q -b main', { cwd: dest });
    execSync('git add -A', { cwd: dest });
    execSync('git commit -q -m "chore: create site from starter"', { cwd: dest, stdio: 'ignore' });
  } catch {
    console.warn(
      'Could not create the first commit in the site repository (is git configured? user.name and user.email).',
    );
  }
}
console.log(
  `\nCreated ${path.relative(root, dest) || dest}\n  brief:   brief/\n  run:     npm run dev -- ${slug}\n  export:  npm run export -- ${slug}\n`,
);
