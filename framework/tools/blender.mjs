#!/usr/bin/env node
/**
 * Blender pipeline (decision 0016). The agent writes scene scripts, this tool runs them headless.
 *   node framework/tools/blender.mjs check
 *   node framework/tools/blender.mjs render <site> <scene.py> [--set desktop|phone|both] [--samples N] [--n N] [--only I] [--name X]
 *   node framework/tools/blender.mjs run <site> <script.py> [--out DIR]      any script (for example a GLB export)
 *   node framework/tools/blender.mjs frames <site> <name> [--fmt avif|webp] [--quality Q]
 *   node framework/tools/blender.mjs validate <file.glb ...>
 *   node framework/tools/blender.mjs selftest
 * Scenes live in sites/<site>/scenes/, renders go to sites/<site>/renders/<scene>/<set>/, encoded frames to
 * sites/<site>/public/frames/<name>/. Set BLENDER to use another executable.
 */
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { findSite, root } from './lib.mjs';
import { budgetLevel, mb } from './export-lib.mjs';
import {
  PINNED_MAJOR,
  SETS,
  parseVersion,
  locateBlender,
  renderEnv,
  interesting,
  validateGlb,
  pad,
  inlineEstimate,
} from './blender-lib.mjs';

const libDir = path.join(root, 'framework', 'capabilities', 'blender-pipeline', 'lib');
const args = process.argv.slice(2);
const cmd = args[0];
const flag = (name, def) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  if (hit) return hit.slice(name.length + 3);
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : def;
};
const positional = args
  .slice(1)
  .filter((a, i, all) => !a.startsWith('--') && !(all[i - 1]?.startsWith('--') && !all[i - 1].includes('=')));
const fail = (msg, code = 1) => {
  console.error(msg);
  process.exitCode = code;
  throw new Error(msg);
};

function blenderOrFail() {
  const exe = locateBlender();
  if (!exe) {
    fail(
      'Blender was not found. Install Blender 5.x (https://www.blender.org/download/) or set BLENDER to the executable, then run: npm run blender -- check',
    );
  }
  return exe;
}

function siteOrFail(slug) {
  const site = slug && findSite(slug);
  if (!site) fail(`Site "${slug}" not found (npm run list).`);
  return site;
}

/** Runs Blender headless on a script and streams the interesting output lines. Resolves with the exit code. */
function runBlender(exe, script, env, label) {
  return new Promise((resolve) => {
    const lib = (env.WEBDEV_LIB ?? libDir).replaceAll('\\', '/');
    // Blender's Python ignores PYTHONPATH, so the library folder is put on sys.path before the script runs
    const p = spawn(exe, ['-b', '--python-expr', `import sys; sys.path.insert(0, '${lib}')`, '-P', script], {
      env: { ...process.env, ...env },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let bad = false;
    const onData = (d) => {
      for (const line of d.toString().split(/\r?\n/)) {
        if (!line.trim()) continue;
        if (/Traceback/.test(line)) bad = true;
        if (interesting(line) && !/HIPEW|BlenderMCP/.test(line)) console.log(`  [${label}] ${line.trim()}`);
      }
    };
    p.stdout.on('data', onData);
    p.stderr.on('data', onData);
    p.on('close', (code) => resolve(bad && !code ? 1 : (code ?? 1)));
  });
}

async function check() {
  const exe = locateBlender();
  if (!exe) return console.log('Blender: not found. Install Blender 5.x or set BLENDER.');
  const v = spawnSync(exe, ['--version'], { encoding: 'utf8' });
  const ver = parseVersion(v.stdout);
  console.log(`Blender: ${exe}`);
  console.log(
    `Version: ${ver ? `${ver.major}.${ver.minor}.${ver.patch}` : 'unknown'}${ver && ver.major !== PINNED_MAJOR ? `  (the pipeline is tested with ${PINNED_MAJOR}.x)` : ''}`,
  );
  const py = path.join(os.tmpdir(), 'webdev-blender-check.py');
  fs.writeFileSync(
    py,
    "import bpy\np=bpy.context.preferences.addons['cycles'].preferences\nfor k in ('OPTIX','CUDA','HIP','METAL'):\n    try:\n        p.compute_device_type=k\n        p.get_devices()\n    except TypeError:\n        continue\n    d=[x.name for x in p.devices if x.type==k]\n    if d:\n        print('DEVICE',k,', '.join(d)); break\nelse:\n    print('DEVICE CPU only')\n",
  );
  const r = spawnSync(exe, ['-b', '-P', py], { encoding: 'utf8' });
  console.log(
    (r.stdout.split(/\r?\n/).find((l) => l.startsWith('DEVICE')) ?? 'DEVICE unknown').replace(
      'DEVICE',
      'Render device:',
    ),
  );
}

async function render() {
  const [slug, scene] = positional;
  if (!slug || !scene)
    fail('Usage: blender render <site> <scene.py> [--set desktop|phone|both] [--samples N] [--n N] [--only I]');
  const site = siteOrFail(slug);
  const script = path.resolve(site.dir, scene);
  if (!fs.existsSync(script)) fail(`Scene script not found: ${script}`);
  const exe = blenderOrFail();
  const name = flag('name', path.basename(scene, '.py'));
  const which = flag('set', 'desktop');
  const sets = which === 'both' ? ['desktop', 'phone'] : [which];
  for (const set of sets) {
    if (!SETS[set]) fail(`Unknown set "${set}" (desktop, phone, both)`);
    const outDir = path.join(site.dir, 'renders', name, set);
    fs.mkdirSync(outDir, { recursive: true });
    const env = renderEnv({
      siteDir: site.dir,
      outDir,
      libDir,
      w: Number(flag('width', SETS[set].w)),
      h: Number(flag('height', SETS[set].h)),
      samples: flag('samples'),
      n: flag('n'),
      only: flag('only'),
    });
    env.SET = set;
    console.log(`Rendering ${name} (${set}, ${env.W} x ${env.H}) into ${path.relative(site.dir, outDir)}`);
    const code = await runBlender(exe, script, env, set);
    if (code)
      fail(`Blender failed for set "${set}" (exit ${code}). Run the scene with --only 0 --samples 8 to debug.`, code);
    const pngs = fs.readdirSync(outDir).filter((f) => f.endsWith('.png')).length;
    console.log(`Done: ${pngs} image(s) in ${path.relative(site.dir, outDir)}`);
  }
}

async function run() {
  const [slug, script] = positional;
  if (!slug || !script) fail('Usage: blender run <site> <script.py> [--out DIR]');
  const site = siteOrFail(slug);
  const file = path.resolve(site.dir, script);
  if (!fs.existsSync(file)) fail(`Script not found: ${file}`);
  const exe = blenderOrFail();
  const outDir = path.resolve(site.dir, flag('out', 'public/models'));
  fs.mkdirSync(outDir, { recursive: true });
  const started = Date.now();
  const code = await runBlender(exe, file, renderEnv({ siteDir: site.dir, outDir, libDir }), 'run');
  if (code) fail(`Blender failed (exit ${code}).`, code);
  // every GLB written by this run must be loadable
  let bad = 0;
  for (const f of fs.readdirSync(outDir).filter((x) => x.endsWith('.glb'))) {
    const p = path.join(outDir, f);
    if (fs.statSync(p).mtimeMs < started - 1000) continue;
    const r = validateGlb(fs.readFileSync(p));
    console.log(
      `  ${r.ok ? 'ok ' : 'BAD'} ${f}  ${(fs.statSync(p).size / 1024).toFixed(0)} KB${r.ok ? '' : '  ' + r.problems.join('; ')}`,
    );
    if (!r.ok) bad++;
  }
  if (bad)
    fail(`${bad} GLB file(s) are broken (see above). Export that model with JPEG textures or fix the material.`, 2);
}

async function frames() {
  const [slug, name] = positional;
  if (!slug || !name) fail('Usage: blender frames <site> <name> [--fmt avif|webp] [--quality Q]');
  const site = siteOrFail(slug);
  const sharp = createRequire(path.join(site.dir, 'package.json'))('sharp');
  const fmt = flag('fmt', 'avif');
  const quality = Number(flag('quality', fmt === 'avif' ? 62 : 82));
  const src = path.join(site.dir, 'renders', name);
  const out = path.join(site.dir, 'public', 'frames', name);
  const manifest = { name, fmt, quality, sets: {} };
  let total = 0;
  for (const set of ['desktop', 'phone']) {
    const dir = path.join(src, set);
    if (!fs.existsSync(dir)) {
      console.log(`  no ${set} render found, skipping (a phone set needs its own portrait render: --set phone)`);
      continue;
    }
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.png'))
      .sort();
    if (!files.length) continue;
    fs.rmSync(path.join(out, set), { recursive: true, force: true });
    fs.mkdirSync(path.join(out, set), { recursive: true });
    let bytes = 0;
    let dims = null;
    for (let i = 0; i < files.length; i++) {
      let img = sharp(path.join(dir, files[i])).resize({ width: SETS[set].w, withoutEnlargement: true });
      img = fmt === 'avif' ? img.avif({ quality, effort: 4 }) : img.webp({ quality, effort: 5 });
      const { data, info } = await img.toBuffer({ resolveWithObject: true });
      dims ??= info;
      fs.writeFileSync(path.join(out, set, `${pad(i)}.${fmt}`), data);
      bytes += data.length;
    }
    const posterFile = path.join(out, set === 'desktop' ? 'poster.jpg' : 'poster-phone.jpg');
    await sharp(path.join(dir, files[0]))
      .resize({ width: set === 'desktop' ? 1280 : 540 })
      .jpeg({ quality: 70 })
      .toFile(posterFile);
    manifest.sets[set] = {
      frames: files.length,
      width: dims.width,
      height: dims.height,
      bytes,
      avgKB: Math.round(bytes / files.length / 1024),
    };
    total += bytes;
    console.log(
      `  ${set}: ${files.length} frames ${dims.width} x ${dims.height}, ${mb(bytes)} MB (${manifest.sets[set].avgKB} KB per frame)`,
    );
  }
  if (!total)
    fail(`No renders found in ${path.relative(site.dir, src)}. Run: npm run blender -- render ${slug} <scene.py>`);
  fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  const est = inlineEstimate(total);
  const level = budgetLevel(est);
  console.log(
    `\nFrames in ${path.relative(site.dir, out)}. As part of the single-file export: about ${mb(est)} MB${level === 'ok' ? '' : level === 'warn' ? ' (over the 15 MB warning line)' : ' (OVER the 25 MB limit: fewer frames or --light)'}`,
  );
}

function validate() {
  if (!positional.length) fail('Usage: blender validate <file.glb ...>');
  let bad = 0;
  for (const f of positional) {
    const r = validateGlb(fs.readFileSync(f));
    console.log(
      `${r.ok ? 'ok ' : 'BAD'} ${f}${r.ok ? `  (${r.info.textures} textures, ${(r.info.bytes / 1024).toFixed(0)} KB${r.info.meshopt ? ', meshopt' : ''})` : '  ' + r.problems.join('; ')}`,
    );
    if (!r.ok) bad++;
  }
  if (bad) process.exitCode = 2;
}

async function selftest() {
  const exe = blenderOrFail();
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'webdev-selftest-'));
  const script = path.join(root, 'framework', 'capabilities', 'blender-pipeline', 'templates', 'selftest.py');
  const code = await runBlender(
    exe,
    script,
    renderEnv({ siteDir: dir, outDir: dir, libDir, w: 64, h: 64, samples: 4 }),
    'selftest',
  );
  const ok = !code && fs.existsSync(path.join(dir, 'still.png'));
  console.log(ok ? 'Selftest: ok (rendered a 64 x 64 image)' : 'Selftest: FAILED');
  if (!ok) process.exitCode = 1;
}

try {
  if (cmd === 'check') await check();
  else if (cmd === 'render') await render();
  else if (cmd === 'run') await run();
  else if (cmd === 'frames') await frames();
  else if (cmd === 'validate') validate();
  else if (cmd === 'selftest') await selftest();
  else {
    console.log(
      fs
        .readFileSync(new URL(import.meta.url), 'utf8')
        .split('*/')[0]
        .replace('#!/usr/bin/env node\n/**\n', '')
        .replace(/^ \* ?/gm, ''),
    );
    process.exitCode = cmd ? 1 : 0;
  }
} catch (e) {
  if (!process.exitCode) {
    console.error(e.message);
    process.exitCode = 1;
  }
}
