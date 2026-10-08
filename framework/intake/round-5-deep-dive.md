# Round 5: Deep dive (adaptive modules)

Goal: close every gap that would otherwise cause a correction round. Do **not** run all modules. Select modules from the answers so far, then ask only what is still unknown. Each module is 1 or 2 `AskUserQuestion` calls. Where a module asks for a proposal (storyboard, sitemap, content model), **write the proposal first and ask the user to approve or change it**, which is faster than asking from scratch.

| Module | Run when |
|---|---|
| 5A Listings or catalogue data | type is listings, or items are edited regularly |
| 5B Company or service content | type is company site |
| 5C Portfolio and projects | type is portfolio |
| 5D Event or campaign | type is landing page or event |
| 5E Scroll story / 3D storyboard | motion is storytelling or 3D |
| 5F CMS content model | a CMS other than "files" was chosen |
| 5G Forms | any form exists |
| 5H SEO and performance | always (short) |
| 5I Brand gaps | name, logo or tagline missing |
| 5J Legal and privacy data | German or EU site with forms |
| 5K Handover | client project |
| 5L Launch details | always (short) |

## 5A Listings or catalogue data
Propose a data model, then ask for corrections:
- Item fields (title, address or location, kind, size, price and price type, availability, status, 3 to 8 images, description, features, contact person).
- Filters visitors need (mode, place, rooms, price range, kind).
- Sorting and the empty state.
- Detail pages per item, or rows on one page that expand?
- Per-item call to action (request viewing / call / favourite).
- Sample data: how many items, real or marked examples (default: 8 examples, marked).
Options example for detail: "Rows on one page, request button per row (Recommended for a one-page site)" / "Own detail page per item" / "Expandable cards".

## 5B Company or service content
- Services: names, one sentence each, order of importance.
- Proof: real references, numbers, certifications. Only real ones are used. If none: omit the section instead of faking it.
- Team: names and roles, or none.
- Call to action text and where it appears (header, first screen, end of page).
- Contact data: address, phone, email, opening hours (placeholders if unknown).

## 5C Portfolio and projects
- Project fields (title, year, role, client, summary, images, link).
- Gallery behaviour (grid, full-screen viewer, scroll-linked).
- Project pages or overlays.
- Categories and filters.

## 5D Event or campaign
- Date, place, programme, speakers or offer.
- Registration or ticket link or form.
- Countdown, map, FAQ, partners.

## 5E Scroll story and 3D storyboard
Write a storyboard from Q3.7/3.8 and let the user approve it. Format (6 to 9 rows):

| Scroll position | What is on screen | Camera and motion | Headline and text | Call to action |
|---|---|---|---|---|

Cover: the first screen (what is visible before any scrolling, and its text), each chapter (what changes visually, which content it introduces), the pull-back or finale, and the hand-over to normal sections. Also decide and write down:
- Start state and end state; whether the story plays forward or starts with the finished result and rewinds.
- Scene elements (buildings, machines, characters, props) and the **realism level**; list what will be modelled in code and what is a placeholder.
- Light and atmosphere (time of day, sun, shadows).
- Where the text sits and how it stays readable (scrim, quiet side).
- Mobile composition (scene above, text below) and the reduced-motion / no-3D fallback (one still pose per chapter).
- Performance budget (target 60 fps on a mid-range laptop, smooth on recent phones; scenes built from merged geometry).
- **Realism tier (T0 to T3) and weight:** for T3 list the shots (camera start and end per chapter), 60 frames per sequence as default, HD 1920 px for desktop and a separate portrait set for phones, 4K only as an optional hosted set; the single-file export must stay under 25 MB (warning at 15 MB). List every third-party model, texture and HDRI with licence in `ASSETS.md`.
Ask: Approve the storyboard / Change chapters / Simplify. Offer to show a quick rough preview only after the brief is locked.

## 5F CMS content model
For the chosen CMS (or files), propose collections and fields from the content that changes (5A to 5D), and state who edits what:
- Collections (e.g. Items, Team, News, Texts) with fields, types, required/optional, image rules.
- Editor roles and the publish flow (for static sites: publishing triggers a rebuild).
- Preview: can editors see changes before publishing?
- Seed data to enter first.
- What is deliberately **not** editable (layout, animation).
For Wix Headless also ask: Does the Wix site exist? Is Headless enabled? Who creates the API key?

## 5G Forms
- Fields per form and which are required.
- Recipient, subject, auto-reply (yes/no), success message.
- Spam protection: honeypot (default) or CAPTCHA (heavier).
- Privacy text and consent checkbox wording.

## 5H SEO and performance
- Main search terms and places (e.g. "Hausverwaltung Hamburg").
- Social preview image: generated from the hero if none.
- Targets: first content visible in under 2.5 s on a mid-range phone; total page weight budget (default 2 MB, 3D pages may exceed with a loader strategy).

## 5I Brand gaps
- Name spelling, short tagline, whether a text-only logo is acceptable (Recommended when no logo exists: a refined wordmark).
- Favicon and social image.

## 5J Legal and privacy data
- Imprint data (company name, address, register, VAT id, responsible person) or placeholders marked.
- Privacy policy text source (own text, generator, lawyer).
- Cookie consent not needed when there is no tracking and no third-party content.

## 5K Handover
- Who maintains the site afterwards; how change requests reach the agent; training notes for editors; domain and email responsibilities.

## 5L Launch details
- Name ideas for the domain (3 options, with a fallback) and the country/audience for the extension (.de, .com).
- Who is the legal owner of the website (company or person) and which role email can be used for all accounts?
- Legal data available now (company name, address, register, VAT id, responsible person) or "owner provides later".
- Who pays for domain, hosting extras, email, CMS plan, and who is the contact for renewals?
- Who will change content after launch: the owner (needs a CMS) or a helper? How fast should changes appear?

## Round 5 output
Update INTAKE.md and BRIEF fully (storyboard, content model, data). All proposals marked `approved`. Recap and go to round 6.
