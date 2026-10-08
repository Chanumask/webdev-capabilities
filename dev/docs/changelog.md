# Changelog

← [CLAUDE.md](../../CLAUDE.md)

Newest first. Short entries: what changed, with links. Format and archiving: [documentation](process/documentation.md).

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

## 2026-10-03 (feat) Pushes need approval each time

- New rule [0012](decisions/0012-push-with-approval.md): the agent may push (feature branches and `main`) but asks with `AskUserQuestion` before **every** push, naming branch and commits; one approval covers one push. Amends the push part of [0002](decisions/0002-git-workflow.md).
- Hooks keep blocking `main` pushes without `WEBDEV_ALLOW_MAIN_PUSH=1`; the agent sets it only on the command the user just approved. `.claude/settings.json` puts every `git push` on the ask list and keeps force-pushes, `main` deletion, remote changes and `gh repo|api|auth` denied; `dev/tests/settings.test.mjs` locks that in.
- CLAUDE.md, git workflow, feature-workflow, parallel-planning, session-start, modes and README updated.

---

## 2026-10-03 (feat) Launch, handover, agent-led mode, pluggable CMS

- **Agent-led website mode** ([0009](decisions/0009-agent-led-website-mode.md)): `npm run status` derives the stage from the brief and proposes next steps; `framework/NEXT-STEPS.md`; every website skill ends with the proposal.
- **Launch and handover** ([0010](decisions/0010-launch-and-handover.md)): skills `launch-site` and `handover-site`, guides in `framework/launch/` (domains explained from scratch, hosting options, playbook, handover), templates, tools `launch-prep`, `launch-check`, `dns-check`, `handover`; starter gets 404, robots, headers, canonical.
- **CMS plug-ins** ([0011](decisions/0011-pluggable-cms-providers.md)): provider contract; Wix provider (REST, API key) with `cms:check`; tested against a mock of the documented API only, real Wix account pending; research facts in [02](research/02-cms-and-git.md).
- Intake: hosting recommendation, domain and email questions (4.10, 4.11), launch module 5L; brief gets `launch`, `handover`, `domain`, `host` fields and a launch section.
- 48 tests; launch-check run on the Lindenhof example blocks it as intended (placeholders).

**Next session** →

Paste-to-start prompt:
> Maintainer mode: after the user pushes main, verify the Wix provider with the user's real Wix account (npm run cms:check) and fix what differs from the docs.

- **Branch:** main, none open after the local merge; `main` is ahead of `origin`.
- **State:** launch, handover, status driver and Wix provider are merged locally; Wix provider verified against a mock only.
- **Do next:** the user pushes main; then test Wix: create collection, API key (Read Data Items), site id in `sites/<slug>/.env`, run cms:check; check the `wix-site-id` header and fix the provider if needed.
- **Watch for:** never paste the API key into the chat; `.env` is git-ignored.
- **Environment:** `npm run check` green; `git rev-list --count origin/main..main` shows the unpushed commits.

---

## 2026-10-03 (feat) Session wrap-up and feedback loop

- New `wrap-up` skill for website sessions: session report from a template, short summary for the user, optional anonymised file in `exports/feedback/` ([0008](decisions/0008-feedback-loop.md), [feedback loop](process/feedback-loop.md)).
- New `triage-feedback` skill for maintainer sessions: reads site feedback files and received bundles (`inbox/`, git-ignored), groups by target, proposes backlog items or branches.
- `framework/templates/SESSION-REPORT.md`; Stage 7 in the website workflow; modes doc, CLAUDE.md, README and session-start updated.
- Skill checks made automatic: `dev/tests/skills.test.mjs` verifies every skill's frontmatter and its mention in CLAUDE.md; the docs check finds skills by folder.
- Deleted `dev/docs/.astro` and `dev/docs/node_modules` (stray tool folders, user approved).

**Next session** →

Paste-to-start prompt:
> Maintainer mode: check that `main` is pushed, then run triage-feedback on the first website session's report.

- **Branch:** main, none open (merged `feat/maintainer-workflow` and `feat/session-wrap-up` can be deleted locally once pushed).
- **State:** both features are squash-merged into local `main`, which is 2 commits ahead of `origin`.
- **Do next:** the user pushes (`WEBDEV_ALLOW_MAIN_PUSH=1 git push origin main`); then delete the merged branches locally; after the user's first website-mode test run `triage-feedback`.
- **Watch for:** the intake rounds have never run in a live chat; expect findings.
- **Environment:** `git rev-list --count origin/main..main` is 2 until pushed; `npm run check` green.

---

## 2026-10-03 (feat) Maintainer workflow and session modes

- Two session modes, chosen by the new `session-start` skill: website mode (intake, build, change, export; writes only in `sites/<slug>`) and maintainer mode (framework work on feature branches) ([0005](decisions/0005-session-modes.md), [modes](process/modes.md)).
- Git workflow adapted from Chanumask: feature branches, Conventional Commits, local squash-merge by the agent, **the user pushes `main`** ([0002](decisions/0002-git-workflow.md)). Hooks in `dev/hooks/` block commits on `main`, pushes of `main`, tracked-file deletions, secrets, customer sites and large files; tests in `dev/tests/hooks.test.mjs`.
- Customer sites are git-ignored here and each gets its own repository from `npm run new-site` ([0003](decisions/0003-sites-own-repos.md)); sites write framework gaps to `brief/FRAMEWORK-FEEDBACK.md`.
- Tooling and gates: Prettier, ESLint, `node --test`, `dev/scripts/check-docs.mjs`, `npm run check`, `npm run smoke` ([0006](decisions/0006-tooling-and-quality-gates.md)). `npm run setup` activates the hooks.
- Docs restructured to the Chanumask layout: `dev/docs/{product,decisions,process,research,archive}`, decision log 0001 to 0007, size budgets; skills `feature-workflow`, `sanity-check`, `session-handover`, `decision-log`, `parallel-planning`, `session-start`; `.claude/settings.json` permissions.
- Branch `feat/maintainer-workflow` squash-merged into local `main`.

**Next session** →

Paste-to-start prompt:
> Maintainer mode: check that `main` is pushed, then pick the next item from the backlog.

- **Branch:** main, none open.
- **State:** the new workflow is on local `main` and not yet on `origin`.
- **Do next:** the user pushes: `WEBDEV_ALLOW_MAIN_PUSH=1 git push origin main`. Then delete the merged branch locally (standing approval after the push).
- **Watch for:** hooks only protect a clone where `npm run setup` ran (`git config core.hooksPath dev/hooks`).
- **Environment:** `git rev-list --count origin/main..main` should be 1 until pushed; `npm run check` green.
