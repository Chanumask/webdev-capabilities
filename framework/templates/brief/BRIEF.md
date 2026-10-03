---
site: __SLUG__
name: __NAME__
status: draft            # draft | approved | built | delivered
created: __DATE__
approved:                # date, set in round 6
---

# Brief: __NAME__

> Single source of truth for this website. Written during the intake (`framework/intake/`), read by the build.
> Mark every value as **chosen** (user said it), **recommended-accepted** (user accepted a recommendation) or **delegated** (user said "you decide"; add the reason).

## 1. Identity
- Name:
- Kind (real / demo / client project):
- Languages:
- Tagline (if any):

## 2. Type and intent
- Type:
- Main goal:
- Primary action (one sentence, shown in the first screen):
- Success looks like:

## 3. Audience
| Audience | Situation | What they want to do | Device |
|---|---|---|---|

## 4. Voice
- Tone:
- Address form (Sie / du) or point of view:
- Words to use / avoid:

## 5. Structure
- Kind (one page / few pages / many):
- Sitemap and sections in order, each with its purpose:

## 6. Content
- Copy source (user / drafted / existing site / placeholder):
- Dynamic content (what changes, who edits, how often):
- Editor technical level:
- Placeholders that must stay clearly marked:
- Legal pages and data (Impressum, Datenschutz):

## 7. Media and assets
- Imagery plan:
- Assets supplied (logo, colours, photos), with paths in `assets/`:
- Assets still missing:

## 8. Style and design
- Chosen direction (name + idea):
- Mood words:
- Theme (light / dark / mixed) and why:
- Colour strategy and palette (names + hex when known):
- Typography feel and chosen fonts:
- Layout character:
- Imagery style:
- References liked / disliked (with what to take from each):
- Must avoid:
- Accessibility and devices:

## 9. Motion and 3D
- Motion level:
- Signature animation: subject, story, start state, end state:
- Storyboard (table from round 5):
- Realism level and scene elements:
- Mobile plan and reduced-motion fallback:
- Performance budget:

## 10. Technology
| Decision | Choice | Status | Reason |
|---|---|---|---|
| Framework | | | |
| CMS | | | |
| Animation / 3D | | | |
| Hosting | | | |
| Forms | | | |
| Analytics | | | |
| Repository / handover | | | |
| Tools (design skills, browser checks) | | | |
| Languages / i18n | | | |

## 11. CMS content model (if any)
Collections, fields, roles, publish flow, seed data:

## 12. Forms
Fields, recipients, spam protection, consent text:

## 13. SEO and performance
Terms, places, targets:

## 14. Decisions made on the user's behalf
| Topic | Decision | Reason |
|---|---|---|

## 15. Out of scope
-

## 16. Risks and open questions
-

## Delivery
- Local: `npm run dev -- __SLUG__`
- Export: `npm run export -- __SLUG__` (single offline HTML in `exports/__SLUG__/`)
