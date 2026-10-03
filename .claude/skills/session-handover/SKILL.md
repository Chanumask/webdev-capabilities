---
name: session-handover
description: Write or consume the Next session handover block in the changelog. Use at the end of any maintainer session that leaves work in flight (open branch, main ahead of origin, pending decision), and at the start of a maintainer session to pick up where the last one stopped.
---

# Session handover

Policy and template: [session handover](../../../dev/docs/process/session-handover.md).

**Ending a session**
1. Was repository state changed? Add a short dated entry at the top of [changelog](../../../dev/docs/changelog.md) (max 25 lines, links not essays).
2. Work in flight (open or unmerged branch, `main` ahead of `origin`, pending user input, something installed)? End the entry with the `**Next session** →` block from the template, under 15 lines.
3. Clean end? Write no block.
4. If the live changelog passed 150 lines, run `node dev/scripts/archive-changelog.mjs`.
5. Run `node dev/scripts/check-docs.mjs`.

**Starting a session**
1. Read the top changelog entry only.
2. If it has a block, its prompt is the focus. Verify the stated environment with cheap read-only checks before trusting it, then act. Do not ask what the focus is.
3. Never edit an old block.
