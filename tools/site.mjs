#!/usr/bin/env node
/**
 *   node tools/site.mjs list
 *   node tools/site.mjs dev <site>     start the site on localhost (background), prints the address
 *   node tools/site.mjs stop <site>    stop it
 *   node tools/site.mjs build <site>   production build into <site>/dist
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { findSite, listSites, freePort, die, root } from './lib.mjs';

const [cmd, slug] = process.argv.slice(2);

if (cmd === 'list') {
  const sites = listSites();
  if (!sites.length) console.log('No sites yet. Ask Claude: "I want a new website".');
  for (const s of sites) console.log(`${s.group.padEnd(10)} ${s.slug}`);
  process.exit(0);
}
if (!['dev', 'stop', 'build'].includes(cmd) || !slug) die('Usage: node tools/site.mjs <list|dev|stop|build> [site]');
const site = findSite(slug);
if (!site) die(`Site "${slug}" not found. Run: npm run list`);
const run = (c, opts = {}) => execSync(c, { cwd: site.dir, stdio: 'inherit', ...opts });

if (!fs.existsSync(path.join(site.dir, 'node_modules'))) {
  console.log('Installing dependencies (first run)...');
  run('npm install');
}

if (cmd === 'build') { run('npm run build'); process.exit(0); }
if (cmd === 'stop') { try { run('npx astro dev stop'); } catch { /* not running */ } process.exit(0); }

// dev: reuse the running server if there is one
try {
  const status = execSync('npx astro dev status', { cwd: site.dir, encoding: 'utf8' });
  const m = status.match(/localhost:(\d+)/);
  if (m) { console.log(`Already running: http://localhost:${m[1]}`); process.exit(0); }
} catch { /* not running */ }
const port = await freePort(4321);
execSync(`npx astro dev --background --port ${port}`, { cwd: site.dir, stdio: 'ignore' });
console.log(`\n  ${slug} is running at  http://localhost:${port}\n  Stop it with: npm run stop -- ${slug}\n`);
void root;
