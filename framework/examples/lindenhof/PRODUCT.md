# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack
Astro 7 + Tailwind 4 + Three.js + GSAP ScrollTrigger + Lenis (chosen in setup; starter in `sites/_starter`). Headless CMS (Sanity or Storyblok) to be wired later; not decided.

## Users
- Property owners / landlords who want to hand over management and administration to a professional (confirmed by user as a primary audience).
- Existing tenants who need to reach the company, find contacts and documents (confirmed by user as a primary audience).
- The site's content is built around buying and renting flats and houses, so prospective renters and buyers are served by the listings content. The user did not select them as a primary audience in the interview; this tension is open.

## Product Purpose
Website for a property management and administration company. Presents available flats and houses for rent and sale, and the company's management services. This first build is also a capability test of the design and 3D tooling (Impeccable, Playwright CLI), centred on a scroll-driven 3D animation.

## Positioning
Not yet established. The company is fictional and has no confirmed differentiator. Do not invent one.

## Operating Context
Client is a property management / administration company (German-language market assumed from the confirmed German copy). Content will eventually be edited by non-technical staff via a CMS: listings, texts, images, contacts. The 3D scene and motion stay in code.

## Capabilities and Constraints
- Copy in German.
- Fictional placeholder company; listings and texts are clearly placeholder.
- Scroll-driven 3D animation is a hard requirement: animation progress is tied to scroll position.
- Must degrade for `prefers-reduced-motion` and no-WebGL; mobile must perform.
- Listings, contact/enquiry flow, CMS integration: not built yet; open decisions.

## Brand Commitments
None. Company name and logo are placeholders until the client supplies assets.

## Evidence on Hand
None. No real listings, photos, testimonials, statistics, prices or legal details exist. Do not fabricate testimonials, customer counts, awards or claims; sample listings must be visibly marked as examples.

## Product Principles
- Trust before spectacle: the 3D motion serves a property-management story, it does not replace clear content.
- Content stays editable: anything a client will change belongs in CMS slots, not in the scene code.
- Placeholder honesty: never present invented facts as real.
- Performance and accessibility are part of the design, including reduced motion.

## Accessibility & Inclusion
Respect `prefers-reduced-motion`; provide a usable non-WebGL fallback. No further specific standard stated.
