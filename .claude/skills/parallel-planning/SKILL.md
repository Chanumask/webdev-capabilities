---
name: parallel-planning
description: Decide whether a framework task should be split across parallel worker subagents or handled in the main session, size the workers, and draft their self-contained briefs. Use in maintainer mode when a task has several independent parts, or when unsure whether it is parallelizable.
---

# Parallel planning

Orchestrator's decision skill. Policy: [parallel agents](../../../dev/docs/process/parallel-agents.md).

1. **Split** the task into the smallest units that make sense as separate branches. One unit means no parallelism: run `feature-workflow` directly.
2. **Check overlap** for each pair: intake files and the brief template, the starter, `package.json` and lockfile, hooks and settings, `CLAUDE.md`, docs indexes and the changelog. Deep overlap means do not parallelize.
3. **Decide.** Parallelize only for substantively independent units, each big enough to justify a cold-start brief.
4. **Brief each worker** (self-contained, pointing at docs): task, owned files, explicit no-touch list, start at `CLAUDE.md`, use `feature-workflow`, report format, boundaries (no push, no merge, no changelog or decision edits, no installs).
5. **Serialize** installs, lockfile changes, fixed-port dev servers, browser checks of the reference example, hook and settings changes.
6. **Spawn** with `isolation: "worktree"` and branch names per the git workflow, in the background unless the next step depends on one.
7. **After reports:** consolidate docs once, squash-merge one branch at a time into local `main`, then ask whether to push `main` (explicit approval each time).
