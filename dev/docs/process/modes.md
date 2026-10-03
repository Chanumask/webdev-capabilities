# Session modes

← [CLAUDE.md](../../../CLAUDE.md) · [process index](README.md)

Every session runs in exactly one of two modes. They have different goals, different allowed paths and different git rules. Decision: [0005](../decisions/0005-session-modes.md).

| | Website mode | Maintainer mode |
|---|---|---|
| Goal | Build, change or export a customer website | Improve the framework itself |
| Typical user | Non-technical, describes a website | The maintainer, extends the repo |
| Starts with | Onboarding or the design intake (`new-site`, `change-site`, `export-site`) | Reading principles, decision index and the top changelog entry |
| May write | `sites/<slug>/**` (the site's own git repo), `exports/**` | everything except `sites/**` |
| Must not touch | `framework/`, `dev/`, `.claude/`, `CLAUDE.md`, `README.md` | `sites/**` (customer data), except reading the two feedback files for `triage-feedback`, or a site the user names explicitly |
| Git | commits in the site's own repo (milestones); the framework repo stays untouched | feature branch, local squash-merge, pushes only after asking each time ([git workflow](git-workflow.md)) |
| Quality gates | the site's acceptance checklist and Impeccable review | [quality gates](quality-gates.md) |
| Ends with | localhost address, export path, feedback summary | changelog entry, handover block if work is in flight |

## Choosing the mode

At session start the `session-start` skill decides:
1. If the first message makes the mode clear, state it in one line and proceed ("Website mode: new site for ...").
   - Website signals: wants a website or landing page, mentions a customer, a site by name, feedback on a design, export, "set up".
   - Maintainer signals: change to the repository, a new capability, the question catalog, tools, hooks, docs, skills, tests, "feature", "branch", "the framework".
2. Otherwise ask with `AskUserQuestion` (options: build or edit a website, work on the framework itself, set up and get oriented, explain what this repository does).
3. If a request crosses modes (a website needs a missing capability), finish the website work first, record the gap (below), and offer a separate maintainer session.

The user can switch by saying so; the agent restates the mode and its rules.

## The question catalog belongs to both modes

- **Running** the catalog (asking the questions, filling the brief) is **website mode**.
- **Changing** the catalog (new question, new option, new round, changed recommendation logic) is **maintainer mode**: a feature branch, `intake` scope, tests or fixtures where possible, a changelog entry.

## Feedback from website mode to maintainer mode

Website sessions do not edit the framework. They note gaps in `sites/<slug>/brief/FRAMEWORK-FEEDBACK.md` as they go and end with the `wrap-up` skill: a session report, a short summary for the user and, if the user agrees, an anonymised file to send to the maintainer. A maintainer session runs `triage-feedback`, which **reads** `sites/*/brief/FRAMEWORK-FEEDBACK.md`, `sites/*/brief/SESSION-REPORT-*.md` and received bundles in `inbox/`, asks the user what to take, and turns it into backlog items or branches. Details: [feedback loop](feedback-loop.md), [0008](../decisions/0008-feedback-loop.md).

## Edge rules

- Setup (`npm run setup`) writes only git-ignored state and the git config of this clone; it is allowed in either mode.
- A maintainer session that needs a real site to test with works on a throwaway site in a temporary `WEBDEV_SITES_DIR`, never on a customer site.
- A website session never creates branches or commits in the framework repo; if it finds the framework repo dirty or on a feature branch, it says so and carries on without touching it.
