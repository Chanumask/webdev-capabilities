# Parallel agents

← [CLAUDE.md](../../CLAUDE.md) · [process index](README.md)

In maintainer mode the agent may spawn worker subagents for independent, parallelizable work without asking each time. Adapted from Chanumask; the shared touchpoints here are different.

## Roles

- **Orchestrator:** the main session and the user's only interface. Decides what to split, briefs workers, collects reports, consolidates docs, merges locally, and pushes only after the user approves each push ([git workflow](git-workflow.md)).
- **Worker:** one per independent unit, in its own worktree and branch, following the [feature-workflow](../../.claude/skills/feature-workflow/SKILL.md) up to the commit. Never talks to the user, never pushes, never merges, never edits the changelog or decision log.

## When to parallelize

- The units are genuinely independent and big enough to justify a cold-start brief. Small or sequential work stays in the main session.
- Check overlap first. Shared touchpoints in this repo:
  - `framework/intake/` and `framework/templates/brief/BRIEF.md` (a new question usually needs a new brief field),
  - `templates/starter/` (every capability may touch it),
  - `package.json`, `package-lock.json`, `.claude/settings.json`, `.githooks/`,
  - `CLAUDE.md`, the docs indexes, the changelog and the decision index.
  A real overlap is serialized or given to one owner.

## Serialized work

Run one at a time, never in workers: dependency installs (changes the lockfile), anything that starts a dev server on a fixed port, browser-based verification of the reference example, changes to hooks or settings.

## Brief contents

A worker starts cold. The brief points at the docs: start at `CLAUDE.md`, use the `feature-workflow` skill. It adds only the task, the owned files, the no-touch list, and what to report (branch, files changed, gate status, decisions worth logging, overlaps, open questions).

## Orchestrator merge sequence

1. Collect reports. 2. Run serialized checks per branch. 3. Consolidate docs once: one decision per decision, one changelog entry for the batch. 4. Squash-merge one branch at a time into local `main`; a conflict beyond docs means the tasks were not independent. 5. Ask whether to push `main` (explicit approval each time). 6. After the user pushed, delete merged branches and worktrees (standing approval for merged feature branches, [0004](../decisions/0004-no-deletion-without-approval.md)).
