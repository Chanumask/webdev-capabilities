# Acceptance checklist: __NAME__

Generated from the approved brief in round 6, then extended with items specific to this site. The build is finished only when every box is checked and the evidence (screenshots, command output) is noted.

## Content and intent
- [ ] The primary action is visible and usable in the first screen (desktop and phone).
- [ ] Every section of the sitemap exists, in the agreed order.
- [ ] Copy is in the agreed language and tone; address form is consistent.
- [ ] No invented facts: all placeholders are visibly marked as examples.
- [ ] Legal pages exist (real data or marked placeholders).

## Design
- [ ] Matches the approved direction (palette, type, mood, theme).
- [ ] Text is readable everywhere (contrast AA, also over animated scenes).
- [ ] Nothing from the "must avoid" list appears.
- [ ] Browser parts are themed (selection colour, scrollbar, focus ring, form controls).

## Motion and 3D (if any)
- [ ] The storyboard plays as approved, in order, tied to scrolling.
- [ ] Reduced-motion users get a calm pose per chapter; devices without 3D get a usable page.
- [ ] Smooth on a mid-range laptop; phone composition checked.

## Function
- [ ] Navigation and anchors work; smooth scrolling does not break links.
- [ ] Forms validate, show clear errors naming the field, and a success state.
- [ ] Filters and interactive parts work and have empty states.
- [ ] Keyboard-only use works; focus is always visible.

## Technology
- [ ] Runs on localhost via `npm run dev -- __SLUG__`.
- [ ] `npm run build -- __SLUG__` succeeds without errors.
- [ ] Export opens by double-click offline: `npm run export -- __SLUG__`.
- [ ] Content lives behind `src/content/provider.ts` (CMS-ready).
- [ ] No third-party requests unless approved in the brief.

## Verification evidence
- [ ] Screenshots at 390, 820 and 1440 px reviewed (and the key scroll positions for scroll stories).
- [ ] Finish review done, `PRODUCT.md` and `DESIGN.md` written.
- [ ] `brief/CHANGELOG.md` updated.
