import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { root } from '../../framework/tools/lib.mjs';
import {
  MIME,
  mimeFor,
  dataUri,
  budgetLevel,
  createLedger,
  inlineScriptAssets,
  markLight,
  WARN_BYTES,
  ERROR_BYTES,
} from '../../framework/tools/export-lib.mjs';

const tmp = (p) => mkdtempSync(join(tmpdir(), p));

test('mime table covers the photoreal asset types', () => {
  for (const ext of ['.avif', '.webp', '.hdr', '.exr', '.glb', '.gltf', '.bin', '.ktx2', '.wasm', '.mp4']) {
    assert.ok(MIME[ext], ext);
  }
  assert.equal(mimeFor('/x/frame.AVIF'), 'image/avif');
  assert.equal(mimeFor('/x/readme.md'), null);
});

test('budget levels follow decision 0014 (warn 15 MB, error 25 MB)', () => {
  assert.equal(WARN_BYTES, 15 * 1024 * 1024);
  assert.equal(ERROR_BYTES, 25 * 1024 * 1024);
  assert.equal(budgetLevel(1024), 'ok');
  assert.equal(budgetLevel(WARN_BYTES + 1), 'warn');
  assert.equal(budgetLevel(ERROR_BYTES + 1), 'error');
  assert.equal(budgetLevel(ERROR_BYTES + 1, { error: ERROR_BYTES * 2 }), 'warn');
});

test('assets referenced by script strings are inlined as data URIs and counted', () => {
  const dist = tmp('webdev-dist-');
  mkdirSync(join(dist, 'frames'));
  writeFileSync(join(dist, 'frames', '001.avif'), Buffer.from([1, 2, 3, 4]));
  writeFileSync(join(dist, 'env.hdr'), Buffer.from('HDR'));
  const ledger = createLedger();
  const code = `const a="/frames/001.avif",b='/env.hdr',c="/missing.glb",d="/notes.txt";`;
  const out = inlineScriptAssets(code, dist, ledger);
  assert.match(out, /"data:image\/avif;base64,AQIDBA=="/);
  assert.match(out, /'data:application\/octet-stream;base64,SERS'/);
  assert.ok(out.includes('"/missing.glb"'), 'unknown files stay untouched');
  assert.ok(out.includes('"/notes.txt"'), 'unknown types stay untouched');
  assert.equal(ledger.count(), 2);
  assert.equal(ledger.total(), 7);
});

test('replacement patterns in the code are not interpreted ($& and $1 survive)', () => {
  const dist = tmp('webdev-dist-');
  writeFileSync(join(dist, 'a.webp'), Buffer.from([9]));
  const code = `x.replace(/a/,"$&$1");const u="/a.webp";`;
  const out = inlineScriptAssets(code, dist);
  assert.ok(out.includes('x.replace(/a/,"$&$1")'));
  assert.ok(out.includes('data:image/webp;base64,CQ=='));
});

test('a light export marks the document for scripts', () => {
  const html = markLight('<!doctype html><html><head><meta charset="utf-8"></head><body></body></html>');
  assert.match(html, /<head><script>window\.__LIGHT_EXPORT=true;<\/script>/);
  assert.equal(dataUri(join(tmp('webdev-x-'), 'nope.avif')), null);
});

// End to end: needs esbuild from an installed example, so it is skipped on a fresh clone.
const esbuildHome = join(root, 'framework', 'examples', 'lindenhof', 'node_modules');
test(
  'export inlines script assets from a fake dist and enforces the size limit',
  { skip: !existsSync(join(esbuildHome, 'esbuild')) },
  () => {
    const sites = tmp('webdev-sites-');
    const exportsDir = tmp('webdev-exports-');
    const site = join(sites, 'fake');
    mkdirSync(join(site, 'dist', 'frames'), { recursive: true });
    writeFileSync(join(site, 'package.json'), '{"name":"fake"}');
    symlinkSync(esbuildHome, join(site, 'node_modules'), 'junction');
    writeFileSync(join(site, 'dist', 'frames', '001.avif'), Buffer.alloc(2048, 7));
    writeFileSync(join(site, 'dist', 'main.js'), 'window.__f="/frames/001.avif";');
    writeFileSync(
      join(site, 'dist', 'index.html'),
      '<!doctype html><html><head></head><body><script type="module" src="/main.js"></script></body></html>',
    );
    const run = (extra = []) =>
      spawnSync(process.execPath, ['framework/tools/export-site.mjs', 'fake', '--no-build', ...extra], {
        cwd: root,
        encoding: 'utf8',
        env: { ...process.env, WEBDEV_SITES_DIR: sites, WEBDEV_EXPORTS_DIR: exportsDir },
      });
    let r = run();
    assert.equal(r.status, 0, r.stderr + r.stdout);
    const html = readFileSync(join(exportsDir, 'fake', 'index.html'), 'utf8');
    assert.match(html, /data:image\/avif;base64,/);
    assert.ok(!html.includes('"/frames/001.avif"'));
    assert.match(r.stdout, /frames\/001\.avif/);
    r = run(['--max-mb=0.001']);
    assert.equal(r.status, 2, 'over the limit exits with code 2');
    assert.match(r.stderr, /over/i);
  },
);
