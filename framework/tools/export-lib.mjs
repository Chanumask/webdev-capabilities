/**
 * Helpers of the single-file export (decision 0007, amended by 0014). Pure functions, no site access,
 * so they can be tested without building a site.
 */
import fs from 'node:fs';
import path from 'node:path';

export const MIME = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.mp4': 'video/mp4',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.bin': 'application/octet-stream',
  '.hdr': 'application/octet-stream',
  '.exr': 'application/octet-stream',
  '.ktx2': 'image/ktx2',
  '.wasm': 'application/wasm',
};

/** Size limits of the exported file in bytes (decision 0014). */
export const WARN_BYTES = 15 * 1024 * 1024;
export const ERROR_BYTES = 25 * 1024 * 1024;

export const mimeFor = (file) => MIME[path.extname(file).toLowerCase()] ?? null;

/** Reads a file and returns a data URI, or null when the type is unknown or the file is missing. */
export function dataUri(file) {
  const mime = mimeFor(file);
  if (!mime || !fs.existsSync(file) || !fs.statSync(file).isFile()) return null;
  return `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;
}

/** Collects what was inlined: file (relative to dist), source bytes. Used for the report. */
export function createLedger() {
  const items = new Map();
  return {
    add(name, bytes) {
      items.set(name, (items.get(name) ?? 0) + bytes);
    },
    top(n = 5) {
      return [...items.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
    },
    total: () => [...items.values()].reduce((a, b) => a + b, 0),
    count: () => items.size,
  };
}

const ASSET_STRING =
  /(["'`])(\/[^"'`\s?#\\]+\.(?:avif|webp|jpe?g|png|gif|svg|hdr|exr|glb|gltf|bin|ktx2|mp4|wasm|woff2?))\1/g;

/**
 * Replaces string literals in script code that point at files in dist ("/frames/001.avif") with data URIs,
 * so assets loaded from scripts work from file://. Uses a function replacer on purpose: minified code and
 * base64 never contain special replacement patterns that way.
 */
export function inlineScriptAssets(code, dist, ledger, uriFn = dataUri) {
  return code.replace(ASSET_STRING, (match, quote, ref) => {
    const file = path.join(dist, ref);
    const uri = uriFn(file);
    if (!uri) return match;
    ledger?.add(ref, fs.statSync(file).size);
    return `${quote}${uri}${quote}`;
  });
}

/** 'ok', 'warn' (over 15 MB) or 'error' (over 25 MB). */
export function budgetLevel(bytes, { warn = WARN_BYTES, error = ERROR_BYTES } = {}) {
  if (bytes > error) return 'error';
  if (bytes > warn) return 'warn';
  return 'ok';
}

export const mb = (bytes) => (bytes / 1024 / 1024).toFixed(2);

/** Marks the document for scripts that can load a reduced asset set (`--light`). */
export function markLight(html) {
  return html.replace(/<head([^>]*)>/i, (m) => `${m}<script>window.__LIGHT_EXPORT=true;</script>`);
}
