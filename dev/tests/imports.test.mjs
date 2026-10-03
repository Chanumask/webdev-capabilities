import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { root } from '../../framework/tools/lib.mjs';

// ESLint does not resolve import paths. After moving files, a stale relative import only fails at run time.
// This test checks every relative import of the repository's own scripts.
const DIRS = ['framework/tools', 'dev/scripts', 'dev/tests', 'framework/capabilities/cms-providers'];

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name !== 'node_modules') walk(p, out);
    } else if (e.name.endsWith('.mjs')) out.push(p);
  }
  return out;
}

test('every relative import of the repository scripts resolves to a file', () => {
  const problems = [];
  let count = 0;
  for (const d of DIRS) {
    for (const file of walk(join(root, d))) {
      const text = readFileSync(file, 'utf8');
      for (const m of text.matchAll(
        /(?:import|export)\s[^'"`]*?from\s+['"](\.{1,2}\/[^'"]+)['"]|import\(\s*['"](\.{1,2}\/[^'"]+)['"]\s*\)/g,
      )) {
        const spec = m[1] ?? m[2];
        count++;
        if (!existsSync(resolve(dirname(file), spec))) problems.push(`${file.slice(root.length + 1)}: ${spec}`);
      }
    }
  }
  assert.ok(count > 20, `expected to find imports, found ${count}`);
  assert.deepEqual(problems, []);
});

test('every npm script points at an existing file', () => {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  const missing = [];
  for (const [name, cmd] of Object.entries(pkg.scripts)) {
    for (const m of cmd.matchAll(/node\s+(?:--test\s+)?"?([\w./-]+\.mjs)"?/g)) {
      if (!existsSync(join(root, m[1]))) missing.push(`${name}: ${m[1]}`);
    }
    for (const m of cmd.matchAll(/--(?:config|ignore-path)\s+([\w./-]+)/g)) {
      if (!existsSync(join(root, m[1]))) missing.push(`${name}: ${m[1]}`);
    }
  }
  assert.deepEqual(missing, []);
});
