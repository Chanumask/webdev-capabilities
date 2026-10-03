# Capability: CMS providers

Goal: non-technical editors change content without the developer, and the site design stays safe.

## The pattern (always)
Pages never import data files. They call functions in `src/content/provider.ts`, which return typed content. Switching from files to a CMS changes only the provider.

```ts
// src/content/provider.ts
import { site, listings } from './site';           // start: files
export const getSite = async () => site;
export const getListings = async () => listings;
```

Editors change **content slots**: texts, items, images, a few options from fixed lists. Layout, 3D scenes and motion stay in code.

Static builds (Astro) need a **rebuild** when content changes: the CMS calls a deploy hook on publish (Cloudflare Pages, Netlify and Vercel offer build hooks). Alternative: server rendering for pages that must update instantly.

## Choosing (recommendation logic)
| Situation | Recommend |
|---|---|
| Content rarely changes | no CMS, files |
| Client already uses Wix, wants the Wix dashboard | Wix Headless |
| Regularly edited items or news, editors comfortable with a form-style editor | Sanity (free plan is generous) |
| Editors must click on the page and see the live site | Storyblok (more complex, paid) |
| Technical editors, content in Git | Decap or Tina (needs GitHub accounts) |

## Wix Headless (client's preference on the first project)
- Wix keeps its dashboard (CMS collections, media), and an external Astro frontend reads the data through Wix's SDK. Wix publishes Astro integration and templates.
- Needs: a Wix site/project with Headless enabled, collections created (e.g. `Listings`), an API key or OAuth client id.
- Sketch (verify against the current Wix docs when implementing):

```ts
// src/content/provider.ts (Wix variant)
import { createClient, ApiKeyStrategy } from '@wix/sdk';
import { items } from '@wix/data';
const wix = createClient({ modules: { items }, auth: ApiKeyStrategy({ apiKey: import.meta.env.WIX_API_KEY, siteId: import.meta.env.WIX_SITE_ID }) });
export async function getListings() {
  const res = await wix.items.query('Listings').find();
  return res.items.map(toListing);          // map Wix fields to the Listing type
}
```
- Keep keys in `.env` (never committed). Build-time access is fine for a static site.
- Not yet verified here: plan/price needed for Headless, webhook options, image URL handling (a community thread reports problems). Check with the client's account before promising anything.
- Docs: Wix Headless, Astro templates, `@wix/data` quick start.

## Sanity (default recommendation for regular editing)
Schema in code, hosted Studio, free tier. Use `@sanity/client` in the provider with GROQ queries; webhook to the host's build hook.

## Verification
Provider returns the same shapes as the file version; a fixture test or a build with seeded CMS data; editors tried a real edit and saw it live after rebuild; `.env.example` documents the keys.
