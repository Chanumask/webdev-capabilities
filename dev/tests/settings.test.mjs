import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../framework/tools/lib.mjs';

const { permissions } = JSON.parse(readFileSync(join(root, '.claude', 'settings.json'), 'utf8'));

test('every git push asks for permission (decision 0012)', () => {
  assert.ok(permissions.ask.includes('Bash(git push)'));
  assert.ok(permissions.ask.includes('Bash(git push *)'));
  assert.ok(permissions.ask.some((p) => p.includes('WEBDEV_ALLOW_MAIN_PUSH=1 git push')));
  assert.ok(!permissions.allow.some((p) => p.includes('git push')), 'push must never be allowed without a prompt');
});

test('force pushes, main deletion, remote changes and repository administration stay denied', () => {
  for (const must of [
    'Bash(git push --force*)',
    'Bash(git push -f*)',
    'Bash(git push origin --delete main*)',
    'Bash(git remote add *)',
    'Bash(gh repo *)',
    'Bash(gh api *)',
    'Bash(gh auth *)',
  ]) {
    assert.ok(permissions.deny.includes(must), must);
  }
});

test('deletions ask for permission', () => {
  for (const must of ['Bash(rm *)', 'Bash(git rm *)', 'Bash(git clean *)', 'Bash(git reset --hard *)']) {
    assert.ok(permissions.ask.includes(must), must);
  }
});
