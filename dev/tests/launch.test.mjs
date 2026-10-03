import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { root } from '../../framework/tools/lib.mjs';
import { parseFrontMatter, setFrontMatterText } from '../../framework/tools/brief.mjs';
import { analyse, roundsDone, acceptanceProgress } from '../../framework/tools/status.mjs';
import { checkDist } from '../../framework/tools/launch-check.mjs';
import { analyse as dnsAnalyse } from '../../framework/tools/dns-check.mjs';
import { isDomain, routesOf, sitemapXml, robotsTxt, setAstroSite } from '../../framework/tools/launch-prep.mjs';

const node = (args, env = {}) =>
  spawnSync(process.execPath, args, { cwd: root, encoding: 'utf8', env: { ...process.env, ...env } });

function tempSite(slug = 'meyer') {
  const sitesDir = mkdtempSync(join(tmpdir(), 'webdev-launch-'));
  const r = node(['framework/tools/new-site.mjs', slug, 'Meyer Architekten', '--no-install', '--no-git'], {
    WEBDEV_SITES_DIR: sitesDir,
  });
  assert.equal(r.status, 0, r.stderr);
  return { sitesDir, dir: join(sitesDir, slug), env: { WEBDEV_SITES_DIR: sitesDir } };
}

test('front matter is parsed and updated without touching the rest', () => {
  const text = '---\nsite: a\nstatus: draft # note\nlaunch: none\n---\n\n# Body\n';
  assert.deepEqual(parseFrontMatter(text), { site: 'a', status: 'draft', launch: 'none' });
  const out = setFrontMatterText(text, { launch: 'prepared', domain: 'x.de' });
  assert.deepEqual(parseFrontMatter(out), { site: 'a', status: 'draft', launch: 'prepared', domain: 'x.de' });
  assert.match(out, /# Body/);
});

test('status: stage and recommended step for every lifecycle point', () => {
  const f = (fm, extra = {}) => ({
    slug: 's',
    fm,
    rounds: 6,
    acceptance: { done: 0, total: 5 },
    hasExport: false,
    hasReport: false,
    ...extra,
  });
  assert.equal(analyse(f({ status: 'draft' }, { rounds: 2 })).stage, 'intake');
  assert.match(analyse(f({ status: 'draft' }, { rounds: 2 })).nextSteps[0].label, /round 3/);
  assert.equal(analyse(f({ status: 'draft' })).stage, 'lock');
  assert.equal(analyse(f({ status: 'approved' })).stage, 'build');
  const review = analyse(f({ status: 'built', launch: 'none' }));
  assert.equal(review.stage, 'review');
  assert.ok(review.nextSteps.some((s) => s.skill === 'launch-site'));
  assert.equal(analyse(f({ status: 'built', launch: 'decided' })).stage, 'launch-prepare');
  assert.equal(analyse(f({ status: 'built', launch: 'prepared' })).stage, 'deploy');
  assert.equal(analyse(f({ status: 'built', launch: 'deployed' })).stage, 'verify');
  assert.equal(analyse(f({ status: 'built', launch: 'live', handover: 'none' })).stage, 'handover');
  assert.equal(analyse(f({ status: 'delivered', launch: 'live', handover: 'done' })).stage, 'wrap-up');
  assert.equal(
    analyse(f({ status: 'delivered', launch: 'live', handover: 'done' }, { hasReport: true })).stage,
    'maintain',
  );
  for (const fm of [
    { status: 'draft' },
    { status: 'approved' },
    { status: 'built', launch: 'none' },
    { status: 'built', launch: 'live' },
  ]) {
    const r = analyse(f(fm, { rounds: 1 }));
    assert.equal(r.nextSteps.filter((s) => s.recommended).length, 1, r.stage);
  }
});

test('status helpers read the intake log and acceptance list', () => {
  assert.equal(roundsDone('## Round 1: A\nanswers\n\n## Round 2: B\n_not started_\n'), 1);
  assert.equal(roundsDone('## Round 1: A\n_not started_\n'), 0);
  assert.deepEqual(acceptanceProgress('- [x] a\n- [ ] b\n- [X] c\n'), { done: 2, total: 3 });
});

test('status CLI works on a freshly created site and follows the front matter', () => {
  const { dir, env } = tempSite();
  const fresh = JSON.parse(node(['framework/tools/status.mjs', 'meyer', '--json'], env).stdout);
  assert.equal(fresh.stage, 'intake');
  writeFileSync(
    join(dir, 'brief', 'BRIEF.md'),
    setFrontMatterText(readFileSync(join(dir, 'brief', 'BRIEF.md'), 'utf8'), { status: 'built', launch: 'prepared' }),
  );
  assert.equal(JSON.parse(node(['framework/tools/status.mjs', 'meyer', '--json'], env).stdout).stage, 'deploy');
});

test('launch-prep helpers: domain validation, routes, sitemap, robots, astro site', () => {
  assert.equal(isDomain('meyer-architekten.de'), true);
  assert.equal(isDomain('www.meyer.de'), true);
  for (const bad of ['meyer', 'meyer_.de', '-a.de', 'a..de', 'http://a.de', 'a b.de'])
    assert.equal(isDomain(bad), false, bad);
  assert.match(sitemapXml('a.de', ['/', '/team/']), /<loc>https:\/\/a\.de\/team\/<\/loc>/);
  assert.match(robotsTxt('a.de'), /Sitemap: https:\/\/a\.de\/sitemap\.xml/);
  assert.match(setAstroSite('export default defineConfig({\n  x: 1,\n});', 'https://a.de'), /site: 'https:\/\/a\.de'/);
  assert.match(setAstroSite("defineConfig({ site: 'https://old.de' })", 'https://new.de'), /new\.de/);
});

test('launch-prep CLI prepares a site and updates the brief', () => {
  const { dir, env } = tempSite();
  const r = node(
    ['framework/tools/launch-prep.mjs', 'meyer', '--domain', 'meyer-architekten.de', '--host', 'cloudflare-pages'],
    env,
  );
  assert.equal(r.status, 0, r.stderr + r.stdout);
  for (const f of [
    'launch/LAUNCH.md',
    'launch/HANDOVER.md',
    'launch/CLIENT-GUIDE.md',
    'launch/ACCOUNTS.md',
    'public/robots.txt',
    'public/sitemap.xml',
    'public/_headers',
  ]) {
    assert.ok(existsSync(join(dir, f)), f);
  }
  const launch = readFileSync(join(dir, 'launch', 'LAUNCH.md'), 'utf8');
  assert.match(launch, /meyer-architekten\.de/);
  assert.doesNotMatch(launch, /__(SLUG|NAME|DATE|DOMAIN|HOST|CANONICAL_HOST)__/);
  assert.match(readFileSync(join(dir, 'astro.config.mjs'), 'utf8'), /site: 'https:\/\/meyer-architekten\.de'/);
  const fm = parseFrontMatter(readFileSync(join(dir, 'brief', 'BRIEF.md'), 'utf8'));
  assert.equal(fm.launch, 'prepared');
  assert.equal(fm.domain, 'meyer-architekten.de');
  assert.notEqual(node(['framework/tools/launch-prep.mjs', 'meyer', '--domain', 'nonsense'], env).status, 0);
});

function fixtureDist(pages) {
  const dist = mkdtempSync(join(tmpdir(), 'webdev-dist-'));
  for (const [name, html] of Object.entries(pages)) {
    mkdirSync(join(dist, name, '..'), { recursive: true });
    writeFileSync(join(dist, name), html);
  }
  return dist;
}
const page = (body, head = '', lang = 'de') =>
  `<!doctype html><html lang="${lang}"><head><title>Meyer Architekten</title><meta name="description" content="Architekturbüro für Wohnhäuser und Umbauten in Hamburg"><link rel="icon" href="/favicon.svg">${head}</head><body>${body}</body></html>`;
const levels = (rs) => rs.map((r) => `${r.level}:${r.check}`);

test('launch-check passes a clean German site and fails the usual mistakes', () => {
  const good = fixtureDist({
    'index.html': page(
      '<h1>Meyer</h1><a href="/impressum/">Impressum</a><a href="/datenschutz/">Datenschutz</a><a href="#kontakt">K</a>',
    ),
    'impressum/index.html': page('<h1>Impressum</h1>'),
    'datenschutz/index.html': page('<h1>Datenschutz</h1>'),
    '404.html': page('<p>Nicht gefunden</p>'),
    'robots.txt': 'User-agent: *',
    'favicon.svg': '<svg/>',
    'sitemap.xml': '<urlset/>',
  });
  const ok = checkDist(good);
  assert.equal(
    ok.some((r) => r.level === 'FAIL'),
    false,
    JSON.stringify(ok),
  );

  const bad = fixtureDist({
    'index.html': page(
      '<h1>Meyer</h1><p>Telefon +49 000 0000000, Platzhalter</p><img src="/a.jpg"><a href="/missing/">x</a><script src="https://cdn.example.org/x.js"></script>',
    ),
  });
  const rs = levels(checkDist(bad));
  for (const expected of [
    'FAIL:placeholder',
    'FAIL:links',
    'FAIL:impressum',
    'FAIL:datenschutz',
    'WARN:alt',
    'WARN:third-party',
    'WARN:404',
    'WARN:robots',
    'WARN:sitemap',
  ]) {
    assert.ok(rs.includes(expected), `${expected} in ${rs.join(', ')}`);
  }
});

test('launch-check flags missing basics', () => {
  const dist = fixtureDist({ 'index.html': '<!doctype html><html><head></head><body><p>x</p></body></html>' });
  const rs = levels(checkDist(dist));
  for (const expected of ['FAIL:title', 'FAIL:lang', 'FAIL:h1']) assert.ok(rs.includes(expected), expected);
  assert.deepEqual(checkDist(mkdtempSync(join(tmpdir(), 'empty-')))[0].level, 'FAIL');
});

test('routesOf lists static pages only', () => {
  const dir = mkdtempSync(join(tmpdir(), 'webdev-routes-'));
  for (const f of [
    'index.astro',
    '404.astro',
    'team.astro',
    '_draft.astro',
    '[slug].astro',
    'blog/index.astro',
    'blog/post.md',
  ]) {
    mkdirSync(join(dir, 'src', 'pages', f, '..'), { recursive: true });
    writeFileSync(join(dir, 'src', 'pages', f), '');
  }
  assert.deepEqual(routesOf(dir), ['/', '/blog/', '/blog/post/', '/team/']);
});

test('dns analysis: pending, problem and live verdicts', () => {
  const none = { a: [], aaaa: [], cname: [], ns: [] };
  const pending = dnsAnalyse({ domain: 'a.de', apex: none, www: none, https: { ok: false, error: 'ENOTFOUND' } });
  assert.equal(pending.verdict, 'pending');
  const problem = dnsAnalyse({
    domain: 'a.de',
    apex: { ...none, a: ['1.2.3.4'], ns: ['ns1.x.net'] },
    www: { ...none, cname: ['a.pages.dev'] },
    https: { ok: false, error: 'CERT_HAS_EXPIRED' },
  });
  assert.equal(problem.verdict, 'problem');
  const live = dnsAnalyse(
    {
      domain: 'a.de',
      apex: { ...none, a: ['1.2.3.4'], ns: ['ns1.x.net'] },
      www: { ...none, cname: ['a.pages.dev'] },
      https: { ok: true, status: 200, url: 'https://a.de/' },
      wwwRedirect: { ok: true, detail: 'redirects' },
    },
    { target: 'a.pages.dev' },
  );
  assert.equal(live.verdict, 'live');
  assert.ok(live.checks.some((c) => /Points to a.pages.dev/.test(c.label) && c.ok === true));
});

test('handover builds a package from a prepared site and marks the brief', () => {
  const { dir, env } = tempSite('hand-over');
  assert.equal(
    node(['framework/tools/handover.mjs', 'hand-over', '--no-export', '--no-git'], env).status,
    1,
    'needs launch-prep first',
  );
  assert.equal(node(['framework/tools/launch-prep.mjs', 'hand-over', '--domain', 'hand-over.de'], env).status, 0);
  const exportsDir = mkdtempSync(join(tmpdir(), 'webdev-exports-'));
  const r = node(['framework/tools/handover.mjs', 'hand-over', '--no-export', '--no-git'], {
    ...env,
    WEBDEV_EXPORTS_DIR: exportsDir,
  });
  assert.equal(r.status, 0, r.stderr + r.stdout);
  const out = join(exportsDir, 'hand-over-handover');
  for (const f of ['README.md', 'CLIENT-GUIDE.md', 'ACCOUNTS-AND-ACCESS.md', 'LAUNCH-RECORD.md', 'records/BRIEF.md'])
    assert.ok(existsSync(join(out, f)), f);
  assert.equal(parseFrontMatter(readFileSync(join(dir, 'brief', 'BRIEF.md'), 'utf8')).handover, 'done');
});
