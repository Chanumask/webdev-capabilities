/**
 * Pure helpers of the Blender pipeline (decision 0016): locating Blender, render presets, GLB validation,
 * frame manifests. No Blender needed, so they are unit-tested.
 */
import fs from 'node:fs';
import path from 'node:path';

export const PINNED_MAJOR = 5;

/** Render sets: a desktop landscape set and a portrait set for phones (a cropped 16:9 frame loses the subject). */
export const SETS = {
  desktop: { w: 1920, h: 1080 },
  phone: { w: 810, h: 1440 },
};

export function parseVersion(text) {
  const m = /Blender\s+(\d+)\.(\d+)(?:\.(\d+))?/.exec(text ?? '');
  return m ? { major: +m[1], minor: +m[2], patch: +(m[3] ?? 0) } : null;
}

/** Candidate paths for blender, best guess first. `env` and `exists`/`list` are injectable for tests. */
export function blenderCandidates({ env = process.env, platform = process.platform, list = (d) => safeList(d) } = {}) {
  const out = [];
  if (env.BLENDER) out.push(env.BLENDER);
  if (platform === 'win32') {
    for (const base of [env.ProgramFiles ?? 'C:\\Program Files', 'C:\\Program Files']) {
      const dir = path.win32.join(base, 'Blender Foundation');
      const versions = list(dir)
        .filter((n) => /^Blender \d+(\.\d+)*$/.test(n))
        .sort((a, b) => cmpVersion(b.slice(8), a.slice(8)));
      for (const v of versions) out.push(path.win32.join(dir, v, 'blender.exe'));
    }
  } else if (platform === 'darwin') {
    out.push('/Applications/Blender.app/Contents/MacOS/Blender');
  } else {
    out.push('/usr/bin/blender', '/usr/local/bin/blender', '/snap/bin/blender');
  }
  return [...new Set(out)];
}

function safeList(dir) {
  try {
    return fs.readdirSync(dir);
  } catch {
    return [];
  }
}

export function cmpVersion(a, b) {
  const x = a.split('.').map(Number);
  const y = b.split('.').map(Number);
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    const d = (x[i] ?? 0) - (y[i] ?? 0);
    if (d) return d;
  }
  return 0;
}

export function locateBlender(opts = {}) {
  const exists = opts.exists ?? fs.existsSync;
  return blenderCandidates(opts).find((p) => exists(p)) ?? null;
}

/** Environment for a scene script; the keys are the ones webdev_bpy.py reads. */
export function renderEnv({ siteDir, outDir, libDir, w, h, samples, n, only }) {
  const env = { WEBDEV_ASSETS: siteDir, WEBDEV_OUT: outDir, PYTHONPATH: libDir };
  if (w) env.W = String(w);
  if (h) env.H = String(h);
  if (samples) env.S = String(samples);
  if (n) env.N = String(n);
  if (only !== undefined && only !== null && only !== '') env.ONLY = String(only);
  return env;
}

/** Lines of Blender's output worth showing. */
export const interesting = (line) =>
  /^(DEVICE|SEQ_SECONDS|RENDER_SECONDS|EXPORTED|GLB_FALLBACK|DIM|SETUP)|Traceback|Error|ERROR|File ".*", line/.test(
    line,
  );

/**
 * Checks a binary glTF: every texture points at an existing image and every buffer view lies inside the
 * binary chunk. Blender can write a GLB that references an image it failed to save (WebP and 1-channel maps),
 * which makes GLTFLoader throw at runtime.
 */
export function validateGlb(buf) {
  const problems = [];
  if (buf.length < 20 || buf.readUInt32LE(0) !== 0x46546c67) return { ok: false, problems: ['not a GLB file'] };
  const jsonLen = buf.readUInt32LE(12);
  let json;
  try {
    json = JSON.parse(buf.subarray(20, 20 + jsonLen).toString('utf8'));
  } catch {
    return { ok: false, problems: ['JSON chunk is not valid'] };
  }
  const binStart = 20 + jsonLen + 8;
  const binLen = binStart <= buf.length ? buf.length - binStart : 0;
  const images = json.images ?? [];
  const views = json.bufferViews ?? [];
  (json.textures ?? []).forEach((t, i) => {
    const hasWebp = t.extensions?.EXT_texture_webp?.source;
    const src = t.source ?? hasWebp;
    if (src === undefined || !images[src]) problems.push(`texture ${i} has no image`);
  });
  images.forEach((im, i) => {
    if (im.bufferView === undefined && !im.uri) problems.push(`image ${i} has neither data nor uri`);
    if (im.bufferView !== undefined && !views[im.bufferView])
      problems.push(`image ${i} points at a missing buffer view`);
  });
  const buffers = json.buffers ?? [];
  views.forEach((v, i) => {
    // meshopt writes an uncompressed fallback buffer that is not stored in the file
    if (buffers[v.buffer ?? 0]?.extensions?.EXT_meshopt_compression?.fallback) return;
    if ((v.byteOffset ?? 0) + v.byteLength > binLen + 4) problems.push(`buffer view ${i} runs past the binary chunk`);
  });
  return {
    ok: problems.length === 0,
    problems,
    info: {
      images: images.length,
      textures: (json.textures ?? []).length,
      meshopt: (json.extensionsUsed ?? []).includes('EXT_meshopt_compression'),
      bytes: buf.length,
    },
  };
}

export const pad = (i, n = 3) => String(i).padStart(n, '0');

/** Estimated inline size in bytes of a frame set: frames are base64 (+33%). */
export const inlineEstimate = (bytes) => Math.round(bytes * (4 / 3));
