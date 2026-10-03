---
name: change-site
description: Change, refine or extend an existing website in sites/<slug>/. Use for feedback after a build ("less colourful", "change the text", "add a section", "switch to another CMS"), for continuing a site in a new chat, or whenever the user refers to a site that already exists.
---

# Change an existing site

## 1. Load context
Identify the site (`npm run list`; ask if ambiguous). Read, in this order: `sites/<slug>/brief/BRIEF.md`, `brief/CHANGELOG.md`, `PRODUCT.md`, `DESIGN.md`, `.impeccable/surfaces/*.md`. Start the site on localhost if it is not running: `npm run dev -- <slug>`.

## 2. Classify the request
See the table in `framework/WORKFLOW.md` (section "Change requests"): content, refine, redesign, new feature, tech change. If several, split them and handle in this order: tech, structure/feature, redesign/refine, content.

If feedback is vague ("it feels off"), ask at most one `AskUserQuestion` call to pin it down (what feels off: colour, density, motion, copy, something else; show contrasting options). Collect all feedback of the round before editing.

## 3. Update the brief first
If the request changes a decision, edit `brief/BRIEF.md` (mark `chosen`, note the date) before touching code. Redesign: write a new direction contract and keep the old version as `examples/<slug>-vN` only when it has reference value.

## 4. Apply
- Content: edit `src/content/` (or the CMS data), no design pass.
- Refine: use the scoped Impeccable commands, preserving the incumbent identity.
- Redesign: replace the visual world completely (do not polish the discarded look), re-run the build steps for the changed layers, regenerate `DESIGN.md`.
- New feature: build with the same standards as the original build.
Keep bounded verification: one batched screenshot round at 390/820/1440 px (and scroll positions for stories), fix, at most one confirming round, then `impeccable detect` once on changed UI. For significant changes spawn the finish reviewer.

## 5. Record and show
Append to `brief/CHANGELOG.md` (asked, decided, changed). Commit `change: <what>`. Tell the user what changed in plain words and how to look at it. If the user shares files, re-export: `npm run export -- <slug>`.
