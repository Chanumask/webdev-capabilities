import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {
  checkConnection,
  queryAll,
  wixImageUrl,
  normalizeItem,
  wixConfig,
  explainStatus,
} from '../capabilities/cms-providers/wix/wix.mjs';
import { parseEnv } from '../tools/cms-check.mjs';

// A tiny fake of the Wix Data "query items" endpoint (cursor paging, auth headers, 404 for unknown collections).
const DATA = {
  Listings: Array.from({ length: 5 }, (_, i) => ({
    id: `id${i}`,
    dataCollectionId: 'Listings',
    data: { _id: `id${i}`, title: `Haus ${i}`, price: 100 * i },
  })),
};
const seen = [];
let server;
let base;

before(async () => {
  server = http.createServer((req, res) => {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      const send = (status, obj) => {
        res.writeHead(status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(obj));
      };
      if (req.url !== '/wix-data/v2/items/query' || req.method !== 'POST') return send(404, {});
      if (req.headers.authorization !== 'good-key') return send(401, {});
      if (req.headers['wix-site-id'] !== 'site-1') return send(403, {});
      const json = JSON.parse(body);
      seen.push(json);
      const items = DATA[json.dataCollectionId];
      if (!items) return send(404, {});
      const limit = json.query?.cursorPaging?.limit ?? json.query?.paging?.limit ?? 100;
      const start = Number(json.query?.cursorPaging?.cursor ?? 0);
      const page = items.slice(start, start + limit);
      const next = start + limit < items.length ? String(start + limit) : undefined;
      send(200, {
        dataItems: page,
        pagingMetadata: { count: page.length, total: items.length, cursors: next ? { next } : {} },
      });
    });
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

const env = () => ({ WIX_API_KEY: 'good-key', WIX_SITE_ID: 'site-1', WIX_API_BASE: base });

test('queryAll pages through a collection with cursors and flattens items', async () => {
  const items = await queryAll('Listings', { pageSize: 2 }, env());
  assert.equal(items.length, 5);
  assert.deepEqual(items[0], { id: 'id0', _id: 'id0', title: 'Haus 0', price: 0 });
  assert.equal(seen.filter((q) => q.dataCollectionId === 'Listings').length >= 3, true);
});

test('queryAll sends filter and sort only on the first request', async () => {
  seen.length = 0;
  await queryAll(
    'Listings',
    { pageSize: 2, filter: { price: { $gt: 0 } }, sort: [{ fieldName: 'price', order: 'ASC' }] },
    env(),
  );
  assert.ok(seen[0].query.filter);
  assert.ok(seen[0].query.sort);
  assert.equal(seen[1].query.filter, undefined);
  assert.ok(seen[1].query.cursorPaging.cursor);
});

test('checkConnection reports ok, wrong key, missing permission and unknown collection in plain language', async () => {
  const ok = await checkConnection(env(), ['Listings'], fetch);
  assert.equal(ok[0].ok, true);
  assert.match(ok[0].message, /5 item/);

  const badKey = await checkConnection({ ...env(), WIX_API_KEY: 'nope' }, ['Listings'], fetch);
  assert.equal(badKey[0].ok, false);
  assert.match(badKey[0].message, /API key was not accepted/);

  const badSite = await checkConnection({ ...env(), WIX_SITE_ID: 'other' }, ['Listings'], fetch);
  assert.match(badSite[0].message, /Read Data Items/);

  const missing = await checkConnection(env(), ['Nope'], fetch);
  assert.match(missing[0].message, /not found/);
});

test('configuration errors name the missing variables', async () => {
  assert.throws(() => wixConfig({}), /WIX_API_KEY and WIX_SITE_ID/);
  const rows = await checkConnection({}, ['Listings']);
  assert.equal(rows[0].ok, false);
});

test('wixImageUrl converts wix media references', () => {
  assert.equal(
    wixImageUrl('wix:image://v1/abc123~mv2.jpg/photo.jpg#originWidth=1200&originHeight=800'),
    'https://static.wixstatic.com/media/abc123~mv2.jpg',
  );
  assert.equal(wixImageUrl('https://example.org/x.jpg'), 'https://example.org/x.jpg');
  assert.equal(
    wixImageUrl('wix:image://v1/abc/p.jpg#x', { width: 400, height: 300 }),
    'https://static.wixstatic.com/media/abc/v1/fill/w_400,h_300,al_c/abc',
  );
  assert.equal(wixImageUrl(undefined), '');
});

test('normalizeItem and explainStatus', () => {
  assert.deepEqual(normalizeItem({ id: 'a', data: { x: 1 } }), { id: 'a', x: 1 });
  assert.match(explainStatus(429), /rate limiting/);
  assert.match(explainStatus(500), /server error/);
});

test('parseEnv reads simple .env files', () => {
  assert.deepEqual(parseEnv('# c\nCMS_PROVIDER=wix\nWIX_API_KEY="abc"\n\nA = b\n'), {
    CMS_PROVIDER: 'wix',
    WIX_API_KEY: 'abc',
    A: 'b',
  });
});
