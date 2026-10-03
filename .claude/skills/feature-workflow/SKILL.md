---
name: feature-workflow
description: Run one framework change (capability, intake question, tool, skill, template, docs, fix) through this repository's standard sequence - branch, orient, implement, test, gates, document, commit, local squash-merge. Use in maintainer mode whenever starting real work on the repository itself, in the main session or inside a worker subagent. Use this instead of improvising git commands.
---

# Feature workflow (maintainer mode)

Authoritative policy: [CLAUDE.md](../../../CLAUDE.md) and [git workflow](../../../dev/docs/process/git-workflow.md). If this skill conflicts with them, they win. How to add specific things: [extending](../../../dev/docs/process/extending.md).

## Worker or solo?
If this task came from a parallel batch ([parallel agents](../../../dev/docs/process/parallel-agents.md)), **stop after the commit step**: no merge, no changelog or decision edits, no push. Report back: branch, files changed, gate status, decisions worth logging, overlaps, open questions.

## Sequence
0. **Orient.** `session-start` maintainer steps; read only the docs the task touches.
1. **Branch.** `git switch -c <type>/<topic>` off up-to-date `main` (never work on `main`).
2. **Check live state.** Look at the actual files and versions instead of trusting memory or an old handover.
3. **Evaluate alternatives.** Existing pattern? Settled in the decision index? Log non-obvious choices with `decision-log`.
4. **Implement** only this branch's topic. Unrelated findings go to [backlog](../../../dev/docs/product/backlog.md) or their own branch.
5. **Test.** Add tests in `dev/tests/` for tool and hook behaviour; run `npm run smoke` for starter changes.
6. **Gates.** Run the `sanity-check` skill until clean.
7. **Document.** Decisions, a short changelog entry (handover block if work is in flight), indexes, backlog.
8. **Commit.** Conventional Commit, scope from the list in the git workflow, end with the attribution line the session provides. Pre-authorized. Pushing the branch is optional and needs approval each time (ask, naming branch and commits).
9. **Merge back (solo only).** Rebase on `main`, rerun gates, re-check scope, then `git switch main && git merge --squash <branch>` and `WEBDEV_ALLOW_MAIN=1 git commit -m "type(scope): summary"`. **Then ask whether to push `main`** (`AskUserQuestion`: "Push main to origin? N commits: <subjects>"; options push now / not yet). Only after a yes, run `WEBDEV_ALLOW_MAIN_PUSH=1 git push origin main` on that one command, then verify with `git status -sb`. Without approval stop and leave a handover block. After the push, a merged branch may be deleted locally after `git diff --stat main <branch>` is empty; anything else needs approval ([0004](../../../dev/docs/decisions/0004-no-deletion-without-approval.md)).

Stay inside the GitHub boundary in the git workflow: nothing beyond `origin`, no repository or settings changes, no pull requests unless asked.
