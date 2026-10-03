import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { root } from '../../framework/tools/lib.mjs';

const sh = (cmd, cwd, env = {}) =>
  spawnSync(cmd, { shell: true, cwd, encoding: 'utf8', env: { ...process.env, ...env } });

function commitMsg(subject) {
  const dir = mkdtempSync(join(tmpdir(), 'webdev-msg-'));
  const file = join(dir, 'MSG');
  writeFileSync(file, `${subject}\n`);
  return sh(
    `sh "${join(root, 'dev/hooks', 'commit-msg').replaceAll('\\', '/')}" "${file.replaceAll('\\', '/')}"`,
    root,
  );
}

test('commit-msg accepts conventional commits', () => {
  for (const s of ['feat(tools): add export', 'fix: typo', 'docs(framework): update intake', 'chore!: breaking']) {
    assert.equal(commitMsg(s).status, 0, s);
  }
});

test('commit-msg rejects other subjects', () => {
  for (const s of ['Added stuff', 'feat add export', 'Feat: capital', `feat: ${'x'.repeat(80)}`]) {
    assert.notEqual(commitMsg(s).status, 0, s);
  }
});

function fixture() {
  const dir = mkdtempSync(join(tmpdir(), 'webdev-hooks-'));
  sh('git init -q -b main', dir);
  sh('git config user.name Test && git config user.email test@example.com && git config commit.gpgsign false', dir);
  mkdirSync(join(dir, 'dev/hooks'), { recursive: true });
  cpSync(join(root, 'dev/hooks'), join(dir, 'dev/hooks'), { recursive: true });
  sh('git config core.hooksPath dev/hooks', dir);
  writeFileSync(join(dir, 'a.txt'), 'a\n');
  return dir;
}

test('pre-commit blocks commits on main, allows them on a feature branch', () => {
  const dir = fixture();
  sh('git add a.txt', dir);
  const onMain = sh('git commit -m "chore: first"', dir);
  assert.notEqual(onMain.status, 0);
  assert.match(onMain.stderr, /no direct commits on main/);

  const allowed = sh('git commit -m "chore: first"', dir, { WEBDEV_ALLOW_MAIN: '1' });
  assert.equal(allowed.status, 0, allowed.stderr);

  sh('git switch -q -c feat/x', dir);
  writeFileSync(join(dir, 'b.txt'), 'b\n');
  sh('git add b.txt', dir);
  const onBranch = sh('git commit -m "feat: b"', dir);
  assert.equal(onBranch.status, 0, onBranch.stderr);
});

test('pre-commit blocks customer sites, env files and secrets', () => {
  const dir = fixture();
  sh('git switch -q -c feat/x', dir);
  mkdirSync(join(dir, 'sites', 'acme'), { recursive: true });
  writeFileSync(join(dir, 'sites', 'acme', 'index.html'), 'x');
  writeFileSync(join(dir, '.env'), 'A=1');
  sh('git add -f sites .env', dir);
  const r = sh('git commit -m "feat: bad"', dir);
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /must not be committed/);
});

test('pre-commit blocks deleting tracked files without approval', () => {
  const dir = fixture();
  sh('git switch -q -c feat/x', dir);
  sh('git add a.txt', dir);
  assert.equal(sh('git commit -m "chore: a"', dir).status, 0);
  sh('git rm -q a.txt', dir);
  const r = sh('git commit -m "chore: remove a"', dir);
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /deletes tracked files/);
  assert.equal(sh('git commit -m "chore: remove a"', dir, { WEBDEV_ALLOW_DELETE: '1' }).status, 0);
});

const ZERO = '0'.repeat(40);
const SHA = 'a'.repeat(40);
function prePush(remoteUrl, line, env = {}) {
  const hook = join(root, 'dev/hooks', 'pre-push').replaceAll('\\', '/');
  return spawnSync(`sh "${hook}" origin ${remoteUrl}`, {
    shell: true,
    cwd: root,
    input: `${line}\n`,
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });
}
const URL_OK = 'https://github.com/Chanumask/webdev-capabilities.git';

test('pre-push refuses other remotes', () => {
  const r = prePush('https://github.com/someone/else.git', `refs/heads/feat/x ${SHA} refs/heads/feat/x ${ZERO}`);
  assert.notEqual(r.status, 0);
});

test('pre-push allows feature branches', () => {
  const r = prePush(URL_OK, `refs/heads/feat/x ${SHA} refs/heads/feat/x ${ZERO}`);
  assert.equal(r.status, 0, r.stderr);
});

test('pre-push blocks main unless the user sets the override', () => {
  const line = `refs/heads/main ${SHA} refs/heads/main ${ZERO}`;
  const blocked = prePush(URL_OK, line);
  assert.notEqual(blocked.status, 0);
  assert.match(blocked.stderr, /explicit approval each time/);
  const allowed = prePush(URL_OK, line, { WEBDEV_ALLOW_MAIN_PUSH: '1' });
  assert.equal(allowed.status, 0, allowed.stderr);
});

test('pre-push blocks remote deletions without approval', () => {
  const r = prePush(URL_OK, `(delete) ${ZERO} refs/heads/feat/x ${SHA}`);
  assert.notEqual(r.status, 0);
});
