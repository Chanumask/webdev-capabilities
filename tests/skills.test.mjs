import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../tools/lib.mjs';

const skillsDir = join(root, '.claude', 'skills');
const THIRD_PARTY = ['impeccable', 'playwright-cli'];
const own = readdirSync(skillsDir).filter(
  (n) => !THIRD_PARTY.includes(n) && statSync(join(skillsDir, n)).isDirectory(),
);
const claude = readFileSync(join(root, 'CLAUDE.md'), 'utf8');
const setup = readFileSync(join(root, 'tools', 'setup.mjs'), 'utf8');

function frontmatter(file) {
  const m = /^---\n([\s\S]*?)\n---/.exec(readFileSync(file, 'utf8'));
  assert.ok(m, `${file} has no frontmatter`);
  return Object.fromEntries(
    m[1].split('\n').map((l) => {
      const i = l.indexOf(':');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
  );
}

test('there are framework skills', () => {
  assert.ok(own.length >= 10, own.join(', '));
});

for (const name of own) {
  test(`skill ${name}: frontmatter, trigger description, listed in CLAUDE.md and setup`, () => {
    const file = join(skillsDir, name, 'SKILL.md');
    assert.ok(existsSync(file), 'SKILL.md missing');
    const fm = frontmatter(file);
    assert.equal(fm.name, name, 'frontmatter name must equal the folder name');
    assert.ok(fm.description && fm.description.length > 60, 'description must say when to use the skill');
    assert.match(fm.description, /Use /, 'description must contain a "Use when" trigger');
    assert.ok(claude.includes(`\`${name}\``), `CLAUDE.md does not mention ${name}`);
    assert.ok(setup.includes(`'${name}'`), `tools/setup.mjs does not check for ${name}`);
  });
}

test('every skill link target exists (docs check covers links; here: referenced scripts)', () => {
  for (const name of own) {
    const text = readFileSync(join(skillsDir, name, 'SKILL.md'), 'utf8');
    for (const m of text.matchAll(/`((?:npm run|node) [^`]+)`/g)) {
      const cmd = m[1];
      const script = /^node (\S+\.mjs)/.exec(cmd)?.[1];
      if (script) assert.ok(existsSync(join(root, script)), `${name}: ${cmd}`);
      const npm = /^npm run ([a-z:-]+)/.exec(cmd)?.[1];
      if (npm) {
        const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
        assert.ok(pkg.scripts[npm], `${name}: npm script "${npm}" does not exist`);
      }
    }
  }
});
