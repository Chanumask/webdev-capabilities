# 0004: No deletion without approval

Date: 2026-10-03 · Status: active

**Decision.** Never delete anything without asking first and getting explicit approval, every time. "Delete" covers files, folders, git branches (local and remote), worktrees, tags, stashes and customer site folders. Approval of a broader task does not cover it, and neither does an earlier approval. Ask by naming exactly what would be deleted, then wait. Never install or overwrite anything outside the repository without the same.

**Exceptions.**
- Feature branches already merged into `main` (and pushed by the user) may be deleted locally and as worktrees, after `git diff --stat main <branch>` is empty.
- Editing and overwriting files inside the repository as part of the current task is fine. Moving content without losing it (`git mv`, the changelog archive script) is not deletion.
- Throwaway files in temporary folders, in `.smoke/` and in tests' temporary directories belong to the tooling and may be rewritten; they are not customer data.

**Enforcement.** `pre-commit` blocks commits that delete tracked files unless `WEBDEV_ALLOW_DELETE=1` is set for that commit after approval; `pre-push` blocks remote deletions the same way; `.claude/settings.json` sets removal commands to ask.

**Why.** Deletions are the least reversible thing an agent does, and the user may not be able to recover them.
