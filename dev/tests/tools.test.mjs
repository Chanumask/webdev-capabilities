import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { root, findSite, listSites } from '../../framework/tools/lib.mjs';

const node = (args, env = {}) =>
  spawnSync(process.execPath, args, { cwd: root, encoding: 'utf8', env: { ...process.env, ...env } });

test('listSites finds the reference example and the starter template', () => {
  const sites = listSites();
  assert.ok(sites.some((s) => s.group === 'examples' && s.slug === 'lindenhof'));
  assert.ok(sites.some((s) => s.group === 'templates' && s.slug === 'starter'));
  assert.equal(findSite('does-not-exist'), null);
});

test('new-site creates a site from the starter with filled placeholders', () => {
  const sitesDir = mkdtempSync(join(tmpdir(), 'webdev-sites-'));
  const r = node(
    ['framework/tools/new-site.mjs', 'meyer-architekten', 'Meyer Architekten', '--no-install', '--no-git'],
    {
      WEBDEV_SITES_DIR: sitesDir,
    },
  );
  assert.equal(r.status, 0, r.stderr);
  const dir = join(sitesDir, 'meyer-architekten');
  for (const f of [
    'package.json',
    'src/pages/index.astro',
    'brief/BRIEF.md',
    'brief/INTAKE.md',
    'brief/ACCEPTANCE.md',
    'brief/CHANGELOG.md',
    'brief/FRAMEWORK-FEEDBACK.md',
  ]) {
    assert.ok(existsSync(join(dir, f)), f);
  }
  assert.equal(JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')).name, 'meyer-architekten');
  assert.match(readFileSync(join(dir, 'brief', 'BRIEF.md'), 'utf8'), /name: Meyer Architekten/);
  for (const f of ['package.json', 'README.md', 'src/content/site.ts', 'brief/BRIEF.md']) {
    assert.doesNotMatch(readFileSync(join(dir, f), 'utf8'), /__(SLUG|NAME|DATE)__/, f);
  }
});

test('new-site rejects bad slugs and duplicates', () => {
  const sitesDir = mkdtempSync(join(tmpdir(), 'webdev-sites-'));
  const env = { WEBDEV_SITES_DIR: sitesDir };
  assert.notEqual(node(['framework/tools/new-site.mjs', 'Bad Slug', '--no-install', '--no-git'], env).status, 0);
  assert.equal(node(['framework/tools/new-site.mjs', 'ok-slug', '--no-install', '--no-git'], env).status, 0);
  assert.notEqual(node(['framework/tools/new-site.mjs', 'ok-slug', '--no-install', '--no-git'], env).status, 0);
});

test('new-site makes each site its own git repository', () => {
  const sitesDir = mkdtempSync(join(tmpdir(), 'webdev-sites-'));
  const r = node(['framework/tools/new-site.mjs', 'own-repo', '--no-install'], { WEBDEV_SITES_DIR: sitesDir });
  assert.equal(r.status, 0, r.stderr);
  assert.ok(existsSync(join(sitesDir, 'own-repo', '.git')));
});
