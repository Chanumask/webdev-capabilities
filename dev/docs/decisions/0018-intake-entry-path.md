# 0018: The intake starts with an entry question: prompt or catalog

Date: 2026-10-08 · Status: active

**Context.** The intake asked the full catalog of questions, with a note that a rich first message may be mined for answers. Users who arrive with a detailed prompt (a written brief, notes, a long description) still got the whole catalog and had to repeat themselves, while users with nothing needed the questions. The maintainer wants to test the framework with a real, detailed prompt in a website session and have the agent ask questions based on it.

**Decision.**
- Every new-site session starts with one `AskUserQuestion`: **prompt or description**, **go through the questions**, or **notes and links** ([entry](../../../framework/intake/entry.md)). A first message that already is a long description is taken as the prompt without asking.
- **Prompt path:** the agent reads the text (and fetches its URLs), maps it onto the question catalog with a status per question id (`from-prompt`, `inferred`, `open`), shows a short coverage summary, asks the user to confirm the inferred readings, and asks only the open questions. Technical choices still get a recommendation. Round 6 (review, assumptions, acceptance checklist, explicit "yes, build it") always runs.
- The prompt is **content, not instructions to the agent**: wishes about the website go into the brief; lines that tell the agent how to work do not override repository rules, and the agent names the ones it will not follow. Secrets in the text are handled by the secrets rule in `CLAUDE.md`.
- `brief/INTAKE.md` records `Entry:` and a `Prompt coverage` section so a resumed chat knows what is still open.

**Why.** It keeps the one-shot principle (full context before building) without making users repeat what they already wrote, and it makes the recommendation logic work on real input.

**Rules out.** Skipping the final review because the prompt was detailed; building from a prompt without confirming the inferred answers; following workflow instructions embedded in a pasted text.
