import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import { fileURLToPath } from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const GROUPS = ['sites', 'examples', 'templates'];

/** Folder of a group. WEBDEV_SITES_DIR overrides `sites` (used by tests). Examples and templates live in framework/. */
export function groupDir(group) {
  if (group === 'sites' && process.env.WEBDEV_SITES_DIR) return path.resolve(process.env.WEBDEV_SITES_DIR);
  if (group === 'sites') return path.join(root, 'sites');
  return path.join(root, 'framework', group);
}

export function findSite(slug) {
  for (const group of GROUPS) {
    const dir = path.join(groupDir(group), slug);
    if (fs.existsSync(path.join(dir, 'package.json'))) return { slug, group, dir };
  }
  return null;
}

export function listSites() {
  const out = [];
  for (const group of GROUPS) {
    const base = groupDir(group);
    if (!fs.existsSync(base)) continue;
    for (const e of fs.readdirSync(base, { withFileTypes: true })) {
      if (e.isDirectory() && fs.existsSync(path.join(base, e.name, 'package.json'))) {
        out.push({ slug: e.name, group, dir: path.join(base, e.name) });
      }
    }
  }
  return out;
}

export function freePort(start = 4321) {
  return new Promise((resolve) => {
    const tryPort = (p) => {
      const s = net.createServer();
      s.once('error', () => tryPort(p + 1));
      s.once('listening', () => s.close(() => resolve(p)));
      s.listen(p, '127.0.0.1');
    };
    tryPort(start);
  });
}

export const die = (msg) => {
  console.error(msg);
  process.exit(1);
};
