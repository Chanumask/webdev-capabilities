# 0008: Feedback loop from website sessions to the framework

Date: 2026-10-03 · Status: active

**Context.** Website sessions reveal where the question catalog, agent instructions, capabilities and user guidance fall short, but website mode must not edit the framework ([0005](0005-session-modes.md)) and customer data must stay private ([0003](0003-sites-own-repos.md)).

**Decision.**
- Website sessions note framework gaps in `sites/<slug>/brief/FRAMEWORK-FEEDBACK.md` as they notice them.
- A `wrap-up` skill ends a website session with `brief/SESSION-REPORT-<date>.md` (template in `framework/templates/brief/`), a short chat summary, and, only with the user's agreement, an anonymised file `exports/feedback/<date>-<slug>.md` that the user reviews and sends themselves. The agent never creates issues or sends anything.
- A `triage-feedback` skill in maintainer mode reads those files (read only), received bundles in `inbox/` (git-ignored) and turns them into backlog items or branches. `lastFeedbackTriage` in `.claude/framework-state.json` marks progress.
- Tracked framework files never contain customer names, copy, prices or secrets.

**Why.** Improvements come from real sessions; the loop keeps non-technical users out of git while giving the maintainer structured, comparable evidence by target.

**Rules out.** Website sessions editing the framework to fix what they found; automatic upload of reports; reports that carry customer data into the shared repository.
