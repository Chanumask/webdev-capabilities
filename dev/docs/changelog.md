# Changelog

← [CLAUDE.md](../../CLAUDE.md)

Newest first. Short entries: what changed, with links. Format and archiving: [documentation](process/documentation.md).

---

## 2026-10-08 (feat) Blender pipeline

- New capability [blender-pipeline](../../framework/capabilities/blender-pipeline/README.md): `lib/webdev_bpy.py` (Cycles setup, HDRI, Poly Haven model and texture helpers, instancing, glass, fog box, sequences, GLB export with an automatic JPEG fallback), scene templates and a selftest.
- New tools: `npm run blender -- check | selftest | render | run | frames | validate` (desktop 1920 x 1080 and a **portrait phone set**; frames encoded to AVIF or WebP with a manifest and an estimate against the 25 MB limit) and `npm run assets -- add <site> models/<id>` (CC0 Poly Haven files vendored once, `ASSETS.md` ledger row, 50 MB guard). `npm run setup` reports Blender as optional info. Blender is found at its default path or via `BLENDER`; nothing is installed.
- Checked end to end in a throwaway site: assets, 6-frame render of both sets, frames, GLB export (the magnifier GLB hit the WebP bug and was rewritten with JPEG automatically). 9 new tests; `npm run check` and `npm run smoke` green. Prettier now ignores `.astro` output.

**Next session** →

Paste-to-start prompt:
> Continue the photorealism programme: B3, the reference example (furniture maker with a hero armchair, T3 hero and T2 product tour, T0 baseline), starting with the M1 stop gate: show the Cycles still and a real-time screenshot before building the site.

- **Branch:** `main` is ahead of `origin` (plan, spikes, decisions, export, Blender pipeline); `feat/blender-pipeline` squash-merged locally (branch left in place).
- **State:** B1 and B2 done. Spike sources are in `exports/photoreal-spike/src` (git-ignored). The house spike showed buildings are the open risk.
- **Do next:** maintainer decides the building question (improve the house first or go to the furniture example), then M1, then B3.
- **Watch for:** push needs approval; blender-mcp never in workers; 4K frames hosted only.
- **Environment:** `npm run blender -- check`, `git rev-list --count origin/main..main`.

---

## 2026-10-08 (feat) Export of heavy assets, decisions 0014 to 0017

- Decisions [0014](decisions/0014-export-budgets-and-variants.md) to [0017](decisions/0017-asset-licensing-and-ledger.md) logged: export budgets, realism tiers, Blender as a local tool, asset licensing. [0007](decisions/0007-localhost-and-single-file-export.md) is amended.
- `export-site` inlines assets that scripts load (frames, HDRI, models) via `export-lib.mjs`, knows `.avif .hdr .exr .gltf .bin .ktx2 .wasm`, reports the heaviest assets, warns above 15 MB and fails above 25 MB (exit code 2, `--max-mb=N` overrides), and has `--light` (images at most 960 px, `window.__LIGHT_EXPORT`).
- New `npm run weight -- <slug>` (page weight and the estimated single-file size; matched the real export of `lindenhof` exactly at 1.47 MB). `npm run setup` writes `.playwright/file.config.json` so exports can be opened from `file://`; the `export-site` skill uses it. Prettier ignores `.playwright-cli/` tool output. 6 new tests (`dev/tests/export.test.mjs`).
- Next on the plan: B2 Blender pipeline, then the reference example.

---

## 2026-10-08 (docs) Photorealism: plan merged, quality spikes

- Plan and research ([04](research/04-photorealism-problem.md), [05](research/05-photorealism-candidates.md), [06](research/06-photorealism-plan.md)) merged into `main` locally; answers recorded: new example, single file with 25 MB cap plus `--light`, paid generation to the backlog, existing Blender 5.2 and blender-mcp usable.
- Quality spikes in [07](research/07-photorealism-quality-spikes.md): Cycles stills of a desk, a forest and a house; a real-time GLB scene; two scroll-scrubbed sequences exported as one file and opened from `file://`. Objects and nature reach photographic quality, the self-built house does not yet.
- Findings: scanned assets carry the realism, phones need portrait frames, Blender WebP export breaks silently on 1-channel images, trees from Poly Haven are 0.5 to 1 GB. Decisions 0014 to 0017 stay drafts until the maintainer reviews the results.

**Next session** →

Paste-to-start prompt:
> Continue the photorealism work: review the spike results (exports/photoreal-spike/index.html), then log decisions 0014 to 0017 and start B1 (exporter) and B2 (Blender pipeline) from the plan.

- **Branch:** `docs/photoreal-quality` (spike results, not merged); `main` is ahead of `origin` by the plan commit.
- **State:** no framework code changed; spike sources live in `exports/photoreal-spike/src` (git-ignored).
- **Do next:** maintainer feedback on the spikes, then decisions, then B1 and B2 (a building spike belongs to M1).
- **Watch for:** blender-mcp is one shared live Blender, never in parallel workers; push needs approval; Blender is 5.2.1 at `C:\Program Files\Blender Foundation\Blender 5.2\`.
- **Environment:** `git rev-list --count origin/main..main`, then `exports/photoreal-spike/index.html`.

---

## 2026-10-03 (feat) Wix setup guide and connect-cms option

- New guide [wix/SETUP.md](../../framework/capabilities/cms-providers/wix/SETUP.md): the steps we actually took, with German menu names and pitfalls (no CMS in the sidebar, App Market, `CMS for Harmony`, site ID from the dashboard URL, API key with specific site and read-only data permission, `.env`, `cms:check` error table). Labels not seen on screen are marked as not confirmed.
- New skill `connect-cms` walks the owner through it (keys never in chat). `npm run status` offers **"Set up Wix as CMS and link your account"** in the build and review stages while the brief names Wix in the CMS row and the site has no `.env` (existence check only). 3 new tests.

---

## 2026-10-03 (fix) Wix provider verified against a real account

- `npm run cms:check` against a real Wix site (Harmony editor, `CMS for Harmony`): connection OK, items returned flat (`id` plus fields), header `wix-site-id` confirmed. See [0011](decisions/0011-pluggable-cms-providers.md).
- Fix: `cms-check` ended with `process.exit()`, which crashed Node on Windows (libuv assertion, exit 127) while the HTTP connection was closing; now sets `process.exitCode`.
- Still open: images (`wix:image://`) from live data and a full site build from Wix content.

---

## 2026-10-03 (feat) Warn when a secret reaches the agent

- New rule in CLAUDE.md and `launch-site`: if a password, key or token reaches the agent anyway (pasted in chat, or visible in a file or output), it warns the user at once (kind and place, never the value), copies it nowhere, and recommends revoking and replacing it. Also stated in the starter `.env.example`; test extended.

---

## 2026-10-03 (feat) .env.example for every site

- The starter ships `.env.example` (copied into each new site) with a disclaimer at the top: secrets only here, never in chat or other files, the agent never opens `.env`, it is never committed or exported. Variables: `CMS_PROVIDER`, `WIX_API_KEY`, `WIX_SITE_ID`, `WIX_COLLECTIONS`.
- Starter `.gitignore` keeps `.env.example` tracked; `.claude/settings.json` denies Read and Edit of `**/.env` (commands such as `cms:check` still read it). Shell `cat` is not covered by the deny rule, so the instruction in the skill and the file remains the main guard.
- `cms:check` error and `launch-site` skill point to the file; test `dev/tests/env-example.test.mjs`.

---

## 2026-10-03 (refactor) Clean repository root

- Root reduced from about 30 entries to `README.md`, `CLAUDE.md`, `package.json`, `sites/`, `exports/`, `framework/`, `dev/` plus tool config. Decision [0013](decisions/0013-repository-structure.md).
- `framework/`: workflow, conventions, intake, launch, templates (incl. starter), capabilities, examples, tools. `dev/`: docs, scripts, tests, hooks, config.
- README, CLAUDE.md and conventions show the new tree; `.zed/settings.json` hides tool output; new `dev/tests/imports.test.mjs` catches stale imports and npm script paths.
- **Existing clones: run `npm run setup` once** (`core.hooksPath` moved from `.githooks` to `dev/hooks`).

---

