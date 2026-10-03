# 0012: The agent may push, after asking each time

Date: 2026-10-03 · Status: active

**Context.** [0002](0002-git-workflow.md) said the agent never pushes `main` and the user pushes it. In practice the user wants the agent to do the push, as long as the user stays in control of every push.

**Decision.**
- The agent **may push** to `origin`: feature branches and `main`.
- **Before every push the agent asks** with `AskUserQuestion`, naming the branch, the remote and the commits (count and subjects). One approval covers that one push; the next push asks again. "Push" includes `--force-with-lease` on the agent's own feature branch after a rebase, which says so in the question.
- A `main` push also needs `WEBDEV_ALLOW_MAIN_PUSH=1`, set by the agent only on the command the user just approved. The user may set it any time.
- Unchanged: no direct commits on `main` (only the local squash-merge sets `WEBDEV_ALLOW_MAIN=1`), no force-push of `main`, no deletion of `main`, no other remote, remote branch deletions need approval ([0004](0004-no-deletion-without-approval.md)), no repository or account changes.

**Enforcement.** `dev/hooks/pre-push` still blocks any `main` push without the override and refuses other remotes; `.claude/settings.json` puts every `git push` on the ask list (a second, tool-level prompt) and keeps force-pushes, `main` deletion, remote changes and `gh repo`/`gh api`/`gh auth` denied.

**Why.** The user keeps the final say over what reaches GitHub without having to run the commands; the agent can finish a merge-back in one conversation.

**Rules out.** Pushing without asking, standing approvals ("always push"), asking once for a whole session.
