import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../framework/tools/lib.mjs';
import { parseEnv } from '../../framework/tools/cms-check.mjs';

const starter = join(root, 'framework', 'templates', 'starter');

test('starter ships .env.example with the disclaimer, tracked by git, no secrets', () => {
  const file = join(starter, '.env.example');
  assert.ok(existsSync(file));
  const text = readFileSync(file, 'utf8');
  assert.match(text.split('\n').slice(0, 3).join('\n'), /READ THIS FIRST/);
  assert.match(text, /Never paste/i);
  assert.match(text, /never to open, read or print/i);
  const env = parseEnv(text);
  assert.equal(env.CMS_PROVIDER, 'files');
  assert.equal(env.WIX_API_KEY, '');
  const ignore = readFileSync(join(starter, '.gitignore'), 'utf8');
  assert.match(ignore, /^\.env$/m);
  assert.match(ignore, /^!\.env\.example$/m);
});

test('agent settings deny reading and editing .env', () => {
  const s = JSON.parse(readFileSync(join(root, '.claude', 'settings.json'), 'utf8'));
  assert.ok(s.permissions.deny.includes('Read(**/.env)'));
  assert.ok(s.permissions.deny.includes('Edit(**/.env)'));
});
