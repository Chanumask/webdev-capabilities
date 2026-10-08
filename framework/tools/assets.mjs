#!/usr/bin/env node
/**
 * Fetch licensed assets into a site, once, by id (decisions 0016, 0017 and 0020).
 *   node framework/tools/assets.mjs add <site> <models|textures|hdris>/<id> [--res 2k] [--allow-large]   Poly Haven, CC0
 *   node framework/tools/assets.mjs add <site> people/<id>                                               Microsoft Rocketbox, MIT
 *   node framework/tools/assets.mjs add <site> animations/<name>                                         Rocketbox animation (walk, idle, talk), MIT
 * Poly Haven files land in sites/<site>/assets/polyhaven/<kind>/<id>/, people in assets/people/<id>/ (FBX plus
 * textures converted to JPEG and PNG). Every asset gets a row in sites/<site>/ASSETS.md. Anything over 50 MB needs
 * --allow-large. Nothing is fetched at build time.
 */
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { findSite } from './lib.mjs';
import { KINDS, LARGE_BYTES, planDownload, totalBytes, ledgerRow, appendLedger } from './polyhaven-lib.mjs';
import {
  ROCKETBOX_REPO,
  ROCKETBOX_CATEGORIES,
  ROCKETBOX_ANIMATION_DIRS,
  ROCKETBOX_LICENSE_URL,
  decodeTga,
  convertedName,
} from './people-lib.mjs';

const args = process.argv.slice(2);
const [cmd, slug, spec] = args.filter((a, i) => !a.startsWith('--') && !(args[i - 1] === '--res'));
const resIdx = args.indexOf('--res');
const res = resIdx >= 0 ? args[resIdx + 1] : '2k';
const headers = { 'user-agent': 'webdev-capabilities (vendoring licensed assets once)' };
const today = new Date().toISOString().slice(0, 10);

function fail(msg) {
  console.error(msg);
  process.exitCode = 1;
}

async function getJson(url) {
  const r = await fetch(url, { headers });
  return r.ok ? r.json() : null;
}

async function getBuffer(url) {
  const r = await fetch(url, { headers });
  if (!r.ok) throw new Error(`Download failed (${r.status}): ${url}`);
  return Buffer.from(await r.arrayBuffer());
}

async function addPolyHaven(site, kind, id) {
  const files = await getJson(`https://api.polyhaven.com/files/${id}`);
  if (!files) return fail(`Poly Haven has no asset "${id}".`);
  const plan = planDownload(files, kind, id, res);
  const bytes = totalBytes(plan);
  console.log(`${kind}/${id} at ${res}: ${plan.length} file(s), ${(bytes / 1024 / 1024).toFixed(1)} MB`);
  if (bytes > LARGE_BYTES && !args.includes('--allow-large')) {
    return fail(
      'That is over 50 MB. Large scans are fine for offline renders but never for real-time. Add --allow-large to download it anyway.',
    );
  }
  const dir = path.join(site.dir, 'assets', 'polyhaven', kind, id);
  for (const f of plan) {
    const dest = path.join(dir, f.rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    if (!fs.existsSync(dest)) fs.writeFileSync(dest, await getBuffer(f.url));
  }
  const added = appendLedger(site.dir, ledgerRow({ kind, id, res, bytes, date: today }), `${kind}/${id}`);
  console.log(
    `Saved to ${path.relative(site.dir, dir)}${added ? ' and listed in ASSETS.md' : ' (already listed in ASSETS.md)'}`,
  );
}

async function addPerson(site, id) {
  if (!/^[A-Za-z0-9_]+$/.test(id)) return fail('Use people/<id>, for example people/Male_Adult_05');
  const api = `https://api.github.com/repos/${ROCKETBOX_REPO}/contents/Assets/Avatars`;
  let base = null;
  for (const cat of ROCKETBOX_CATEGORIES) {
    if (await getJson(`${api}/${cat}/${id}`)) {
      base = `${api}/${cat}/${id}`;
      break;
    }
  }
  if (!base) return fail(`Rocketbox has no avatar "${id}" (try Male_Adult_05, Female_Adult_03, Business_Male_01).`);
  const sharp = createRequire(path.join(site.dir, 'package.json'))('sharp');
  const dir = path.join(site.dir, 'assets', 'people', id);
  fs.mkdirSync(dir, { recursive: true });
  let bytes = 0;
  for (const f of (await getJson(`${base}/Export`)) ?? []) {
    if (f.type === 'file' && f.name === `${id}.fbx`) {
      const b = await getBuffer(f.download_url);
      fs.writeFileSync(path.join(dir, f.name), b);
      bytes += b.length;
    }
  }
  for (const f of (await getJson(`${base}/Textures`)) ?? []) {
    if (f.type !== 'file' || !/\.tga$/i.test(f.name)) continue;
    const t = decodeTga(await getBuffer(f.download_url));
    const img = sharp(t.data, { raw: { width: t.width, height: t.height, channels: t.channels } });
    const out = path.join(dir, convertedName(f.name));
    const buf = out.endsWith('.png') ? await img.png().toBuffer() : await img.jpeg({ quality: 92 }).toBuffer();
    fs.writeFileSync(out, buf);
    bytes += buf.length;
  }
  if (!fs.existsSync(path.join(dir, `${id}.fbx`))) return fail(`No FBX found for ${id}.`);
  const licenseFile = path.join(site.dir, 'assets', 'people', 'LICENSE-Microsoft-Rocketbox.txt');
  if (!fs.existsSync(licenseFile)) fs.writeFileSync(licenseFile, await getBuffer(ROCKETBOX_LICENSE_URL));
  const size = `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  const row = `| people/${id} (Rocketbox) | https://github.com/${ROCKETBOX_REPO} | MIT (keep assets/people/LICENSE-Microsoft-Rocketbox.txt) | notice in the licence file | ${today} | ${size} |  |\n`;
  const added = appendLedger(site.dir, row, `people/${id}`);
  console.log(
    `people/${id}: ${size} (textures converted from TGA) in ${path.relative(site.dir, dir)}${added ? ', listed in ASSETS.md' : ''}`,
  );
}

async function addAnimation(site, name) {
  if (!/^[A-Za-z0-9_-]+$/.test(name)) return fail('Use animations/<name>, for example animations/m_walk_neutral_01');
  const api = `https://api.github.com/repos/${ROCKETBOX_REPO}/contents/Assets/Animations`;
  for (const dir of ROCKETBOX_ANIMATION_DIRS) {
    const list = await getJson(`${api}/${dir}`);
    const hit = list?.find((f) => f.name === `${name}.max.fbx`);
    if (!hit) continue;
    const dest = path.join(site.dir, 'assets', 'people', 'animations', `${name}.fbx`);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    if (!fs.existsSync(dest)) fs.writeFileSync(dest, await getBuffer(hit.download_url));
    const licenseFile = path.join(site.dir, 'assets', 'people', 'LICENSE-Microsoft-Rocketbox.txt');
    if (!fs.existsSync(licenseFile)) fs.writeFileSync(licenseFile, await getBuffer(ROCKETBOX_LICENSE_URL));
    const size = `${(fs.statSync(dest).size / 1024 / 1024).toFixed(1)} MB`;
    const kind = dir.replace('all_animations_max_motextr_', '');
    const row = `| animations/${name} (Rocketbox, ${kind}) | https://github.com/${ROCKETBOX_REPO} | MIT (keep assets/people/LICENSE-Microsoft-Rocketbox.txt) | notice in the licence file | ${today} | ${size} |  |
`;
    const added = appendLedger(site.dir, row, `animations/${name}`);
    console.log(
      `animations/${name} (${kind}): ${size} in ${path.relative(site.dir, dest)}${added ? ', listed in ASSETS.md' : ''}`,
    );
    return;
  }
  return fail(
    `Rocketbox has no animation "${name}". Names look like m_walk_neutral_01, f_idle_breathe_01, m_gestic_talk_neutral_01.`,
  );
}

if (cmd !== 'add' || !slug || !spec?.includes('/')) {
  fail(
    'Usage: node framework/tools/assets.mjs add <site> <models|textures|hdris|people|animations>/<id> [--res 2k] [--allow-large]',
  );
} else {
  const [kind, id] = spec.split('/');
  const site = findSite(slug);
  if (!site) fail(`Site "${slug}" not found (npm run list).`);
  else if (kind === 'people') await addPerson(site, id);
  else if (kind === 'animations') await addAnimation(site, id);
  else if (!KINDS.includes(kind) || !/^[A-Za-z0-9_]+$/.test(id)) {
    fail(`Use <${[...KINDS, 'people'].join('|')}>/<id>, for example models/pocket_watch`);
  } else await addPolyHaven(site, kind, id);
}
