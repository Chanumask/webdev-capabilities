#!/usr/bin/env node
// Moves the oldest entries of docs/changelog.md into docs/archive/changelog-YYYY-MM.md.
// The newest entry is never moved (it may hold the handover). Keeps entries until the live file
// would pass TARGET lines, so archiving has room before the budget in check-docs.mjs is hit.
// Usage: node scripts/archive-changelog.mjs [--dry-run] [--target 100]
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dry = process.argv.includes('--dry-run');
const ti = process.argv.indexOf('--target');
const TARGET = ti > -1 ? Number(process.argv[ti + 1]) : 100;

const clPath = join(root, 'docs', 'changelog.md');
const text = readFileSync(clPath, 'utf8');
const parts = text.split(/^(?=## )/m);
const header = parts[0];
const entries = parts.slice(1);
const count = (s) => s.replace(/\n$/, '').split('\n').length;

if (entries.length < 2) {
  console.log('nothing to archive (fewer than two entries).');
  process.exit(0);
}

let total = count(header);
const keep = [];
for (const [i, e] of entries.entries()) {
  if (i === 0 || total + count(e) <= TARGET) {
    keep.push(e);
    total += count(e);
  } else break;
}
const move = entries.slice(keep.length);
if (!move.length) {
  console.log(`nothing to archive (live file is ${total} lines, target ${TARGET}).`);
  process.exit(0);
}

/** Entries move from docs/ into docs/archive/, so their relative links get one more `../`. */
const rebaseLinks = (text) => text.replace(/\]\(((?!https?:|mailto:|#)[^)\s]+)\)/g, (_, target) => `](../${target})`);

const byMonth = new Map();
for (const e of move) {
  const m = /^## (\d{4}-\d{2})-\d{2}/.exec(e)?.[1] ?? 'undated';
  byMonth.set(m, [...(byMonth.get(m) ?? []), rebaseLinks(e)]);
}

console.log(`keeping ${keep.length} entries (${total} lines), archiving ${move.length}:`);
for (const [m, es] of byMonth) console.log(`  docs/archive/changelog-${m}.md  +${es.length}`);
if (dry) process.exit(0);

const archiveDir = join(root, 'docs', 'archive');
mkdirSync(archiveDir, { recursive: true });
for (const [m, es] of byMonth) {
  const p = join(archiveDir, `changelog-${m}.md`);
  const head = `# Changelog archive ${m}\n\n← [CLAUDE.md](../../CLAUDE.md) · [archive index](README.md)\n\nEntries moved verbatim from the live changelog, newest first.\n\n---\n\n`;
  const existing = existsSync(p) ? readFileSync(p, 'utf8') : head;
  const [h, ...old] = existing.split(/^(?=## )/m);
  writeFileSync(p, h + es.join('') + old.join(''));
}
writeFileSync(clPath, header + keep.join(''));

const idx = join(archiveDir, 'README.md');
if (existsSync(idx)) writeFileSync(idx, readFileSync(idx, 'utf8').replace(/\n?No archive files exist yet\.\n?/, '\n'));
console.log('done. Run: node scripts/check-docs.mjs');
