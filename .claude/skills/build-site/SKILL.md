---
name: build-site
description: Build a website from an approved brief in sites/<slug>/brief/BRIEF.md. Use after the new-site intake is approved, or when asked to "build", "generate" or "create the site" for an existing brief. Produces the site in one pass, verifies it in a browser on localhost, runs the design review and documents it.
---

# Build site (one pass from an approved brief)

Input: `sites/<slug>/brief/BRIEF.md` with `status: approved`. If the status is not approved, go back to `new-site` round 6. Do not ask the user new questions except genuine blockers (a missing credential, a contradiction in the brief).

Website mode ([modes](../../../dev/docs/process/modes.md)): write only inside `sites/<slug>` (its own git repository, commit milestones there) and `exports/`; never edit the framework. Framework gaps go to `brief/FRAMEWORK-FEEDBACK.md`.

## 0. Read
`framework/WORKFLOW.md` (stage 3 and 4), `framework/CONVENTIONS.md`, the brief, `brief/ACCEPTANCE.md`, and the relevant `framework/capabilities/*/README.md`. Look at `framework/examples/lindenhof` for the expected level of finish (3D scroll story, realism, copy tone, forms, listings).

## 1. Design context (Impeccable)
Work inside `sites/<slug>` as the project root.
- Write `PRODUCT.md` from the brief (keep the `impeccable:product-schema` line). Do not re-interview.
- Direction contract: the brief's chosen direction is pinned. Write the six blocks (THESIS, OWN-WORLD, STORY, FIRST VIEWPORT, FORM, FINISH) with `.claude/skills/impeccable/scripts/impeccable surface-brief write <target> <file>` (run from `sites/<slug>`; read the `impeccable` skill for the exact flow).
- Read `.claude/skills/impeccable/reference/craft-floor.md` before editing UI.

## 2. Build in this order (commit after each: `build: <step>`)
1. content layer (`src/content/site.ts`, `provider.ts`, types, marked placeholders)
2. fonts, tokens, base styles (`@fontsource` self-hosted, CSS variables, focus/selection/scrollbar, reduced motion)
3. structure and copy, all sections, navigation, forms, filters
4. motion and 3D from the approved storyboard (start from `framework/capabilities/3d-scroll-story/`)
5. responsive and accessibility (360 to 1920 px, contrast, keyboard, calm fallbacks)

Standards: no invented facts, no third-party requests, content only via the provider, one authored motion moment, text readable over scenes (scrim or quiet area), mobile composition designed (not just shrunk).

## 3. Verify (bounded)
- `npm run dev -- <slug>` (from the repository root), open with `playwright-cli`.
- One batched inspection round: 390, 820 and 1440 px, plus key scroll positions for scroll stories; read console errors. Fix everything seen in one batch. At most one confirming round.
- `impeccable detect --json` once on the changed UI.

## 4. Review and document
- Spawn `impeccable-finish-reviewer` fresh (inputs: request, brief, direction contract, screenshots, detector output, craft-floor path). Apply the fix batch, recapture, send the same reviewer a verdict pass.
- Spawn `impeccable-documenter` to write `DESIGN.md` and `.impeccable/design.json`.
- Tick `brief/ACCEPTANCE.md`, add a `CHANGELOG.md` entry, set the brief `status: built`.
- Export check: `npm run export -- <slug>`, open the file from `file://` in Playwright, no console errors, animation plays.
- Commit `build: <slug> first version`. Do not push.

## 5. Hand over to the user
Start the dev server, give the localhost address, say in two sentences what to look at (and how to scroll through animations), mention the export file path, and ask for feedback in one batch. Switch to the `change-site` skill for feedback.

## Next step
Agent-led ([NEXT-STEPS](../../../framework/NEXT-STEPS.md)): when this skill finishes, run `npm run status -- <slug>`, say where the site stands and offer the next step with `AskUserQuestion` (recommended first). Never end with an open "let me know".
