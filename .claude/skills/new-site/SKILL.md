---
name: new-site
description: Start a new website project. Use when the user wants a new website, landing page, portfolio, shop-like site or redesign of a site that does not exist in sites/ yet, or says "new site", "neue Website", "Webseite bauen". Runs the multi-round design intake with AskUserQuestion, saves the brief, and ends with an approved BRIEF.md.
---

# New site: design intake

You are starting a new website for a user who is usually **not technical**. Your job in this skill is to capture the full context through several rounds of questions so the later build succeeds in one pass. You do not write site code here.

## Before you ask anything
1. Read `framework/intake/README.md` (rules for asking) and `framework/WORKFLOW.md` (stages).
2. Look at what the user already said. Extract answers from it. Fetch any URLs they mentioned (existing site, references) and summarise what you saw.
3. Tell the user in 3 lines how this goes: several short rounds with more detail each time, a summary to approve at the end, then the site is built in one go and shown on localhost; quick answers or "you decide" are fine, more answers mean fewer corrections.
4. Run `npm run list` to see existing sites (avoid slug clashes, offer to continue an existing one if the user means that).

## Create the project folder
As soon as the name is known (Q1.1), propose a kebab-case slug, confirm it, and run:
`npm run new-site -- <slug> "<Display Name>"`
This creates `sites/<slug>/` (its own git repository) with `brief/BRIEF.md`, `brief/INTAKE.md`, `brief/ACCEPTANCE.md`, `brief/CHANGELOG.md`, `brief/FRAMEWORK-FEEDBACK.md`.

## Run the rounds
Open and follow, in order, with the `AskUserQuestion` tool (max 4 questions per call, 2 to 4 options, recommended option first for every technical question):
1. `framework/intake/round-1-basics-intent.md`
2. `framework/intake/round-2-audience-content.md`
3. `framework/intake/round-3-style-design.md`
4. `framework/intake/round-4-architecture.md`
5. `framework/intake/round-5-deep-dive.md` (only the modules that apply)
6. `framework/intake/round-6-confirm.md`

Between rounds: recap in 2 to 4 lines, append the raw answers to `brief/INTAKE.md`, update `brief/BRIEF.md`. Ask the next round from what you learned; skip answered questions; add follow-ups where an answer opens a new dimension.

## Mode
This is **website mode** ([modes](../../../docs/process/modes.md)): write only inside `sites/<slug>`; never edit framework files. If a question is missing, an option is wrong or a capability would have helped, append a line to `brief/FRAMEWORK-FEEDBACK.md` and mention it to the user at the end.

## Hard rules
- Ask in the user's language. Plain words. Explain any technical term in one sentence.
- Recommend one option for every technical choice and say why it fits this project.
- Never invent facts; unknown facts become marked placeholders.
- Do not start building before the explicit "yes, build it" in round 6.
- If the user stops midway, save everything; the chat can be resumed by reading `brief/INTAKE.md`.

## When done
Brief is `status: approved`. Commit it in the site repository (`brief: approved <slug>`), then continue with the `build-site` skill (read `.claude/skills/build-site/SKILL.md`) in the same chat unless the user wants to wait.
