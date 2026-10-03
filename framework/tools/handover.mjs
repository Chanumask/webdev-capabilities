#!/usr/bin/env node
/**
 *   node framework/tools/handover.mjs <site> [--no-export] [--no-git]
 * Builds the handover package in exports/<site>-handover/: guide for the owner, accounts and access checklist,
 * the brief and design records, the offline export, and a zip of the source (git archive of the site repository).
 * Contains no secrets. Marks the brief handover: done.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { root, findSite, die } from './lib.mjs';
import { parseFrontMatter, setFrontMatter } from './brief.mjs';

export function build(siteDir, slug, opts = {}) {
  const exportsDir = process.env.WEBDEV_EXPORTS_DIR
    ? path.resolve(process.env.WEBDEV_EXPORTS_DIR)
    : path.join(root, 'exports');
  const out = path.join(exportsDir, `${slug}-handover`);
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  const briefFile = path.join(siteDir, 'brief', 'BRIEF.md');
  const fm = fs.existsSync(briefFile) ? parseFrontMatter(fs.readFileSync(briefFile, 'utf8')) : {};
  const added = [];
  const copy = (from, to) => {
    if (!fs.existsSync(from)) return;
    fs.mkdirSync(path.dirname(path.join(out, to)), { recursive: true });
    fs.copyFileSync(from, path.join(out, to));
    added.push(to);
  };
  const launch = path.join(siteDir, 'launch');
  copy(path.join(launch, 'HANDOVER.md'), 'README.md');
  copy(path.join(launch, 'CLIENT-GUIDE.md'), 'CLIENT-GUIDE.md');
  copy(path.join(launch, 'ACCOUNTS.md'), 'ACCOUNTS-AND-ACCESS.md');
  copy(path.join(launch, 'LAUNCH.md'), 'LAUNCH-RECORD.md');
  copy(briefFile, 'records/BRIEF.md');
  copy(path.join(siteDir, 'brief', 'ACCEPTANCE.md'), 'records/ACCEPTANCE.md');
  copy(path.join(siteDir, 'brief', 'CHANGELOG.md'), 'records/CHANGELOG.md');
  copy(path.join(siteDir, 'PRODUCT.md'), 'records/PRODUCT.md');
  copy(path.join(siteDir, 'DESIGN.md'), 'records/DESIGN.md');

  if (!opts.noExport) {
    execSync(`node "${path.join(root, 'framework', 'tools', 'export-site.mjs')}" ${slug}`, {
      cwd: root,
      stdio: 'ignore',
    });
    const exp = path.join(exportsDir, slug);
    if (fs.existsSync(exp)) {
      fs.cpSync(exp, path.join(out, 'offline-copy'), { recursive: true });
      added.push('offline-copy/ (open index.html by double-click)');
    }
  }
  if (!opts.noGit) {
    try {
      execSync(`git archive --format=zip -o "${path.join(out, 'site-source.zip')}" HEAD`, {
        cwd: siteDir,
        stdio: 'ignore',
      });
      added.push('site-source.zip (the website source code, from the site repository)');
    } catch {
      added.push('(no site-source.zip: the site has no git commit yet)');
    }
  }
  if (fs.existsSync(briefFile)) setFrontMatter(briefFile, { handover: 'done' });
  return { out, added, fm };
}

function main() {
  const args = process.argv.slice(2);
  const slug = args.find((a) => !a.startsWith('--'));
  if (!slug) die('Usage: node framework/tools/handover.mjs <site> [--no-export] [--no-git]');
  const site = findSite(slug);
  if (!site) die(`Site "${slug}" not found. Run: npm run list`);
  if (!fs.existsSync(path.join(site.dir, 'launch', 'HANDOVER.md')))
    die('No launch/HANDOVER.md. Run launch-prep first: npm run launch-prep -- ' + slug + ' --domain <domain>');
  const { out, added } = build(site.dir, slug, {
    noExport: args.includes('--no-export'),
    noGit: args.includes('--no-git'),
  });
  console.log(`Handover package: ${out}`);
  for (const a of added) console.log(`  ${a}`);
  console.log(
    '\nCheck that no passwords or keys are in any file, then give the folder to the owner (zip it, or share via a secure link).',
  );
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) main();
