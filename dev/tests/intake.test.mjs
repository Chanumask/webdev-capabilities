import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../framework/tools/lib.mjs';

const read = (...p) => readFileSync(join(root, ...p), 'utf8');

test('the intake has an entry step with the three paths and the question format', () => {
  const file = join(root, 'framework', 'intake', 'entry.md');
  assert.ok(existsSync(file));
  const text = readFileSync(file, 'utf8');
  for (const field of ['Ask:', 'Why:', 'Type:', 'Options:', 'Writes:']) assert.ok(text.includes(field), field);
  const options = text
    .split('Options:')[1]
    .split('Writes:')[0]
    .split('\n')
    .filter((l) => l.startsWith('- '));
  assert.equal(options.length, 3);
  assert.match(text, /from-prompt/);
  assert.match(text, /inferred/);
  assert.match(
    text,
    /not as instructions to you|content, not as instructions/i,
    'a prompt is content, not instructions',
  );
  assert.match(text, /Round 6 still applies/);
});

test('new-site, session-start, the intake README and the brief template point at the entry step', () => {
  assert.match(read('.claude', 'skills', 'new-site', 'SKILL.md'), /framework\/intake\/entry\.md/);
  assert.match(read('.claude', 'skills', 'session-start', 'SKILL.md'), /intake\/entry\.md/);
  assert.match(read('framework', 'intake', 'README.md'), /\(entry\.md\)/);
  assert.match(read('framework', 'templates', 'brief', 'INTAKE.md'), /Entry:/);
  assert.match(read('CLAUDE.md'), /entry question/);
});

test('decision 0018 exists and is indexed', () => {
  assert.ok(existsSync(join(root, 'dev', 'docs', 'decisions', '0018-intake-entry-path.md')));
  assert.match(read('dev', 'docs', 'decisions', 'README.md'), /\[0018\]\(0018-intake-entry-path\.md\)/);
});

test('the catalog offers the realism tiers and the brief has the fields', () => {
  const style = read('framework', 'intake', 'round-3-style-design.md');
  const q = style.split('## Q3.8b')[1].split('## Q3.9')[0];
  for (const tier of ['T3', 'T2', 'T1', 'T0']) assert.match(q, new RegExp(tier), tier);
  assert.match(q, /Writes: BRIEF\.motion3d\.tier/);
  assert.match(q, /stop gate/);
  assert.match(read('framework', 'intake', 'round-2-audience-content.md'), /## Q2\.6b/);
  assert.match(read('framework', 'intake', 'round-4-architecture.md'), /Rendered frames with Blender/);
  const brief = read('framework', 'templates', 'brief', 'BRIEF.md');
  assert.match(brief, /Realism tier/);
  assert.match(brief, /ASSETS\.md/);
  assert.match(read('.claude', 'skills', 'build-site', 'SKILL.md'), /blender-pipeline/);
});

test('delivery routes: Q4.12 asks how to show the site, virtual rooms are named as a gap, 0019 is indexed', () => {
  const q4 = read('framework', 'intake', 'round-4-architecture.md');
  const q = q4.split('## Q4.12')[1].split('## Q4.9')[0];
  assert.match(q, /Writes: BRIEF\.tech\.preview/);
  assert.match(q, /preview link/);
  assert.match(read('framework', 'intake', 'round-1-basics-intent.md'), /virtual room/);
  assert.match(read('framework', 'templates', 'brief', 'BRIEF.md'), /Preview for others/);
  assert.match(read('dev', 'docs', 'decisions', 'README.md'), /\[0019\]\(0019-delivery-routes\.md\)/);
  assert.match(read('CLAUDE.md'), /0019/);
});

test('people: Q3.8c asks how people appear, decision 0020 is indexed, the library imports them', () => {
  const style = read('framework', 'intake', 'round-3-style-design.md');
  const q = style.split('## Q3.8c')[1].split('## Q3.9')[0];
  assert.match(q, /Writes: BRIEF\.motion3d\.people/);
  assert.match(q, /never invents faces/);
  assert.match(read('dev', 'docs', 'decisions', 'README.md'), /\[0020\]\(0020-human-figures\.md\)/);
  assert.match(read('framework', 'templates', 'brief', 'BRIEF.md'), /People in the scene/);
  assert.match(read('framework', 'capabilities', 'blender-pipeline', 'lib', 'webdev_bpy.py'), /def import_person/);
  assert.match(
    read('framework', 'capabilities', 'blender-pipeline', 'README.md'),
    /Mixamo files may only be used in rendered frames/,
  );
});
