# 0007: Localhost preview and single-file offline export

Date: 2026-10-03 · Status: active

**Context.** Users judge a site by looking at it and want to send it to someone who has no tooling. Sites include scroll-driven 3D with modules and fonts.

**Decision.**
- Every site is previewed on localhost (`npm run dev -- <slug>`, first free port from 4321).
- `npm run export -- <slug>` builds and then inlines scripts, styles, fonts and images into each HTML file (`tools/export-site.mjs`), producing `exports/<slug>/index.html` that works from `file://` without internet. Scripts are bundled to an IIFE with esbuild and run after `DOMContentLoaded`, because Chrome blocks module scripts from `file://`. Multi-page sites export one inlined file per page with relative links.

**Why.** No deployment is needed to review or share. `vite-plugin-singlefile` was tried first and conflicts with Astro's multi-entry build, so the exporter works on the finished `dist/` instead.

**Rules out.** Requiring a hosting account to preview; module-script exports that fail when double-clicked.

**Limits.** Forms are demos unless a service is configured; CMS content is frozen at export time; 3D scenes need a desktop-class browser.
