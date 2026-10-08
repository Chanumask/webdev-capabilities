#!/usr/bin/env node
/**
 * One-command setup for a fresh clone.  Usage:  npm run setup  [-- --quick]
 *
 * Checks prerequisites, installs what is missing (Playwright CLI), prepares the design tool (Impeccable),
 * installs and builds the example site as a smoke test, and writes a status file.
 * It never pushes, publishes or changes anything outside this repository except the global Playwright CLI
 * install (npm -g) when it is missing.
 * Output ends with a "STATUS" block an agent can read back to the user.
 */
import { execSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { root, listSites } from './lib.mjs';
import { locateBlender } from './blender-lib.mjs';

const quick = process.argv.includes('--quick');
const win = process.platform === 'win32';
const results = [];
const add = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${name}${detail ? ' - ' + detail : ''}`);
};
const run = (cmd, opts = {}) => spawnSync(cmd, { shell: true, encoding: 'utf8', cwd: root, ...opts });
const out = (cmd) => {
  const r = run(cmd);
  return r.status === 0 ? (r.stdout || '').trim() : null;
};

console.log('Setting up webdev-capabilities...\n');

// 1. prerequisites
const nodeV = process.versions.node;
const [maj, min] = nodeV.split('.').map(Number);
add('Node.js >= 22.12', maj > 22 || (maj === 22 && min >= 12), `found ${nodeV}`);
const npmV = out('npm -v');
add('npm', !!npmV, npmV ?? 'not found');
const gitV = out('git --version');
add('git', !!gitV, gitV ?? 'not found');

// 2. git identity and remote (information only)
const gitUser = out('git config user.name'),
  gitMail = out('git config user.email');
add(
  'git identity configured',
  !!(gitUser && gitMail),
  gitUser && gitMail
    ? `${gitUser} <${gitMail}>`
    : 'run: git config --global user.name "..." and user.email "..." before committing',
);
const remote = out('git remote get-url origin');
add('git remote', !!remote, remote ?? 'no remote set (fine for local use)');

// 2b. repository hooks (commit and push guards, decision 0002): feature branches only, main is pushed by the user
if (fs.existsSync(path.join(root, 'dev/hooks')) && out('git rev-parse --is-inside-work-tree') === 'true') {
  run('git config core.hooksPath dev/hooks');
  run('git config commit.template dev/config/gitmessage');
  if (!win) {
    try {
      for (const h of fs.readdirSync(path.join(root, 'dev/hooks')))
        fs.chmodSync(path.join(root, 'dev/hooks', h), 0o755);
    } catch {
      /* ignore */
    }
  }
  add(
    'git hooks active',
    out('git config core.hooksPath') === 'dev/hooks',
    'commit-msg, pre-commit, pre-push (dev/hooks)',
  );
} else add('git hooks active', true, 'not a git checkout, skipped');

// 3. Playwright CLI (agent looks at the site in a real browser)
let pw = out('playwright-cli --version');
if (!pw) {
  console.log('Installing Playwright CLI globally (npm i -g @playwright/cli)...');
  run('npm install -g @playwright/cli@latest', { stdio: 'inherit' });
  pw = out('playwright-cli --version');
}
add('Playwright CLI', !!pw, pw ?? 'install failed; run: npm i -g @playwright/cli@latest');
if (pw) {
  const hasSkill = fs.existsSync(path.join(root, '.claude', 'skills', 'playwright-cli', 'SKILL.md'));
  if (!hasSkill) run('playwright-cli install --skills', { stdio: 'inherit' });
  add('Playwright skill present', fs.existsSync(path.join(root, '.claude', 'skills', 'playwright-cli', 'SKILL.md')));
  const cfg = path.join(root, '.playwright', 'cli.config.json');
  if (!fs.existsSync(cfg)) run('playwright-cli install', { stdio: 'inherit' });
  // second config for testing exports from file:// (playwright-cli blocks file: URLs by default)
  if (fs.existsSync(cfg)) {
    const fileCfg = path.join(root, '.playwright', 'file.config.json');
    const base = JSON.parse(fs.readFileSync(cfg, 'utf8'));
    fs.writeFileSync(fileCfg, JSON.stringify({ ...base, allowUnrestrictedFileAccess: true }, null, 2) + '\n');
  }
  add(
    'browser for Playwright',
    fs.existsSync(cfg),
    fs.existsSync(cfg)
      ? 'configured (.playwright/cli.config.json)'
      : 'no browser configured; install Chrome or Edge, then run: playwright-cli install',
  );
}

// optional: Blender for photoreal sites (tiers T2 and T3, decision 0016). Informational, never a failure.
{
  const exe = locateBlender();
  console.log(
    exe
      ? `INFO Blender found: ${exe}`
      : 'INFO Blender not found (optional, only needed for photoreal scenes): install Blender 5.x or set BLENDER',
  );
}

// 4. Impeccable design tool (its launcher downloads a small engine binary on first run)
const imp = path.join(root, '.claude', 'skills', 'impeccable', 'scripts', win ? 'impeccable.cmd' : 'impeccable');
if (fs.existsSync(imp)) {
  if (!win) {
    try {
      fs.chmodSync(imp, 0o755);
    } catch {
      /* ignore */
    }
  }
  const r = run(`"${imp}" context`, { cwd: root });
  add(
    'Impeccable design tool',
    r.status === 0,
    r.status === 0 ? 'engine ready' : (r.stderr || r.stdout || '').slice(0, 160),
  );
} else add('Impeccable design tool', false, 'skill files missing under .claude/skills/impeccable');

// 5. skills of this framework
for (const s of [
  'session-start',
  'wrap-up',
  'launch-site',
  'handover-site',
  'connect-cms',
  'triage-feedback',
  'onboard',
  'new-site',
  'build-site',
  'change-site',
  'export-site',
  'feature-workflow',
  'sanity-check',
  'session-handover',
  'decision-log',
  'parallel-planning',
]) {
  add(`skill ${s}`, fs.existsSync(path.join(root, '.claude', 'skills', s, 'SKILL.md')));
}

// 6. smoke test with the reference example
const example = listSites().find((s) => s.slug === 'lindenhof' && s.group === 'examples');
if (example && !quick) {
  console.log('\nInstalling and building the example site (smoke test, about a minute)...');
  const i = run('npm install', { cwd: example.dir, stdio: 'inherit' });
  const b = i.status === 0 ? run('npm run build', { cwd: example.dir, stdio: 'ignore' }) : { status: 1 };
  add(
    'example site builds',
    b.status === 0,
    b.status === 0
      ? 'framework/examples/lindenhof'
      : 'check Node version and network, then run: npm run build -- lindenhof',
  );
} else add('example site build', true, quick ? 'skipped (--quick)' : 'no example present');

// 7. state file (git-ignored)
const ok = results.every((r) => r.ok || ['git identity configured', 'git remote'].includes(r.name));
fs.writeFileSync(
  path.join(root, '.claude/framework-state.json'),
  JSON.stringify({ setupAt: new Date().toISOString(), ok, results }, null, 2),
);

const sites = listSites().filter((s) => s.group === 'sites');
console.log('\n===== STATUS =====');
console.log(ok ? 'READY: everything needed is installed.' : 'ATTENTION: some checks failed (see FAIL lines above).');
console.log(`Your sites: ${sites.length ? sites.map((s) => s.slug).join(', ') : 'none yet'}`);
console.log('Examples: lindenhof (3D scroll story), lindenhof-v1-flat');
console.log('Next: tell Claude what you want to do (new website, edit a site, look at the example, ask questions).');
process.exit(ok ? 0 : 1);
void execSync;
