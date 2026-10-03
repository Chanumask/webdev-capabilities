# Changelog

← [CLAUDE.md](../../CLAUDE.md)

Newest first. Short entries: what changed, with links. Format and archiving: [documentation](process/documentation.md).

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
