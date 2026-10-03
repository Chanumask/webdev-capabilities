# Session handover

← [CLAUDE.md](../../../CLAUDE.md) · [process index](README.md)

A maintainer session that ends with work in flight leaves the next one a single, unambiguous starting point. Website sessions hand over through the site's `brief/CHANGELOG.md` and `INTAKE.md` instead (the intake can be resumed from them).

## Where it lives

The trailing block of the **newest entry in [changelog.md](../changelog.md)**, headed `**Next session** →`. The lean session start reads the top changelog entry, so the handover is found for free, and it survives archiving because the newest entry is never archived.

## When to write one

Write the block when any of these is true at session end: a branch is open or not merged, `main` is ahead of `origin` (the user still has to push), a multi-step task is partway, a decision or user input is pending, something was installed or started that the next session must verify. If everything is merged, pushed and nothing is pending, write no block. A stale "nothing to do" block is worse than none.

## Template

```
**Next session** →

Paste-to-start prompt:
> <one or two sentences the user can paste verbatim>

- **Branch:** <name, or "main, none open">
- **State:** <done so far, 1 to 3 lines>
- **Do next:** <ordered, concrete steps>
- **Watch for:** <landmines, pending approvals>
- **Environment:** <what to verify before trusting: tools installed, servers running, push pending>
```

Keep it under 15 lines. Narrative belongs in decisions and git history.

## Using it

1. Do the lean maintainer session start ([CLAUDE.md](../../../CLAUDE.md)).
2. If the block exists, its prompt is the session's focus. Act on it instead of asking.
3. **Verify the stated environment** with one cheap read-only command each (branch, `git status`, `git rev-list --count origin/main..main`).
4. Never edit an old block. Write a new entry with its own block if work is still in flight.

Use the `session-handover` skill for both directions.
