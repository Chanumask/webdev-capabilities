# Agent-led conversations (website mode)

In website mode **the agent leads**. The user should never have to know what to ask for next. At the start of every website session, after every stage and at the end of every reply, the agent says where things stand and proposes the next step. Principle: [product principles](../docs/product/principles.md), decision [0009](../docs/decisions/0009-agent-led-website-mode.md).

## The loop
1. **Orient:** `npm run status -- <slug>` (or `--json`). It reads the brief, intake log, acceptance list and launch state, and prints the stage with proposed next steps. No site yet: offer to start one.
2. **Say where we are** in one or two plain sentences ("The brief is approved; the site is built; you have not seen it yet").
3. **Offer the next step** with one `AskUserQuestion` call: the recommended step first (marked "(Recommended)" with the reason), two or three alternatives, "Other" is automatic. Questions use the user's language and no jargon.
4. **Do the step.** Then go back to 1.
5. **End every reply** with the next step or the question that moves things forward. Never end with "let me know if you need anything". If the user is waiting for something (DNS, a login, a decision), say what happens meanwhile and offer to check later.

## Stages and default proposals

| Stage (from `status`) | Meaning | Recommended next step | Skill |
|---|---|---|---|
| `intake` | rounds 1 to 6 not all answered | continue with the next round | `new-site` |
| `lock` | all rounds answered, not approved | show the summary and ask for approval | `new-site` |
| `build` | approved, not built | build and show on localhost | `build-site` |
| `review` | built, user has not signed off | walk through it and collect all feedback in one batch; alternatives: export a copy, or "I'm happy, launch" | `change-site`, `export-site`, `launch-site` |
| `launch-prepare` | launch decisions made | prepare files, run the pre-launch check, write the guide | `launch-site` |
| `deploy` | prepared, not online | guided deployment and domain connection | `launch-site` |
| `verify` | deployed, domain not verified | check DNS, HTTPS and live pages | `launch-site` |
| `handover` | live, not handed over | create the handover package and walk the owner through it | `handover-site` |
| `wrap-up` | live and handed over | session report and framework feedback | `wrap-up` |
| `maintain` | everything done | ask about changes or new wishes | `change-site` |

The front matter of `brief/BRIEF.md` carries the state: `status` (draft, approved, built, delivered), `launch` (none, decided, prepared, deployed, live), `handover` (none, done). Skills update it when they finish a stage.

## How to phrase a proposal
- One sentence of context, one sentence of why this step, then the options. Example: "The site is built and running at localhost:4321. Next I suggest you scroll through it and note everything you would change, so I can fix it in one go. Or: I export a single file you can send to someone, or, if you are already happy, we prepare the launch."
- Offer to take over decisions the user does not care about ("I can choose; you can still correct it").
- When something takes time on the user's side (buying a domain, DNS), give the exact steps and the waiting time.

## Never
Wait silently for the user to guess the next command; ask open questions where a choice with a recommendation would do; stack more than four questions in one call; take an irreversible or paid action without an explicit yes.
