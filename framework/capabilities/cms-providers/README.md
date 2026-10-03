# Capability: CMS providers

Goal: non-technical editors change content without the developer, and the design stays safe. **The CMS is a plug-in, never baked in.** Wix is one provider (the first client's choice); files, Sanity, Storyblok and others implement the same contract, and switching changes one file.

## The contract
Pages never import data files or CMS clients. They call functions in `src/content/provider.ts`, which return typed content:

```ts
// src/content/provider.ts (default: content in files)
import { site, listings } from './site';
export const getSite = async () => site;
export const getListings = async () => listings;
```
Rules every provider follows:
1. Same function names and return shapes as the files version (types live in `src/content/site.ts`).
2. Runs at **build time** (static sites). Secrets only in the site's `.env`, never committed, never shipped to the browser.
3. Maps CMS fields to the site's types in one place (`toListing()` etc.); media references become plain https URLs.
4. Offers `checkConnection(env, collections)` so `npm run cms:check -- <site>` can test it; read only.
5. Content that is not in the CMS (layout, scenes, animation) stays in code. Editors change content slots only.
6. A rebuild is needed when content changes: the CMS calls the host's **deploy hook** on publish ([hosting options](../../launch/hosting-options.md)). Without a hook, content changes go through the agent or developer.

Selection: `.env` has `CMS_PROVIDER=files|wix|...`; the provider module in `src/content/` is chosen at build time. Providers live in `framework/capabilities/cms-providers/<name>/` and export `<name>.mjs` (core, no dependencies, unit-testable).

## Choosing (recommendation logic)
| Situation | Recommend |
|---|---|
| Content rarely changes | files (no CMS) |
| Client already uses Wix and wants the Wix dashboard | wix |
| Regularly edited items or news, form-style editor, generous free plan | Sanity |
| Editors must click on the page itself | Storyblok (more complex, paid) |
| Technical editors, content in Git | Decap or Tina |

CMS, hosting and domain are independent. A Wix CMS does **not** mean Wix hosts the site or holds the domain.

## Providers
| Provider | Status | Files |
|---|---|---|
| files | default, proven | `framework/templates/starter/src/content/` |
| [wix](wix/README.md) | core tested against a mock and **verified against a real Wix account** (reading items; images untested) | `wix/wix.mjs`, `dev/tests/wix.test.mjs` |
| Sanity, Storyblok | not built; write the same contract | backlog |

## Verification
The provider returns the same shapes as the files version; `npm run cms:check -- <site>` is green with real credentials; editors made a real edit, published, and saw it live after the rebuild; `.env.example` documents every variable.
