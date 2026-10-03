---
site: lindenhof
name: Lindenhof Hausverwaltung
status: built
created: 2026-10-03
approved: 2026-10-03
---

# Brief: Lindenhof Hausverwaltung (reference example)

> A filled-in brief reconstructed from the first project. It shows the level of detail the intake should reach. The project was built before the intake existed, so some answers are marked as inferred.

## 1. Identity
- Name: Lindenhof Hausverwaltung (fictional)
- Kind: demo / prototype for a property management and administration company
- Languages: German
- Tagline: "Wohnen, das gut verwaltet ist."

## 2. Type and intent
- Type: listings site with company services (rent, buy, manage)
- Main goal: present and impress, then get enquiries
- Primary action: search properties (rent / buy, place, rooms) in the first screen; secondary: damage report, owner enquiry
- Success looks like: a visitor finds a property or contacts the company within a minute; the client is impressed by the animation

## 3. Audience
| Audience | Situation | What they want to do | Device |
|---|---|---|---|
| Property owners | want to hand over management | request management, understand services | desktop + phone |
| Existing tenants | have a problem or need documents | report damage, find contacts | phone |
| Renters and buyers | looking for a home | browse and filter listings, enquire | phone + desktop |

## 4. Voice
- Tone: calm and professional (chosen), formal address ("Sie")
- Avoid: hype, invented numbers

## 5. Structure
- One long page. Sections: hero with search, five scroll chapters (construction phases), listings, owners, tenants (damage report), contact, footer

## 6. Content
- Copy source: drafted by the agent (marked demo)
- Dynamic content: listings (editors: office staff, non-technical)
- Placeholders: all listings and prices ("Beispiel"), phone numbers, address, legal pages

## 7. Media and assets
- Imagery: 3D scenes built in code; stills rendered from the same scene (no photos, no stock)

## 8. Style and design
- Direction (v2, user-pinned after seeing v1): restrained architectural visualisation at dusk
- Mood: calm, refined, cinematic
- Theme: dark scene sections, light content sections
- Colour: restrained neutrals (graphite, stone) plus one brass accent. v1 used saturated colour fields and was rejected as "too colourful"
- Typography: light geometric sans (Hanken Grotesk)
- Layout: spacious
- Imagery style: realistic renders
- Avoid: colourful backgrounds, flat illustrations next to the realistic 3D

## 9. Motion and 3D
- Signature animation (chosen by the user): the finished house is shown first; scrolling rewinds to the empty building site, then construction vehicles (excavator, tipper, concrete mixer, tower crane) build the house; scaffold and crane leave, a garden appears; the camera pulls back into a neighbourhood
- Realism: believable materials and light from procedural primitives
- Mobile: scene above, text below; reduced motion: one pose per chapter; no WebGL: flat chapters
- Performance: merged geometry, 2048 shadow map (1024 on phones), pixel ratio cap

## 10. Technology
| Decision | Choice | Status | Reason |
|---|---|---|---|
| Framework | Astro | recommended-accepted | content site, ships little JS |
| CMS | Wix Headless (later) | chosen | client finds Storyblok too complicated; content layer prepared |
| Animation / 3D | Three.js + GSAP + Lenis, code-built | recommended-accepted | no model files, controllable |
| Hosting | none yet; localhost + single-file export | chosen | review and sharing first |
| Forms | demo only | delegated | no backend yet |
| Analytics | none | delegated | privacy, no cookie banner |
| Tools | Impeccable, Playwright CLI | chosen | design quality, visual verification |

## 14. Decisions made on the user's behalf
| Topic | Decision | Reason |
|---|---|---|
| Fonts | Hanken Grotesk (light display) | geometric, premium, self-hosted |
| Listing images | rendered stills from the 3D kit | stylistic consistency |

## 15. Out of scope
Real listings, booking, login, real forms backend, real legal texts, deployment.

## 16. Lessons from this project (feed back into the framework)
- Show the first version; the user pins direction by reaction ("less colourful", "more realistic", "different animation"). The intake should ask mood, colour level and animation story **before** the first build to avoid this loop.
- Flat vector illustrations next to a realistic 3D world look like clip art; render stills from the 3D kit.
- Keep copy readable over any animated scene (scrim, shifted subject).
