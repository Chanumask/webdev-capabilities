# Workflow: from idea to delivered website

One repository, many websites. Claude Code (the agent in this repository) runs the whole process; the user answers questions, looks at the result on localhost and sends feedback in plain language.

```
 1 Intake  ->  2 Lock  ->  3 Design context  ->  4 Build  ->  5 Review  ->  6 Export / deliver
   (rounds)    (approve)    (Impeccable)         (one pass)    (localhost)    (single HTML, deploy)
                                                                   ^______ change requests ______|
```

Skills that run these stages: `/new-site` (stages 1 and 2), `/build-site` (3 and 4), `/change-site` (5), `/export-site` (6), `/launch-site` (7), `/handover-site` (8), `/wrap-up` (9). The user does not need to know the names; saying "I want a new website" is enough (see `CLAUDE.md`).

## The agent leads
In website mode the agent drives: at the start of each session and after each stage it runs `npm run status -- <slug>`, says where things stand, and proposes the next step with `AskUserQuestion` (recommended option first). See [NEXT-STEPS](NEXT-STEPS.md).

## Stage 1: Intake
- Create the site folder first so answers can be saved: `npm run new-site -- <slug> "<Name>"`.
- Run rounds 1 to 6 from `framework/intake/`, each as one or more `AskUserQuestion` calls, with a recap before each round. Save raw answers to `sites/<slug>/brief/INTAKE.md` and structured results to `brief/BRIEF.md` after every round.
- References the user mentions (URLs, existing site) are fetched and summarised into the brief.
- Output: complete `BRIEF.md`, draft `ACCEPTANCE.md`.

## Stage 2: Lock
- Round 6 summary, assumptions, placeholders, out-of-scope, acceptance list, explicit approval.
- On approval: `status: approved` in the brief, commit `brief: approved <slug>`.

## Stage 3: Design context
Use the Impeccable skill (installed in `.claude/skills/impeccable`) with the brief as the source of truth. Do not interview the user again.
1. Write `sites/<slug>/PRODUCT.md` from the brief (users, purpose, positioning, constraints, brand commitments, evidence on hand, principles, accessibility). Keep Impeccable's schema line. The site folder is the Impeccable project root.
2. Direction: the brief's chosen direction is **pinned**, so no roll is needed. If the direction was left open, run Impeccable's direction roll and choose according to the user's earlier picks.
3. Write the direction contract with `impeccable surface-brief write` (THESIS, OWN-WORLD, STORY, FIRST VIEWPORT, FORM, FINISH) into `sites/<slug>/.impeccable/surfaces/`.
4. Read `.claude/skills/impeccable/reference/craft-floor.md` before touching any UI.

## Stage 4: Build (one pass)
Work in this order; commit after each step (`build: <step>`).
1. **Content layer**: `src/content/site.ts` and `provider.ts` filled from the brief (placeholders marked). Define types for every dynamic collection.
2. **Fonts, tokens, base styles**: self-hosted fonts via `@fontsource` packages, colour and type tokens in `src/styles/global.css`, focus, selection, scrollbars, reduced motion.
3. **Structure and copy**: all sections in order with the real or drafted copy, navigation, forms, filters (see `framework/capabilities/` for reusable patterns).
4. **Motion and 3D**: from the approved storyboard. Reuse `framework/capabilities/3d-scroll-story/`. Keep scene state separate from layout, keep a calm fallback.
5. **Responsive and accessibility**: phone first, tablet, desktop; contrast; keyboard; reduced-motion pose per chapter; no-WebGL fallback.
6. **Verify (bounded)**: `npm run dev -- <slug>`; `playwright-cli` screenshots at 390, 820, 1440 px (and key scroll positions for scroll stories). One batched inspection round, fix everything in one batch, at most one confirming round. Watch the console for errors.
7. **Detect and review**: Impeccable `detect` once on the changed UI, then spawn `impeccable-finish-reviewer` with the contract, screenshots and brief. Apply the fix batch, recapture, send the same reviewer a verdict pass.
8. **Document**: spawn `impeccable-documenter` to write `DESIGN.md` and `.impeccable/design.json`. Tick `ACCEPTANCE.md`, update `CHANGELOG.md`, set brief `status: built`.
9. Commit `build: <slug> first version`.

## Stage 5: Review with the user
- Start the site (`npm run dev -- <slug>`) and give the localhost address. Describe in two sentences what to look at, including how to scroll through any animation.
- Collect feedback in one batch. Do not fix piecemeal while the user is still looking.
- Handle it with the change workflow below.

## Stage 7: Launch
When the user is happy, the `launch-site` skill takes over ([launch playbook](launch/launch-playbook.md)): decide (domain, hosting, email, ownership), prepare (`launch-prep`, `launch-check`, `cms:check`), deploy, connect the domain, verify (`dns-check`). The user does account, payment and domain steps; the agent explains domains and hosting from scratch, guides each click and verifies. Never without the user's explicit yes per action.

## Stage 8: Handover
The `handover-site` skill creates the handover package (`npm run handover`), checks account ownership, and walks the owner through editing, costs and support ([handover](launch/handover.md)).

## Stage 9: Wrap up
When the user is done (or says "wrap up"), run the `wrap-up` skill: it writes `brief/SESSION-REPORT-<date>.md`, summarises key issues and feedback, proposes framework improvements by target (question catalog, agent instructions, capabilities and tools, user guidance) and, if the user agrees, creates an anonymised file in `exports/feedback/` that they can send to the maintainer ([feedback loop](../dev/docs/process/feedback-loop.md)).

## Change requests
Classify first, then act. Always record in `brief/CHANGELOG.md` (asked, decided, changed).

| Kind | Examples | Handling |
|---|---|---|
| Content | text, numbers, images, listings | edit `src/content/` or the CMS data; no design pass |
| Refine | spacing, one colour, button style | scoped Impeccable command (`polish`, `typeset`, `layout`, `colorize`, `animate`); preserves the identity |
| Redesign | "less colourful", "different feel" | new direction contract; archive the previous version as `framework/examples/<slug>-vN` if worth keeping; replace `DESIGN.md` |
| New feature | new section, filter, form | brief update first, then build the feature with the same standards |
| Tech change | switch CMS, add language | update the brief's technology table, then implement behind the provider layer |

Rules: update `BRIEF.md` first when a change alters a decision. After changes, re-run the verification steps relevant to the change, then re-export if the user shares files.

## Stage 6: Export and deliver
- `npm run export -- <slug>` creates `exports/<slug>/index.html`: one file with scripts, styles, fonts and images inlined, working offline with all animations (double-click to open). Add `-- --zip` for a zip, `-- --light` for a smaller copy. It warns above 15 MB and fails above 25 MB ([0014](../dev/docs/decisions/0014-export-budgets-and-variants.md)); check `npm run weight -- <slug>` early on heavy sites. A heavier static site is shared by a hosted preview link, a site with a live server is delivered by hosting ([0019](../dev/docs/decisions/0019-delivery-routes.md)); there is no folder export, because `file://` blocks models, workers and WASM.
- Test the export from `file://` in Playwright before handing it over (no console errors, animation plays).
- Deployment (when decided in the brief): create a private GitHub repository for the site, connect Cloudflare Pages or Netlify, set the CMS rebuild hook, connect the domain. Never push or publish without the user's explicit yes.
- Handover notes in `sites/<slug>/README.md`: how to run, export, edit content, who to ask.

## Git rules (website mode)
- Each site is its own git repository inside `sites/<slug>`; commit milestones there (`brief:`, `build:`, `change:`). One logical step per commit.
- Never commit `node_modules`, `dist`, `.env`, exports, review screenshots.
- Website sessions never create branches, commits or changes in the framework repository.
- Do not push, publish, add remotes or delete anything outward-facing without explicit approval.

## Feedback to the framework
When a website session finds something the framework should do better (a missing question, a capability that would have saved time, a tool bug), it appends one line to `sites/<slug>/brief/FRAMEWORK-FEEDBACK.md` and tells the user at the end. A later maintainer session reads these files and turns them into backlog items or branches.

## Quality bar (every site)
Real content or marked placeholders, no invented claims, contrast AA, keyboard focus visible, reduced motion respected, no third-party requests by default, responsive 360 to 1920 px, console clean, export works from `file://`.
