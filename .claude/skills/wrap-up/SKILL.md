---
name: wrap-up
description: Wrap up a website-mode session with a structured report of key issues, user feedback and improvement proposals for the framework (question catalog, agent instructions, capabilities, user guidance). Use when the user says "wrap up", "end the session", "session report", "summarize this session", "Feedback zusammenfassen", when they are about to stop after building or changing a site, or when you have just finished the first build or a change round and the user seems done.
---

# Wrap-up (website mode)

Policy: [feedback loop](../../../dev/docs/process/feedback-loop.md), [decision 0008](../../../dev/docs/decisions/0008-feedback-loop.md). Website mode applies: write only in `sites/<slug>` and `exports/`, never edit the framework. This skill does not apply in maintainer mode (use `triage-feedback` there).

## 1. Identify and gather
- The site: the one worked on in this session (ask if unclear).
- Evidence: this conversation (what was asked, corrections, rejected options, confusions, "you decide" answers, praise), `brief/INTAKE.md`, `brief/BRIEF.md` (status), `brief/CHANGELOG.md`, `brief/FRAMEWORK-FEEDBACK.md`, `git log --oneline` of the site repository, tool or command errors you hit, review findings.

## 2. Analyse through these lenses
1. **Intake catalog:** questions that were unclear, redundant, missing, or in the wrong round; answers the user changed later (a sign the question was weak); topics the user raised that no question covered; where the recommendation was wrong or ignored.
2. **Agent instructions:** where you or the skills deviated from the workflow, asked too much or too little, got stuck, guessed, or needed the user to repeat themselves.
3. **Capabilities and tools:** features missing, bugs, workarounds, slow steps, things only possible by hand.
4. **User guidance:** what the user asked about how things work, terms they did not understand, steps they did not know about (README, onboarding, explanations, localhost and export).
5. **Design outcome:** what they liked and disliked, preferences they pinned (colour level, realism, motion, tone), number of change rounds and what each changed.
6. **Effort:** where time went (rework loops, verification rounds, long waits).

## 3. Write the report
Create `brief/SESSION-REPORT-<YYYY-MM-DD>.md` (add `-2`, `-3` if one exists) from [`framework/templates/SESSION-REPORT.md`](../../../framework/templates/SESSION-REPORT.md). Every proposal has: observation, proposal, target (intake / agent instructions / capability / tool / user docs / design), priority, evidence (a short quote or fact). Append one distilled line per proposal to `brief/FRAMEWORK-FEEDBACK.md`. Commit in the site repository: `docs: session report <date>`.

## 4. Tell the user (short, plain language, at most 15 lines)
Outcome of the session; the 3 to 5 most important findings; what you would improve in the framework (by target); what remains open for the site and how to continue (`change-site`, localhost address, export path, how to stop the dev server).

## 5. Ask what to do with it (one `AskUserQuestion` call)
- **Share with the maintainer?** Create an anonymised feedback file (Recommended): `exports/feedback/<date>-<slug>.md`, no names, copy text, prices or secrets, only process findings and proposals; the user reviews it and sends it (GitHub issue, email or chat). You never create issues or send anything yourself. / Keep it in this site only.
- **Anything wrong or missing in the summary?** Looks right / Add something (free text). Update the report if they add.

## Rules
- No customer secrets, personal data, keys or private copy in the shareable file. Replace names with "the client" and sector.
- Quote the user sparingly, only generic feedback, never private details.
- Be honest about the agent's own mistakes; they are the most useful findings.
- If the user already left, still write the report and the FRAMEWORK-FEEDBACK lines, skip the questions, and say where the files are next time.

## Next step
Agent-led ([NEXT-STEPS](../../../framework/NEXT-STEPS.md)): when this skill finishes, run `npm run status -- <slug>`, say where the site stands and offer the next step with `AskUserQuestion` (recommended first). Never end with an open "let me know".
