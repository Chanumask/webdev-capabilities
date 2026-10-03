---
name: decision-log
description: Record a non-obvious decision (tooling, architecture, recommendation logic, process, scope) as its own file in docs/decisions/ and update the index. Use when the decision is made, not afterwards, and whenever a decision supersedes an earlier one.
---

# Decision log

Format rules: [documentation](../../../docs/process/documentation.md).

1. Pick the next number from [the index](../../../docs/decisions/README.md).
2. Create `docs/decisions/NNNN-short-slug.md` (max 60 lines):
   ```
   # NNNN: Title
   Date: YYYY-MM-DD · Status: active

   **Context.** ...  **Decision.** ...  **Why.** ...  **Rules out.** ...
   ```
3. Add one line to the index table: number and link, decision, status, date. No prose in the index.
4. Superseding? Set the old file's status to `superseded` (and name the new one in its text), and update its index row. Never delete the old file.
5. A decision that adds a dependency or service that can charge money must say so and needs the user's explicit approval first.
6. Run `node scripts/check-docs.mjs`.
