# Wix provider

Reads Wix CMS (Wix Data) collections at build time over the REST API with an **API key**. The Astro site is hosted somewhere else (self-managed headless); Wix is only where editors edit content. Replaceable: see the [contract](../README.md).

Status: the core (`wix.mjs`) is unit-tested against a fake of the documented endpoint. **Not yet verified against a real Wix account.** Verify with `npm run cms:check -- <site>` (below).

## What Wix needs (owner or builder, once)
1. A Wix account with a **site or headless project** that has the CMS (every Wix Headless project includes it; connecting is free, premium plans unlock things like custom domains for Wix-hosted frontends).
2. A **collection** per content type in the Wix dashboard: CMS → Create Collection. Use simple field ids (`title`, `price`, `rooms`, `image`). Note the **collection ID** (not the display name).
3. An **API key**: https://manage.wix.com/account/api-keys → create key, permission **Read Data Items**, restricted to the one site. Keep it secret; it is an admin credential.
4. The **site ID**: shown in the browser address after `/dashboard/` when the site's dashboard is open.

## Configure the site
Create `sites/<slug>/.env` **yourself** (never paste keys into the chat; `.env` is git-ignored):
```
CMS_PROVIDER=wix
WIX_API_KEY=...
WIX_SITE_ID=...
WIX_COLLECTIONS=Listings,Services
```
Then run `npm run cms:check -- <slug>`. It does a read-only request per collection and explains problems in plain words: wrong key (401), missing permission or site (403), unknown collection id (404).

## Use in the site
Copy `wix.mjs` to `src/content/wix.mjs` and write `src/content/provider.ts`:
```ts
import { queryAll, wixImageUrl } from './wix.mjs';
const env = import.meta.env;                       // build time only
const toListing = (i) => ({ id: i.id, street: i.street, price: i.price, thumb: wixImageUrl(i.image, { width: 720, height: 480 }) });
export const getListings = async () => (await queryAll('Listings', { sort: [{ fieldName: 'price', order: 'ASC' }] }, env)).map(toListing);
```
Keep `getSite()` etc. returning the files content until those parts move to the CMS too.

## Automatic publishing
Wix Automations: trigger **item added/updated in a collection**, action **Send HTTP request** (POST) to the host's deploy hook URL (Cloudflare Pages or Netlify). This needs a git-connected host project ([hosting options](../../../launch/hosting-options.md)).

## Limits and notes
- Wix Data returns published items; drafts are excluded unless requested.
- Media fields hold `wix:image://v1/...` references; `wixImageUrl()` converts them to `https://static.wixstatic.com/media/...`. Download images at build time if the site must work without third-party requests (privacy default).
- Docs: Query Data Items (REST), About Authentication, Generate an API Key, Wix Automations HTTP request (links in `dev/docs/research/02-cms-and-git.md`).
