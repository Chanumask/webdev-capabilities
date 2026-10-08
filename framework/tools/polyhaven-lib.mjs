/**
 * Poly Haven helpers (decisions 0016 and 0017): plan a download from the files API response, record it in
 * the site's ASSETS.md ledger. Assets are downloaded once by id and committed; nothing is fetched at build
 * or runtime. All Poly Haven assets are CC0 (https://polyhaven.com/license).
 */
import fs from 'node:fs';
import path from 'node:path';

export const KINDS = ['models', 'textures', 'hdris'];
export const LARGE_BYTES = 50 * 1024 * 1024;

/**
 * Which files to fetch. `files` is the JSON of https://api.polyhaven.com/files/<id>.
 * Returns [{ url, rel, size }] with `rel` relative to assets/polyhaven/<kind>/<id>/.
 */
export function planDownload(files, kind, id, res = '2k') {
  const out = [];
  if (kind === 'models') {
    const g = files.gltf?.[res] ?? files.gltf?.['1k'];
    const main = g?.gltf;
    if (!main) throw new Error(`No glTF at ${res} for ${id}`);
    out.push({ url: main.url, rel: path.posix.basename(main.url), size: main.size ?? 0 });
    for (const [rel, f] of Object.entries(main.include ?? {})) out.push({ url: f.url, rel, size: f.size ?? 0 });
  } else if (kind === 'hdris') {
    const h = files.hdri?.[res]?.hdr;
    if (!h) throw new Error(`No HDR at ${res} for ${id}`);
    out.push({ url: h.url, rel: `${id}_${res}.hdr`, size: h.size ?? 0 });
  } else if (kind === 'textures') {
    for (const m of ['Diffuse', 'nor_gl', 'Rough', 'Displacement', 'AO']) {
      const f = files[m]?.[res]?.jpg;
      if (f) out.push({ url: f.url, rel: `${id}_${m}_${res}.jpg`, size: f.size ?? 0 });
    }
    if (!out.length) throw new Error(`No texture maps at ${res} for ${id}`);
  } else throw new Error(`Unknown kind "${kind}" (use ${KINDS.join(', ')})`);
  return out;
}

export const totalBytes = (plan) => plan.reduce((a, f) => a + (f.size || 0), 0);

export const LEDGER_HEADER =
  '# Assets\n\nEvery third-party file used in this site: where it came from, under which licence and where it is used (decision 0017).\n\n| Asset | Source | Licence | Credit needed | Added | Size | Used for |\n|---|---|---|---|---|---|---|\n';

export function ledgerRow({ kind, id, res, bytes, date, usedFor = '' }) {
  const mbs = (bytes / 1024 / 1024).toFixed(1);
  return `| ${kind}/${id} (${res}) | https://polyhaven.com/a/${id} | CC0 | no | ${date} | ${mbs} MB | ${usedFor} |\n`;
}

/** Appends a row unless that asset is already listed. Returns true when a row was added. */
export function appendLedger(siteDir, row, key) {
  const file = path.join(siteDir, 'ASSETS.md');
  const text = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : LEDGER_HEADER;
  if (text.includes(`| ${key} (`)) return false;
  fs.writeFileSync(file, text.endsWith('\n') ? text + row : text + '\n' + row);
  return true;
}
