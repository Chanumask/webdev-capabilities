# Capability: listings with filters

Rows (or cards) of similar items with a mode switch, text filter, numeric filter, live count, empty state and per-item enquiry. Reference: the listings section of `framework/examples/lindenhof` (`src/pages/index.astro` markup and styles, `src/scripts/ui.ts` logic, `src/content/site.ts` data).

## Use when
Real estate, vehicles, jobs, courses, products without checkout.

## Needs
A typed item list from the content provider (`getListings()`), a small script, and rendered thumbnails or real images.

## Integration
1. Define the `Listing` type in `src/content/site.ts` (fields from round 5A) and a `thumb` or `images` field.
2. Render rows server-side in the page with `data-*` attributes for each filterable value (`data-mode`, `data-city`, `data-rooms`).
3. In `ui.ts`: read the filter form with `FormData`, toggle `row.hidden`, update the live count (`role="status" aria-live="polite"`), show the empty state with a reset button.
4. A search form elsewhere (hero) sets the same filters and scrolls to the list using Lenis if present (`window.__lenis.scrollTo`) else native scroll.
5. Per-item enquiry link carries the item into the contact form (`data-enquiry`) and preselects the topic.

## Design notes
Hover inverts the row (dark fill, light text) rather than adding colour; house-number plate for German addresses; tabular numerals for prices; price type stated ("Kaltmiete / Monat"); every demo value labelled "Beispiel".

## Pitfalls
- Placeholder data must be visibly marked.
- Images must be consistent in style (render stills from the same 3D kit, not clip art next to a render).
- Filters are client-side: fine for tens of items; use a CMS query or pagination for hundreds.

## Verification
Filter combinations, empty state, reset, keyboard operation, count announcement, mobile layout (stack to one column below 560 px).
