---
name: session-start
description: Decide the session mode at the start of every conversation in this repository. Use first, before any other work, whenever a new session begins or the user changes what they want to do. Chooses between website mode (build, change or export a customer website, run the question catalog) and maintainer mode (improve the framework itself), then runs the matching start steps.
---

# Session start

Policy: [modes](../../../dev/docs/process/modes.md), [decision 0005](../../../dev/docs/decisions/0005-session-modes.md).

## 1. Decide the mode
- Clear from the first message? Say it in one line and proceed ("Website mode: new site for ..." / "Maintainer mode: adding a capability ...").
  - Website: wants a website or landing page, names a customer or an existing site, gives design feedback, asks to export, "set up", "get started".
  - Maintainer: change to the repository, a capability, the question catalog (changing it), tools, hooks, docs, skills, tests, "feature", "branch", "the framework", "push".
- Otherwise ask once with `AskUserQuestion` ("What do you want to do in this session?"): Build or edit a website (Recommended for non-technical users) / Work on the framework itself / Set up and get oriented / Explain what this repository does.
- Crossing modes mid-session: finish the current mode's work, note the gap, offer a separate session.

## 2a. Website mode start
1. Fresh clone (`.claude/framework-state.json` missing) or "set up": run the `onboard` skill. Otherwise, if a site exists, run `npm run status -- <slug>` and lead with its proposed next step ([NEXT-STEPS](../../../framework/NEXT-STEPS.md)).
2. New website: `new-site` skill (intake). It starts by asking whether the user has a prompt or description (then the agent extracts the answers and asks only the gaps) or wants the question catalog; a first message that already is a long description counts as the prompt ([entry](../../../framework/intake/entry.md)). Existing site: `change-site`. Export: `export-site`.
3. End of the session: when the user is done or says "wrap up", run the `wrap-up` skill (session report, feedback summary, optional shareable file).
4. Rules: write only inside `sites/<slug>` and `exports/`; never edit framework files; framework gaps go to `sites/<slug>/brief/FRAMEWORK-FEEDBACK.md`; commit milestones in the site's own repo; never touch the framework repo's branch state.

## 2b. Maintainer mode start (lean, on purpose)
1. Read [principles](../../../dev/docs/product/principles.md), the [decision index](../../../dev/docs/decisions/README.md), and only the **top entry** of [changelog](../../../dev/docs/changelog.md). Do not read whole logs.
2. If that entry ends with a `**Next session** →` block, it is this session's focus: verify the environment it describes (`git branch --show-current`, `git status -sb`, `git rev-list --count origin/main..main`), then act (see `session-handover`).
3. Otherwise ask what the focus is (or take it from the user's message) and read only the docs that topic needs. When the user asks what to improve, or feedback files exist, run `triage-feedback`.
4. Before writing anything: `git branch --show-current`. On `main`, create a feature branch first (`feature-workflow` skill). Never commit on `main` (except the local squash-merge); pushing needs approval each time.
5. Run `node dev/scripts/check-docs.mjs` if the session will touch docs.
