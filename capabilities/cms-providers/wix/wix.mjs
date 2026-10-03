// Wix CMS provider core: reads Wix Data collections over REST with an API key. No dependencies.
// Runs at BUILD time on the developer's machine or the host (server-side only, the key is a secret).
// Docs: https://dev.wix.com/docs/rest/business-solutions/cms/data-items/query-data-items
//
// Environment (put in the site's .env, never commit it):
//   WIX_API_KEY      API key from https://manage.wix.com/account/api-keys with permission "Read Data Items"
//   WIX_SITE_ID      id of the Wix site or headless project that owns the collections
//   WIX_COLLECTIONS  optional, comma separated collection ids used by cms-check (e.g. Listings,Services)
//   WIX_API_BASE     optional, override for tests (default https://www.wixapis.com)

const DEFAULT_BASE = 'https://www.wixapis.com';

export function wixConfig(env) {
  const apiKey = env.WIX_API_KEY;
  const siteId = env.WIX_SITE_ID;
  const missing = [];
  if (!apiKey) missing.push('WIX_API_KEY');
  if (!siteId) missing.push('WIX_SITE_ID');
  if (missing.length) throw new Error(`Missing ${missing.join(' and ')} in .env`);
  return { apiKey, siteId, base: env.WIX_API_BASE || DEFAULT_BASE };
}

/** Plain-language explanation of the HTTP status codes a user can fix. */
export function explainStatus(status, collectionId) {
  switch (status) {
    case 401:
      return 'The API key was not accepted. Check WIX_API_KEY (copied completely, not expired, not revoked).';
    case 403:
      return 'The key is valid but may not read this data. In the Wix API Keys Manager give it the permission "Read Data Items" and include this site.';
    case 404:
      return `Collection "${collectionId}" was not found. Use the collection ID (not the display name) from the Wix CMS.`;
    case 429:
      return 'Wix is rate limiting requests. Wait a minute and try again.';
    default:
      return status >= 500 ? 'Wix returned a server error. Try again later.' : `Unexpected response (HTTP ${status}).`;
  }
}

async function post(cfg, body, fetchImpl) {
  const res = await fetchImpl(`${cfg.base}/wix-data/v2/items/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: cfg.apiKey, 'wix-site-id': cfg.siteId },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = new Error(explainStatus(res.status, body.dataCollectionId));
    err.status = res.status;
    throw err;
  }
  return res.json();
}

/** Flatten a Wix data item: { id, ...data fields }. */
export function normalizeItem(dataItem) {
  const data = dataItem.data ?? {};
  return { id: dataItem.id ?? data._id, ...data };
}

/**
 * Read every item of a collection (cursor paging). Options: filter, sort [{fieldName, order}], pageSize.
 * Returns normalized items (published ones only, Wix does not return drafts by default).
 */
export async function queryAll(collectionId, options = {}, env = process.env, fetchImpl = fetch) {
  const cfg = wixConfig(env);
  const limit = options.pageSize ?? 100;
  const items = [];
  let cursor;
  for (let page = 0; page < 1000; page++) {
    const query = cursor
      ? { cursorPaging: { limit, cursor } }
      : { cursorPaging: { limit }, ...(options.filter ? { filter: options.filter } : {}), ...(options.sort ? { sort: options.sort } : {}) };
    const json = await post(cfg, { dataCollectionId: collectionId, query }, fetchImpl);
    items.push(...(json.dataItems ?? []).map(normalizeItem));
    cursor = json.pagingMetadata?.cursors?.next;
    if (!cursor || !(json.dataItems ?? []).length) break;
  }
  return items;
}

/**
 * Convert a Wix media reference to a plain https URL.
 *   wix:image://v1/<mediaId>/<fileName>#originWidth=1200&originHeight=800  ->  https://static.wixstatic.com/media/<mediaId>
 * Optional width/height request a resized rendition.
 */
export function wixImageUrl(value, size = {}) {
  if (!value || typeof value !== 'string') return '';
  if (/^https?:\/\//.test(value)) return value;
  const m = /^wix:(?:image|document|video):\/\/v1\/([^/#]+)/.exec(value);
  if (!m) return '';
  const id = m[1];
  const base = `https://static.wixstatic.com/media/${id}`;
  if (size.width && size.height) return `${base}/v1/fill/w_${size.width},h_${size.height},al_c/${id}`;
  return base;
}

/** Check the connection for the given collections. Never throws; returns one row per collection. */
export async function checkConnection(env = process.env, collections = [], fetchImpl = fetch) {
  let cfg;
  try {
    cfg = wixConfig(env);
  } catch (e) {
    return [{ collection: '(configuration)', ok: false, message: e.message }];
  }
  const ids = collections.length ? collections : ['(none given: set WIX_COLLECTIONS=Listings,Services in .env)'];
  const rows = [];
  for (const id of ids) {
    if (id.startsWith('(')) {
      rows.push({ collection: id, ok: false, message: 'No collection to test.' });
      continue;
    }
    try {
      const json = await post(cfg, { dataCollectionId: id, query: { paging: { limit: 1 } }, returnTotalCount: true }, fetchImpl);
      rows.push({ collection: id, ok: true, message: `reachable, ${json.pagingMetadata?.total ?? '?'} item(s)` });
    } catch (e) {
      rows.push({ collection: id, ok: false, status: e.status, message: e.message });
    }
  }
  return rows;
}
