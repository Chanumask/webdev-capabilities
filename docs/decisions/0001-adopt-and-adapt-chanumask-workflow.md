# 0001: Adopt and adapt the Chanumask workflow

Date: 2026-10-03 · Status: active

**Context.** The maintainer has a mature repository (`Chanumask`) with an entry-point `CLAUDE.md`, indexed docs with size budgets, decision records, a changelog with handover blocks, git hooks, quality gates and project skills. This repository is about to grow features and needs the same discipline.

**Kept.** Short `CLAUDE.md` that orients, indexed `docs/` with budgets checked by `scripts/check-docs.mjs`, one-file-per-decision log, changelog with handover block and archive script, Conventional Commits enforced by a hook, `.githooks/` via `core.hooksPath`, secrets and size guard, no-deletion-without-approval, GitHub boundary, feature-workflow / sanity-check / session-handover / decision-log / parallel-planning skills, Prettier and ESLint, `.editorconfig`, `.gitmessage`.

**Changed.**
- Two session modes instead of one ([0005](0005-session-modes.md)).
- `main` is never committed to except the local squash-merge, and every push needs the user's approval each time ([0002](0002-git-workflow.md), amended by [0012](0012-push-with-approval.md)). Chanumask pre-authorizes pushes of feature branches and `main`.
- Docs-only changes also go through a branch.
- Customer sites live in their own repositories ([0003](0003-sites-own-repos.md)).
- Tooling is npm and plain Node (`node --test`), not pnpm, Vitest and TypeScript project references, because this repository holds scripts, docs and templates rather than an application ([0006](0006-tooling-and-quality-gates.md)).
- Environment variable prefix `WEBDEV_` instead of `CHANUMASK_`.

**Why.** Reuse what already works for the maintainer; change only what this repository's different risks require.

**Rules out.** Copying the Chanumask workflow verbatim; a second, divergent set of conventions.
