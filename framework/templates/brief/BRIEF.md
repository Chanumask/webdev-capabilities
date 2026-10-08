---
site: __SLUG__
name: __NAME__
status: draft            # draft | approved | built | delivered
created: __DATE__
approved:                # date, set in round 6
launch: none             # none | decided | prepared | deployed | live
handover: none           # none | done
domain:                  # set by launch-prep
host:                    # cloudflare-pages | netlify | vercel | github-pages | own-hosting | wix-hosted
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
- Assets supplied (logo, colours, photos, video, 3D or CAD files), with paths in `assets/`:
- Third-party assets (every one listed with source and licence in `ASSETS.md`):
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
- Realism tier (T0 stylised in code, T1 lit stylised, T2 real-time models, T3 photographic frames) and scene elements:
- Mobile plan and reduced-motion fallback:
- Performance budget (frame time, page weight; single-file export under 25 MB):

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

## 17. Launch
- Domain: owned already / to be bought (name ideas, registrar preference):
- Hosting (recommended: Cloudflare Pages; with CMS auto-publish: git-based host plus deploy hook):
- Email on the domain (keep existing / new mailboxes / none):
- Account owner (must be the website owner):
- Legal data for Impressum and privacy text (owner provides):
- Handover: who maintains content, who handles technical changes, who pays for what:

## Delivery
- Local: `npm run dev -- __SLUG__`
- Export: `npm run export -- __SLUG__` (single offline HTML in `exports/__SLUG__/`)
