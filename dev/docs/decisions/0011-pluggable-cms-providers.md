# 0011: CMS providers are plug-ins; Wix is the first

Date: 2026-10-03 · Status: active

**Context.** The first client wants Wix as the CMS (Storyblok was too complicated for them). Other clients will want different systems. Wix, hosting and the domain are separate concerns; Wix only handles the domain when it hosts the frontend.

**Decision.**
- Pages call `src/content/provider.ts` only. Each CMS is a provider in `framework/capabilities/cms-providers/<name>/` with a dependency-free core `<name>.mjs` (query, map, `checkConnection`), a README with setup steps, and tests. Providers are selected by `CMS_PROVIDER` in the site's `.env`.
- Wix provider: self-managed headless. The Astro site is static and hosted elsewhere; at build time it reads collections with `POST https://www.wixapis.com/wix-data/v2/items/query`, using an API key (permission "Read Data Items") and the site id. Publishing triggers a rebuild through a Wix Automation (collection trigger, "Send HTTP request") calling the host's deploy hook.
- Wix-hosted frontends (domain handled inside Wix, premium plan for custom domains) stay an alternative documented in `hosting-options.md`, not the default.
- `npm run cms:check -- <slug>` tests the connection read only and explains failures (401, 403, 404) in plain language.
- Status: the core is unit-tested against a fake of the documented endpoint; verification against a real Wix account is pending and tracked in the backlog.

**Why.** No first-client choice is baked into the framework, switching providers touches one file, and the launch workflow stays CMS-agnostic.

**Rules out.** Wix SDK as a hard dependency; CMS clients imported by pages; storing keys in tracked files.
