# Round 4: Architecture and technology

Goal: decide the technical setup without confusing the user. **Every question has a recommended option**, chosen for this project from earlier answers. The user can always pick something else or write their own. Explain consequences in plain words.

Always true for every site built here (do not ask, but state it in the recap):
- It runs on **localhost** during development and review.
- A static site can be **exported as a single HTML file** (`npm run export -- <slug>`, up to 25 MB) that works offline, with all animations. Heavier sites and sites with a live server are shared and delivered differently: see Q4.12.
- It lives in `sites/<slug>/` in this repository.

## Q4.1 Framework
Ask: What should the website be built with?
Why: everything else depends on it.
Type: single
Options:
- Astro (Recommended): fast pages that need little code in the browser, great for content sites, works with every CMS, 3D and animation can be added where needed
- Next.js: better when the site is more like an application (logins, dashboards, personalised pages)
- Plain HTML, CSS and JavaScript: tiny and simple, no build tooling, limited for CMS and growth
Writes: BRIEF.tech.framework
Recommendation logic: Astro unless the brief contains logins, per-user content or heavy app logic.

## Q4.2 Content management (CMS)
Ask: How should texts and items be edited later?
Why: decides if the client can work without the developer.
Type: single. Base the recommendation on Q2.7 (what changes, by whom, how technical).
Options:
- No CMS, content in files (Recommended if nothing changes often): simplest, nothing to log into; changes go through Claude
- Wix Headless (Recommended if the client already uses Wix or wants the Wix dashboard): editors use the Wix dashboard they know; needs a Wix site with Headless enabled and an API key; publishing triggers a rebuild
- Sanity (Recommended for regularly edited items and news): clean form-style editor, generous free plan, very flexible; editors need a free account
- Storyblok or Decap/Tina: Storyblok edits directly on the page but is more complex and paid; Decap/Tina keep content in Git and need GitHub accounts
Writes: BRIEF.tech.cms (+ rationale)
Follow-up: ask for account status (does the client have it?). If the account does not exist yet, plan content as files first behind the content provider (`src/content/provider.ts`) so the CMS can be connected later without changing pages.
Note: the 3D scene and animation stay in code. Editors change content slots (texts, items, images, a few options), not layout or motion.

## Q4.3 Animation and 3D technology (only if motion is storytelling or 3D)
Ask: How should the 3D and animation be made?
Why: asset needs, performance, who can maintain it.
Type: single
Options:
- Rendered frames with Blender (Recommended when Q3.8b is photographic frames): photographic result, played by scrolling, small to medium download, works without 3D support
- Ready-made 3D models in real time, glTF (Recommended when Q3.8b is real-time models): the visitor can turn the object; needs model files (supplied or from free libraries) and a medium download
- Built in code with Three.js, GSAP and smooth scrolling (Recommended when Q3.8b is lit or stylised 3D): no model files, small download, fully controllable, consistent look
- Spline or similar visual 3D editor embed: quick for simple objects, less control, external dependency
- CSS and video only: lightest, no real 3D
Writes: BRIEF.tech.motion

## Q4.4 Hosting
Ask: Where should the finished website be served from, once you are happy with it?
Why: deployment setup and whether editors can publish by themselves. Hosting is independent of the CMS and the domain.
Type: single
Options:
- Cloudflare Pages (Recommended): free, fast worldwide, free HTTPS, easy rollback; with a CMS that should publish automatically it is connected through a git repository and a deploy hook
- Netlify: similar, with built-in forms
- The owner's existing web space (IONOS, Strato and similar): nothing new to pay for; files are uploaded; content changes then go through a developer
- Not decided yet, preview and export only: fine for now; the launch is guided later when you are happy
Writes: BRIEF.tech.hosting
Note: the agent never creates accounts or deploys without an explicit yes; see `framework/launch/`.

## Q4.5 Forms
Ask: What should happen when someone sends a form?
Why: backend needs and privacy.
Type: single
Options:
- Demo only for now (Recommended for prototypes): the form validates and shows a message; nothing is sent
- Send as email through a form service: Formspree, Web3Forms or Resend; simple and reliable
- Store in the CMS or send to the client's tool: needs account and mapping
Writes: BRIEF.tech.forms
Follow-up: recipient address, auto-reply, spam protection (honeypot by default), consent text.

## Q4.6 Visitor statistics
Ask: Do you want to measure visits?
Why: privacy and cookie banner.
Type: single
Options:
- No tracking (Recommended): simplest and fully compliant, no cookie banner
- Privacy-friendly statistics: Plausible or Umami; no cookies, small cost or self-hosted
- Google Analytics: needs a consent banner
Writes: BRIEF.tech.analytics

## Q4.7 Repository and handover
Ask: Who should own the code in the end?
Why: GitHub setup and responsibility.
Type: single
Options:
- It stays in this repository for now (Recommended)
- A separate private GitHub repository for this site (needed for automatic deployment)
- The client receives the exported site and a handover package
Writes: BRIEF.tech.repo

## Q4.8 Quality tools
Ask: Which helpers should the build use?
Why: design quality and verification.
Type: multi
Options:
- Impeccable design skill (Recommended): design vocabulary, audits and polish passes, already installed
- Playwright browser checks (Recommended): the agent looks at the result in a real browser at phone, tablet and desktop widths, and tests forms
- Taste skill (optional): an alternative style guide; try it when Impeccable's result feels too generic
Writes: BRIEF.tech.tools

## Q4.10 Domain
Ask: Do you already have a domain name (the web address, like meyer-architekten.de)?
Why: decides the launch path. Many people have never bought one; the agent explains and guides later (framework/launch/domains-explained.md).
Type: single
Options:
- Yes, I own one: tell me the name and where it is registered
- No, I need one (Recommended to decide later): I will explain how it works and guide you when you are happy with the site
- Use the free preview address for now: the site runs on an address like my-site.pages.dev
Writes: BRIEF.launch (domain)

## Q4.11 Email on the domain
Ask: Do you use or need email addresses at the domain (info@...)?
Why: changing DNS or name servers can break existing email, so this must be known before any domain work.
Type: single
Options:
- Yes, email already works at this domain: I will not touch it without copying its settings first
- I need new mailboxes: I will explain the options (registrar, hosting package, Google or Microsoft)
- No email needed
Writes: BRIEF.launch (email)

## Q4.12 Showing it to others before launch
Ask: How do you want to show the result to other people before it goes live?
Why: decides the delivery route. One file only works up to 25 MB and without a server; photographic frames, models and live rooms are heavier ([0019](../../dev/docs/decisions/0019-delivery-routes.md)). Ask it when the realism tier is T2 or T3, when the weight estimate passes 15 MB, or when the site needs a server; otherwise record "one file" without asking.
Type: single
Options:
- One file to send (Recommended when the estimate is under 15 MB): opens by double-click, offline, all animations; the agent checks the size and offers a lighter copy if needed
- A preview link (Recommended for heavy sites): free hosting on your own account (for example Cloudflare Pages); I guide you through it and nothing is created without your yes
- Only on this computer for now: shown on localhost, shared later at launch
Follow-up: for a site with a live server (virtual room, logins) only the preview link or the launch applies; say so.
Writes: BRIEF.tech.preview

## Q4.9 Languages (only if two or more)
Ask: How should the language switch work?
Type: single. Options: Separate address per language, e.g. /de and /en (Recommended) / Automatic by browser language / Content switch on one page.
Writes: BRIEF.tech.i18n

## Defaults you set without asking (state them in the recap)
SEO basics (titles, descriptions, social preview, sitemap), semantic HTML, self-hosted fonts, no third-party requests, image optimisation, reduced-motion fallbacks, keyboard accessibility, responsive from 360 px to 1920 px.

## Round 4 output
Update INTAKE.md and BRIEF (tech). Mark each decision `chosen`, `recommended-accepted` or `delegated`. Recap, then go to round 5.
