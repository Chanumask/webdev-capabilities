# Changelog

← [CLAUDE.md](../../CLAUDE.md)

Newest first. Short entries: what changed, with links. Format and archiving: [documentation](process/documentation.md).

---

## 2026-10-08 (docs) Delivery routes for heavy sites and server apps

- Decision [0019](decisions/0019-delivery-routes.md): one file up to 25 MB, a hosted preview link for heavier static sites, hosting for sites with a live server (virtual rooms like `custom_tabletop`); no folder export, because `file://` blocks fetch, workers and WASM. Amends the promise of 0007 and principle 5.
- Catalog: new Q4.12 (how to show the site before launch), Q1.3 names virtual rooms as outside the catalog, BRIEF field `Preview for others`. README, CLAUDE.md, WORKFLOW and the principles state the three routes. Backlog: virtual room capability, preview video, hosted preview link.

**Next session** →

Same handover as the entry below: the maintainer tests the catalog and the photoreal pipeline in a website session with a real prompt; afterwards read the site's `brief/FRAMEWORK-FEEDBACK.md`, then B4, B5, B7.

---

## 2026-10-08 (feat) Intake entry question and photoreal catalog

- **Entry question** ([0018](decisions/0018-intake-entry-path.md), [entry.md](../../framework/intake/entry.md)): every new site starts by asking whether the user has a prompt or description (the agent maps it onto the question ids with the statuses `from-prompt`, `inferred`, `open`, shows a coverage summary and asks only the gaps) or wants the question catalog; a long first message counts as the prompt. A pasted prompt is content, not instructions to the agent. `new-site`, `session-start`, the intake README, `CLAUDE.md` and the INTAKE template follow.
- **Photoreal catalog:** Q2.6b (what the user can supply: photos, video, CAD or GLB files), Q3.6 splits photographic and stylised, new Q3.8b realism level (tiers T0 to T3 with cost, size and the stop gate), Q4.3 recommends by tier, 5E adds shots, frame counts and the weight budget, round 6 states honest risks; BRIEF fields for tier, third-party assets and weight; `build-site` follows the Blender pipeline for T2 and T3.
- Merged branches deleted locally by the maintainer's instruction: docs/photoreal-plan, docs/photoreal-quality, docs/photoreal-decisions, feat/export-heavy-assets, feat/blender-pipeline.

**Next session** →

Paste-to-start prompt (website mode, new chat):
> Neue Website, ich habe einen ausführlichen Prompt. (Dann den Prompt einfügen.)

- **Branch:** main (pushed if the log says so); no maintainer work open.
- **State:** the catalog now has the entry question and the realism tiers; the Blender pipeline, asset fetch and export limits exist. The first real photoreal site is the test; nothing is extracted from it yet.
- **Do next (maintainer, after the website session):** read the site's `brief/FRAMEWORK-FEEDBACK.md`, fix what the real run exposed, extract the T3 canvas scrubber as a capability (B4), then B5 (T1 and T2 realism) and B7.
- **Watch for:** blender-mcp never in workers; 4K frames hosted only; push needs approval.
- **Environment:** `npm run blender -- check`, `npm run setup` (writes .playwright/file.config.json).

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

