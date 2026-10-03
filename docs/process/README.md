# Process

← [CLAUDE.md](../../CLAUDE.md) · [docs index](../README.md)

How work on the **framework repository** happens (maintainer mode). The process for building customer websites is in [`framework/`](../../framework/WORKFLOW.md).

| File | Read when... |
|---|---|
| [modes.md](modes.md) | Starting any session: website mode or maintainer mode, what each may touch |
| [git-workflow.md](git-workflow.md) | Before any commit, branch, merge or push |
| [quality-gates.md](quality-gates.md) | Before committing, or when a check fails |
| [documentation.md](documentation.md) | Writing or trimming docs; budgets, archiving and deletion rules |
| [extending.md](extending.md) | Adding a capability, intake question, skill, tool, template or example |
| [feedback-loop.md](feedback-loop.md) | Wrapping up a website session, sharing feedback, triaging it in a maintainer session |
| [parallel-agents.md](parallel-agents.md) | Before spawning subagents |
| [session-handover.md](session-handover.md) | Ending a maintainer session with work in flight, or starting one |

These are also project skills under [`.claude/skills/`](../../.claude/skills/new-site/SKILL.md) so they are followed automatically (`session-start`, `wrap-up`, `triage-feedback`, `feature-workflow`, `sanity-check`, `session-handover`, `decision-log`, `parallel-planning`).
