# Changelog

← [CLAUDE.md](../CLAUDE.md)

Newest first. Short entries: what changed, with links. Format and archiving: [documentation](process/documentation.md).

---

## 2026-10-03 (feat) Maintainer workflow and session modes

- Two session modes, chosen by the new `session-start` skill: website mode (intake, build, change, export; writes only in `sites/<slug>`) and maintainer mode (framework work on feature branches) ([0005](decisions/0005-session-modes.md), [modes](process/modes.md)).
- Git workflow adapted from Chanumask: feature branches, Conventional Commits, local squash-merge by the agent, **the user pushes `main`** ([0002](decisions/0002-git-workflow.md)). Hooks in `.githooks/` block commits on `main`, pushes of `main`, tracked-file deletions, secrets, customer sites and large files; tests in `tests/hooks.test.mjs`.
- Customer sites are git-ignored here and each gets its own repository from `npm run new-site` ([0003](decisions/0003-sites-own-repos.md)); sites write framework gaps to `brief/FRAMEWORK-FEEDBACK.md`.
- Tooling and gates: Prettier, ESLint, `node --test`, `scripts/check-docs.mjs`, `npm run check`, `npm run smoke` ([0006](decisions/0006-tooling-and-quality-gates.md)). `npm run setup` activates the hooks.
- Docs restructured to the Chanumask layout: `docs/{product,decisions,process,research,archive}`, decision log 0001 to 0007, size budgets; skills `feature-workflow`, `sanity-check`, `session-handover`, `decision-log`, `parallel-planning`, `session-start`; `.claude/settings.json` permissions.
- Branch `feat/maintainer-workflow` squash-merged into local `main`.

**Next session** →

Paste-to-start prompt:
> Maintainer mode: check that `main` is pushed, then pick the next item from the backlog.

- **Branch:** main, none open.
- **State:** the new workflow is on local `main` and not yet on `origin`.
- **Do next:** the user pushes: `WEBDEV_ALLOW_MAIN_PUSH=1 git push origin main`. Then delete the merged branch locally (standing approval after the push).
- **Watch for:** hooks only protect a clone where `npm run setup` ran (`git config core.hooksPath .githooks`).
- **Environment:** `git rev-list --count origin/main..main` should be 1 until pushed; `npm run check` green.
