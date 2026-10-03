# 0005: Two session modes, website and maintainer

Date: 2026-10-03 · Status: active

**Context.** The repository serves two purposes: users build websites with the agent (the question catalog, brief, build, export), and the maintainer extends the framework. Mixing them risks a website session editing framework files, or a framework session touching customer data.

**Decision.** Every session runs in one mode, decided at session start by the `session-start` skill from the first message or one `AskUserQuestion`:
- **Website mode:** intake, build, change, export. Writes only in `sites/<slug>` and `exports/`. Never edits framework files; records framework gaps in the site's `brief/FRAMEWORK-FEEDBACK.md`.
- **Maintainer mode:** works on the framework on feature branches with quality gates, decisions, changelog and handover. Never touches `sites/**` unless the user names a site.
- Running the question catalog is website mode; changing it is maintainer mode.

Details: [modes](../process/modes.md).

**Why.** Clear permissions per mode keep non-technical sessions safe, keep customer data out of framework work, and give improvements found in the field a path back into the framework.

**Rules out.** One undifferentiated session type; website sessions fixing the framework on the fly.
