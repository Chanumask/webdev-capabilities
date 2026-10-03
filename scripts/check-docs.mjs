#!/usr/bin/env node
// Docs gate: relative links resolve, every docs folder has an index that lists its files,
// decision status matches its index row, and size budgets hold. No dependencies.
// Rules live in docs/process/documentation.md.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative, resolve, basename, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warnings = [];
const rel = (p) => relative(root, p).split(sep).join('/');
const read = (p) => readFileSync(p, 'utf8');
const lines = (s) => s.replace(/\n$/, '').split('\n');

const BUDGET = { doc: 300, changelog: 150, entry: 25, handover: 15, decision: 60, claude: 100 };

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.git' || name === 'dist') continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith('.md')) out.push(p);
  }
  return out;
}

const docsDir = join(root, 'docs');
const files = [
  ...walk(docsDir),
  ...walk(join(root, '.claude', 'skills', 'new-site')),
  ...walk(join(root, '.claude', 'skills', 'build-site')),
  ...walk(join(root, '.claude', 'skills', 'change-site')),
  ...walk(join(root, '.claude', 'skills', 'export-site')),
  ...walk(join(root, '.claude', 'skills', 'onboard')),
  ...walk(join(root, '.claude', 'skills', 'feature-workflow')),
  ...walk(join(root, '.claude', 'skills', 'sanity-check')),
  ...walk(join(root, '.claude', 'skills', 'session-start')),
  ...walk(join(root, '.claude', 'skills', 'session-handover')),
  ...walk(join(root, '.claude', 'skills', 'decision-log')),
  ...walk(join(root, '.claude', 'skills', 'parallel-planning')),
  ...walk(join(root, 'framework')),
  ...walk(join(root, 'capabilities')),
  join(root, 'CLAUDE.md'),
  join(root, 'README.md'),
].filter(existsSync);

const stripCode = (s) => s.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');

// 1. Links
for (const f of files) {
  const text = stripCode(read(f));
  for (const m of text.matchAll(/\]\(([^)\s]+)\)/g)) {
    const href = m[1];
    if (/^(https?:|mailto:|#)/.test(href)) continue;
    const target = resolve(dirname(f), href.split('#')[0]);
    if (!existsSync(target)) errors.push(`${rel(f)}: broken link ${href}`);
  }
}

// 2. Indexes (docs/ folders only)
const isArchived = (f) => rel(f).startsWith('docs/archive/') && /changelog-\d{4}-\d{2}\.md$/.test(f);
const dirs = new Set(files.filter((f) => rel(f).startsWith('docs/')).map((f) => dirname(f)));
for (const d of dirs) {
  const index = join(d, 'README.md');
  if (!existsSync(index)) {
    errors.push(`${rel(d)}/: missing README.md index`);
    continue;
  }
  const indexText = read(index);
  for (const f of files.filter((x) => dirname(x) === d && basename(x) !== 'README.md' && !isArchived(x))) {
    if (!indexText.includes(`(${basename(f)})`)) errors.push(`${rel(index)}: does not list ${basename(f)}`);
  }
}
const docsIndex = read(join(docsDir, 'README.md'));
for (const sub of readdirSync(docsDir).filter(
  (n) => !n.startsWith('.') && n !== 'node_modules' && statSync(join(docsDir, n)).isDirectory(),
)) {
  if (!docsIndex.includes(`(${sub}/README.md)`)) errors.push(`docs/README.md: does not list ${sub}/`);
}

// 3. Decisions: status in file matches the index row
const decDir = join(docsDir, 'decisions');
const decIndex = existsSync(join(decDir, 'README.md')) ? read(join(decDir, 'README.md')) : '';
for (const f of files.filter((x) => dirname(x) === decDir && /\/\d{4}-/.test(rel(x)))) {
  const text = read(f);
  const status = /Status:\s*([a-z]+)/.exec(text)?.[1];
  const row = decIndex.split('\n').find((l) => l.includes(`(${basename(f)})`));
  if (!status) errors.push(`${rel(f)}: no "Status:" line`);
  else if (row && !new RegExp(`\\|\\s*${status}`).test(row))
    errors.push(`${rel(f)}: status "${status}" does not match its index row`);
  if (lines(text).length > BUDGET.decision) errors.push(`${rel(f)}: over ${BUDGET.decision} lines`);
}

// 4. Budgets
for (const f of files) {
  const n = lines(read(f)).length;
  const r = rel(f);
  if (r === 'CLAUDE.md') {
    if (n > BUDGET.claude) errors.push(`${r}: ${n} lines, budget ${BUDGET.claude}`);
  } else if (r === 'docs/changelog.md') {
    if (n > BUDGET.changelog)
      errors.push(`${r}: ${n} lines, budget ${BUDGET.changelog}. Run: node scripts/archive-changelog.mjs`);
  } else if (!isArchived(f) && !r.startsWith('docs/decisions/0') && n > BUDGET.doc) {
    errors.push(`${r}: ${n} lines, budget ${BUDGET.doc}. Split it.`);
  }
}

// 5. Changelog entries
const clPath = join(docsDir, 'changelog.md');
if (existsSync(clPath)) {
  const entries = read(clPath)
    .split(/^(?=## )/m)
    .slice(1);
  entries.forEach((e, i) => {
    const [body, handover] = e.split('**Next session**');
    const name = lines(e)[0];
    if (lines(body).length > BUDGET.entry + 2)
      warnings.push(`changelog "${name}": ${lines(body).length} lines, entries should stay under ${BUDGET.entry}`);
    if (handover && lines(handover).length > BUDGET.handover + 1)
      warnings.push(`changelog "${name}": handover block over ${BUDGET.handover} lines`);
    if (handover && i > 0) warnings.push(`changelog "${name}": handover block in a non-newest entry (fine as history)`);
  });
}

for (const w of warnings) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`error ${e}`);
console.log(`docs check: ${files.length} files, ${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length ? 1 : 0);
