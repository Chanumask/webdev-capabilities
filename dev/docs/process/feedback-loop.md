# Feedback loop

← [CLAUDE.md](../../../CLAUDE.md) · [process index](README.md)

How lessons from website sessions flow back into the framework. Decision: [0008](../decisions/0008-feedback-loop.md). Modes: [modes](modes.md).

```
website session            wrap-up skill              maintainer session
notes as it goes   ->   SESSION-REPORT + feedback  ->  triage-feedback  ->  backlog / branches
FRAMEWORK-FEEDBACK       optional anonymised bundle      (read only)          intake, skills, capabilities, docs
```

## In a website session
1. **While working:** append a line to `sites/<slug>/brief/FRAMEWORK-FEEDBACK.md` the moment something framework-related is noticed (kind, what, why it mattered). Never edit the framework.
2. **At the end** (the user says "wrap up", or after a first build or change round when they seem done): the `wrap-up` skill writes `brief/SESSION-REPORT-<date>.md` from the template and summarises it to the user.
3. **Sharing:** with the user's agreement the skill creates an anonymised file `exports/feedback/<date>-<slug>.md`. The user reviews it and sends it to the maintainer (issue, email, chat). The agent never creates issues or sends anything.

## What a report covers
Intake catalog (unclear, missing, redundant questions, answers changed later), agent instructions (deviations, getting stuck, repeated asks), capabilities and tools (missing, buggy, slow), user guidance (what needed explaining), design outcome (liked, disliked, pinned preferences), effort (rework loops). Every proposal names a target, priority and evidence.

## Privacy
Reports stay in the site's own repository. The shareable file contains no customer names, copy, prices, keys or personal data; the user reads it before sending. Tracked framework files never receive customer details.

## In a maintainer session
The `triage-feedback` skill reads (read only) `sites/*/brief/FRAMEWORK-FEEDBACK.md`, `sites/*/brief/SESSION-REPORT-*.md` and bundles saved in `inbox/` (git-ignored), groups them by target, asks the user what to take now, put on the [backlog](../product/backlog.md) or drop, and then works through the normal [feature workflow](git-workflow.md). `lastFeedbackTriage` in `.claude/framework-state.json` marks what was processed.

## Targets and where the fix lands
| Target | Fix lands in |
|---|---|
| Intake catalog | `framework/intake/`, `framework/templates/brief/` |
| Agent instructions | `.claude/skills/`, `CLAUDE.md`, `framework/WORKFLOW.md` |
| Capability | `framework/capabilities/`, `framework/templates/starter/` |
| Tool | `framework/tools/`, `dev/tests/` |
| User guidance | `README.md`, `framework/CONVENTIONS.md`, onboarding skill |
| Design quality | Impeccable usage in `build-site`, recommendations in round 3 |
