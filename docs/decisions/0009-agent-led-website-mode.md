# 0009: Website mode is agent-led

Date: 2026-10-03 · Status: active

**Context.** Users of website mode are not technical and do not know the process: what comes after the build, what a domain is, what to ask next. A conversation that waits for the user to give direction stalls or skips steps (launch, handover, wrap-up).

**Decision.**
- The agent leads every website session. At session start, after each stage and at the end of every reply it states where the site stands and proposes the next step, offering options with `AskUserQuestion` (recommended first, reason given).
- `npm run status -- <slug>` (`tools/status.mjs`) derives the stage from the brief front matter (`status`, `launch`, `handover`), the intake log, the acceptance list and exports, and proposes next steps. `framework/NEXT-STEPS.md` defines stages, default proposals and phrasing.
- Skills update the front matter when a stage finishes and end with the status-driven proposal. A reply never ends with an open "let me know".
- The user may always steer elsewhere; the agent follows and then returns to the loop.

**Why.** It removes the burden of knowing the process from the user, makes launch and handover part of the normal flow, and keeps sessions resumable from the brief alone.

**Rules out.** Waiting for instructions; asking open questions where a recommended choice would do; hiding later stages until the user asks.
