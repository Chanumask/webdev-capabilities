#!/usr/bin/env node
/**
 *   node tools/dns-check.mjs <domain> [--target my-site.pages.dev] [--www]
 * Checks what the internet currently sees for a domain: addresses, name servers, HTTPS and the www redirect,
 * and explains the result in plain language. Read only. DNS changes can take minutes to a day to show up.
 */
import dns from 'node:dns/promises';
import { pathToFileURL } from 'node:url';
import { die } from './lib.mjs';

/** Pure: turn collected records into checks and a verdict. */
export function analyse(r, opts = {}) {
  const checks = [];
  const add = (ok, label, detail) => checks.push({ ok, label, detail });
  const has = (x) => x && (x.a.length || x.aaaa.length || x.cname.length);

  add(
    !!has(r.apex),
    'Domain has an address',
    has(r.apex)
      ? `${[...r.apex.cname, ...r.apex.a, ...r.apex.aaaa].join(', ')}`
      : 'No address found. Either the DNS records are not set yet, or they have not spread (propagation can take up to 24 hours).',
  );
  add(
    !!has(r.www),
    'www.<domain> has an address',
    has(r.www)
      ? `${[...r.www.cname, ...r.www.a].join(', ')}`
      : 'No record for www. Add a CNAME for "www" (see launch/LAUNCH.md).',
  );
  add(
    r.apex.ns.length > 0 ? true : null,
    'Name servers',
    r.apex.ns.length ? r.apex.ns.join(', ') : 'Could not read the name servers.',
  );
  if (opts.target) {
    const t = opts.target.toLowerCase();
    const points = [...r.www.cname, ...r.apex.cname].some((c) => c.toLowerCase().replace(/\.$/, '') === t);
    add(
      points ? true : null,
      `Points to ${opts.target}`,
      points
        ? 'A CNAME points to the hosting address.'
        : 'No CNAME to the hosting address found. With DNS at the host (apex domains on Cloudflare Pages) this is normal.',
    );
  }
  if (r.https) {
    add(
      !!r.https.ok,
      'HTTPS works',
      r.https.ok
        ? `HTTP ${r.https.status} at ${r.https.url}`
        : `Not reachable over HTTPS (${r.https.error ?? `HTTP ${r.https.status}`}). A new certificate can take several minutes after DNS is correct.`,
    );
  }
  if (r.wwwRedirect) add(r.wwwRedirect.ok ? true : null, 'One address redirects to the other', r.wwwRedirect.detail);

  let verdict = 'problem';
  if (!has(r.apex) && !has(r.www)) verdict = 'pending';
  else if (r.https?.ok) verdict = 'live';
  const summary = {
    live: 'The domain works and the site is reachable over HTTPS.',
    pending:
      'DNS is not visible yet. Check the records at your DNS provider, then wait and run this check again (up to 24 hours).',
    problem:
      'DNS is set but the site is not reachable over HTTPS yet. Wait a few minutes for the certificate, or check the custom domain in the hosting dashboard.',
  }[verdict];
  return { verdict, summary, checks };
}

const safe = async (fn) => {
  try {
    return await fn();
  } catch {
    return [];
  }
};

async function records(host) {
  return {
    a: await safe(() => dns.resolve4(host)),
    aaaa: await safe(() => dns.resolve6(host)),
    cname: await safe(() => dns.resolveCname(host)),
    ns: await safe(() => dns.resolveNs(host)),
  };
}

async function probe(url) {
  try {
    const res = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(15000) });
    return {
      ok: res.status >= 200 && res.status < 400,
      status: res.status,
      url,
      location: res.headers.get('location'),
    };
  } catch (e) {
    return { ok: false, error: e.cause?.code ?? e.message, url };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const domain = (args.find((a) => !a.startsWith('--')) ?? '')
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '');
  if (!domain) die('Usage: node tools/dns-check.mjs <domain> [--target my-site.pages.dev]');
  const ti = args.indexOf('--target');
  const apexName = domain.replace(/^www\./, '');
  const [apex, www] = [await records(apexName), await records(`www.${apexName}`)];
  const https = await probe(`https://${args.includes('--www') ? 'www.' : ''}${apexName}/`);
  const other = await probe(`https://${args.includes('--www') ? '' : 'www.'}${apexName}/`);
  const wwwRedirect = {
    ok: !!other.location || other.ok,
    detail: other.location
      ? `${other.url} redirects to ${other.location}`
      : other.ok
        ? `${other.url} also answers (no redirect; pick one address as the main one)`
        : `${other.url} is not reachable`,
  };
  const result = analyse(
    { domain: apexName, apex, www, https, wwwRedirect },
    { target: ti > -1 ? args[ti + 1] : undefined },
  );
  for (const c of result.checks)
    console.log(`${c.ok === true ? 'OK  ' : c.ok === false ? 'FAIL' : '??  '} ${c.label}: ${c.detail}`);
  console.log(`\n${result.verdict.toUpperCase()}: ${result.summary}`);
  process.exit(result.verdict === 'live' ? 0 : 1);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) await main();
