# 0002: Feature branches, local squash-merge, the user pushes main

Date: 2026-10-03 · Status: active

**Context.** The repository will be extended with features and capabilities, and also used by non-technical people through an agent. `main` is the version others clone and run, so it must only change by the maintainer's hand.

**Decision.**
- All work happens on `<type>/<topic>` branches (Conventional Commit types), one topic per branch, docs included.
- The agent commits on branches freely and may push feature branches to `origin`.
- The agent merges a finished, gated branch into **local** `main` with `git merge --squash` and one commit, using `WEBDEV_ALLOW_MAIN=1` for that single commit, then stops.
- **The agent never pushes `main`.** The user does: `WEBDEV_ALLOW_MAIN_PUSH=1 git push origin main`. The agent reports how far `main` is ahead of `origin`.
- Pull requests, issues, releases and tags only on request. Never force-push or delete `main`, never add another remote, never change repository or account settings, never write through `gh api`.

**Why.** The maintainer (the user) keeps the final say over what reaches GitHub, and merge-back stays a cheap local operation that the agent can do reliably. Squash keeps history readable.

**Enforcement.** `.githooks/pre-commit` blocks commits on `main` without `WEBDEV_ALLOW_MAIN=1`; `.githooks/pre-push` blocks any push of `main` without `WEBDEV_ALLOW_MAIN_PUSH=1`, force-pushes of `main`, other remotes and remote deletions; `.claude/settings.json` denies `git push` to `main`, `gh repo`, `gh api`, `gh auth`. Tests in `tests/hooks.test.mjs`. The hooks stop accidents; the rule in `CLAUDE.md` forbids the agent from ever setting the push override.

**Rules out.** Direct commits to `main`, agent-pushed `main`, auto-merging pull requests.
