import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { root } from '../../framework/tools/lib.mjs';
import {
  SETS,
  parseVersion,
  blenderCandidates,
  locateBlender,
  renderEnv,
  validateGlb,
  inlineEstimate,
} from '../../framework/tools/blender-lib.mjs';
import {
  planDownload,
  totalBytes,
  ledgerRow,
  appendLedger,
  LEDGER_HEADER,
  LARGE_BYTES,
} from '../../framework/tools/polyhaven-lib.mjs';

const tmp = (p) => mkdtempSync(join(tmpdir(), p));

function glb(json, binLength = 64) {
  const j = Buffer.from(JSON.stringify(json));
  const jpad = Buffer.concat([j, Buffer.alloc((4 - (j.length % 4)) % 4, 0x20)]);
  const bin = Buffer.alloc(binLength);
  const head = Buffer.alloc(12);
  head.writeUInt32LE(0x46546c67, 0);
  head.writeUInt32LE(2, 4);
  head.writeUInt32LE(12 + 8 + jpad.length + 8 + bin.length, 8);
  const c1 = Buffer.alloc(8);
  c1.writeUInt32LE(jpad.length, 0);
  c1.writeUInt32LE(0x4e4f534a, 4);
  const c2 = Buffer.alloc(8);
  c2.writeUInt32LE(bin.length, 0);
  c2.writeUInt32LE(0x004e4942, 4);
  return Buffer.concat([head, c1, jpad, c2, bin]);
}

test('parseVersion reads the Blender banner', () => {
  assert.deepEqual(parseVersion('Blender 5.2.1 LTS\n\tbuild date'), { major: 5, minor: 2, patch: 1 });
  assert.equal(parseVersion('nope'), null);
});

test('blender is found from BLENDER first, then the newest install folder on Windows', () => {
  const list = () => ['Blender 4.5', 'Blender 5.2', 'Blender 5.10', 'Other'];
  const c = blenderCandidates({
    env: { BLENDER: 'X:\\b.exe', ProgramFiles: 'C:\\Program Files' },
    platform: 'win32',
    list,
  });
  assert.equal(c[0], 'X:\\b.exe');
  assert.ok(c[1].includes('Blender 5.10'), 'version compare is numeric, 5.10 beats 5.2');
  assert.ok(c.some((p) => p.includes('Blender 4.5')));
  const found = locateBlender({ env: {}, platform: 'win32', list, exists: (p) => p.includes('Blender 5.2') });
  assert.ok(found.includes('Blender 5.2'));
  assert.equal(locateBlender({ env: {}, platform: 'linux', exists: () => false }), null);
});

test('render sets and the script environment', () => {
  assert.ok(SETS.phone.h > SETS.phone.w, 'the phone set is portrait');
  assert.ok(SETS.desktop.w > SETS.desktop.h);
  const env = renderEnv({ siteDir: '/s', outDir: '/o', libDir: '/l', w: 1920, h: 1080, samples: 64, n: 60, only: 0 });
  assert.deepEqual(env, {
    WEBDEV_ASSETS: '/s',
    WEBDEV_OUT: '/o',
    PYTHONPATH: '/l',
    W: '1920',
    H: '1080',
    S: '64',
    N: '60',
    ONLY: '0',
  });
  assert.equal(renderEnv({ siteDir: '/s', outDir: '/o', libDir: '/l' }).ONLY, undefined);
});

test('GLB validation catches a texture without an image and accepts meshopt fallback buffers', () => {
  const good = glb({
    asset: { version: '2.0' },
    images: [{ bufferView: 0 }],
    textures: [{ source: 0 }],
    bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: 16 }],
  });
  assert.equal(validateGlb(good).ok, true);
  const noImage = glb({ asset: { version: '2.0' }, images: [], textures: [{ source: 0 }] });
  const r = validateGlb(noImage);
  assert.equal(r.ok, false);
  assert.match(r.problems[0], /texture 0 has no image/);
  const meshopt = glb({
    asset: { version: '2.0' },
    extensionsUsed: ['EXT_meshopt_compression'],
    buffers: [{ byteLength: 64 }, { byteLength: 100000, extensions: { EXT_meshopt_compression: { fallback: true } } }],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: 32 },
      { buffer: 1, byteOffset: 0, byteLength: 100000 },
    ],
  });
  const m = validateGlb(meshopt);
  assert.equal(m.ok, true, m.problems.join(';'));
  assert.equal(m.info.meshopt, true);
  const past = glb({
    asset: { version: '2.0' },
    buffers: [{ byteLength: 64 }],
    bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: 5000 }],
  });
  assert.equal(validateGlb(past).ok, false);
  assert.equal(validateGlb(Buffer.from('not a glb at all, really not')).ok, false);
});

test('Poly Haven download plans for models, hdris and textures', () => {
  const model = {
    gltf: {
      '2k': {
        gltf: {
          url: 'https://x/a_2k.gltf',
          size: 10,
          include: { 'textures/d.jpg': { url: 'https://x/d.jpg', size: 90 } },
        },
      },
    },
  };
  const p = planDownload(model, 'models', 'a', '2k');
  assert.deepEqual(
    p.map((f) => f.rel),
    ['a_2k.gltf', 'textures/d.jpg'],
  );
  assert.equal(totalBytes(p), 100);
  assert.throws(() => planDownload(model, 'models', 'a', '4k'), /No glTF/);
  const hdr = planDownload({ hdri: { '1k': { hdr: { url: 'https://x/s_1k.hdr', size: 5 } } } }, 'hdris', 's', '1k');
  assert.equal(hdr[0].rel, 's_1k.hdr');
  const tex = planDownload(
    { Diffuse: { '2k': { jpg: { url: 'u1', size: 1 } } }, Rough: { '2k': { jpg: { url: 'u2', size: 1 } } } },
    'textures',
    't',
    '2k',
  );
  assert.deepEqual(
    tex.map((f) => f.rel),
    ['t_Diffuse_2k.jpg', 't_Rough_2k.jpg'],
  );
  assert.throws(() => planDownload({}, 'sounds', 'x'), /Unknown kind/);
  assert.ok(LARGE_BYTES === 50 * 1024 * 1024);
});

test('the assets ledger gets one row per asset and never duplicates', () => {
  const dir = tmp('webdev-ledger-');
  const row = ledgerRow({
    kind: 'models',
    id: 'pocket_watch',
    res: '2k',
    bytes: 6.2 * 1024 * 1024,
    date: '2026-10-08',
    usedFor: 'hero',
  });
  assert.equal(
    row,
    '| models/pocket_watch (2k) | https://polyhaven.com/a/pocket_watch | CC0 | no | 2026-10-08 | 6.2 MB | hero |\n',
  );
  assert.equal(appendLedger(dir, row, 'models/pocket_watch'), true);
  assert.equal(appendLedger(dir, row, 'models/pocket_watch'), false);
  const text = readFileSync(join(dir, 'ASSETS.md'), 'utf8');
  assert.ok(text.startsWith(LEDGER_HEADER.slice(0, 20)));
  assert.equal(text.split('pocket_watch').length - 1, 2, 'one row: the id appears in the name and in the link');
});

test('frame sets are estimated with base64 overhead', () => {
  assert.equal(inlineEstimate(3 * 1024 * 1024), 4 * 1024 * 1024);
});

// Integration tests: need Blender or an installed example (sharp), skipped on a machine without them.
const blender = locateBlender();
test('selftest renders a tiny image through webdev_bpy', { skip: !blender }, () => {
  const r = spawnSync(process.execPath, ['framework/tools/blender.mjs', 'selftest'], {
    cwd: root,
    encoding: 'utf8',
    timeout: 120000,
  });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /Selftest: ok/);
});

const exampleModules = join(root, 'framework', 'examples', 'lindenhof', 'node_modules');
test(
  'frames encodes a render folder into sets with a manifest',
  { skip: !existsSync(join(exampleModules, 'sharp')) },
  async () => {
    const sites = tmp('webdev-sites-');
    const site = join(sites, 'demo');
    mkdirSync(join(site, 'renders', 'scene', 'desktop'), { recursive: true });
    mkdirSync(join(site, 'renders', 'scene', 'phone'), { recursive: true });
    writeFileSync(join(site, 'package.json'), '{"name":"demo"}');
    symlinkSync(exampleModules, join(site, 'node_modules'), 'junction');
    const sharp = createRequire(join(site, 'package.json'))('sharp');
    for (const [set, w, h] of [
      ['desktop', 320, 180],
      ['phone', 90, 160],
    ]) {
      for (let i = 0; i < 3; i++) {
        await sharp({ create: { width: w, height: h, channels: 3, background: { r: 40 * i, g: 80, b: 120 } } })
          .png()
          .toFile(join(site, 'renders', 'scene', set, `f${String(i).padStart(3, '0')}.png`));
      }
    }
    const r = spawnSync(process.execPath, ['framework/tools/blender.mjs', 'frames', 'demo', 'scene', '--fmt', 'webp'], {
      cwd: root,
      encoding: 'utf8',
      env: { ...process.env, WEBDEV_SITES_DIR: sites },
    });
    assert.equal(r.status, 0, r.stdout + r.stderr);
    const out = join(site, 'public', 'frames', 'scene');
    for (const f of [
      'desktop/000.webp',
      'desktop/002.webp',
      'phone/001.webp',
      'poster.jpg',
      'poster-phone.jpg',
      'manifest.json',
    ])
      assert.ok(existsSync(join(out, f)), f);
    const m = JSON.parse(readFileSync(join(out, 'manifest.json'), 'utf8'));
    assert.equal(m.sets.desktop.frames, 3);
    assert.equal(m.sets.phone.frames, 3);
    assert.equal(m.fmt, 'webp');
  },
);

import { decodeTga, convertedName, textureParts } from '../../framework/tools/people-lib.mjs';

function tga({ w, h, bpp, topOrigin, px }) {
  const head = Buffer.alloc(18);
  head[2] = 2;
  head.writeUInt16LE(w, 12);
  head.writeUInt16LE(h, 14);
  head[16] = bpp;
  head[17] = topOrigin ? 0x20 : 0;
  return Buffer.concat([head, Buffer.from(px), Buffer.alloc(26)]);
}

test('TGA decoder: BGR to RGB, origin flip, alpha channel', () => {
  // 1 x 2 image, bottom-left origin: first stored row is the bottom row
  const bottomFirst = tga({ w: 1, h: 2, bpp: 24, topOrigin: false, px: [1, 2, 3, 10, 20, 30] }); // BGR bottom, BGR top
  const a = decodeTga(bottomFirst);
  assert.deepEqual([a.width, a.height, a.channels], [1, 2, 3]);
  assert.deepEqual([...a.data], [30, 20, 10, 3, 2, 1], 'top row first, RGB order');
  const top = decodeTga(tga({ w: 1, h: 2, bpp: 24, topOrigin: true, px: [1, 2, 3, 10, 20, 30] }));
  assert.deepEqual([...top.data], [3, 2, 1, 30, 20, 10]);
  const rgba = decodeTga(tga({ w: 1, h: 1, bpp: 32, topOrigin: true, px: [1, 2, 3, 200] }));
  assert.deepEqual([...rgba.data], [3, 2, 1, 200]);
  assert.throws(() => decodeTga(Buffer.alloc(10)), /not a TGA/);
  assert.throws(() => decodeTga(tga({ w: 4, h: 4, bpp: 24, topOrigin: true, px: [1, 2, 3] })), /truncated/);
});

test('Rocketbox texture names are converted and understood', () => {
  assert.equal(convertedName('m009_body_color.tga'), 'm009_body_color.jpg');
  assert.equal(convertedName('m009_opacity_color.tga'), 'm009_opacity_color.png');
  assert.deepEqual(textureParts('f003_head_normal.jpg'), { prefix: 'f003', part: 'head', kind: 'normal' });
  assert.equal(textureParts('readme.txt'), null);
});
