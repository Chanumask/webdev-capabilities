# Round 1: Basics and intent

Goal: understand **what** this is and **why** it exists. Two or three `AskUserQuestion` calls. Start with a short welcome that explains the process in three lines: several short rounds, more detail each time, a summary to approve at the end, then the site is built in one go and shown on localhost.

## Q1.1 Project and language
Ask: What is the project called, and in which language should the website be?
Why: slug and folder name, copy language, whether i18n is needed.
Type: single. The name is usually known from the chat; only ask when missing.
Options:
- German: all copy in German (Recommended when the user writes German)
- English: all copy in English
- German and English: two languages with a switch (more work; ask again in round 4)
Writes: BRIEF.identity.name, BRIEF.identity.languages
Follow-up: propose a slug in kebab-case ("meyer-architekten") and confirm it.

## Q1.2 Who is it for
Ask: Who is this website for?
Why: decides tone, legal needs (Impressum etc.) and whether real content exists.
Type: single
Options:
- A real company or person: real name and real content will be supplied, now or later
- A demo or prototype: fictional company, placeholder content clearly marked as examples
- A client project: we build for someone else; the user is an agency or freelancer
Writes: BRIEF.identity.kind
Follow-up: "demo" means fictional and placeholders everywhere. "Client project" means ask in round 4 about handover and repository ownership.

## Q1.3 Type of website
Ask: What kind of website is it, closest match?
Why: picks the page structure, the content model and which capabilities to offer.
Type: single
Options:
- Company or service site: presents a business and gets enquiries
- Listings or catalogue: many similar items people browse and filter (properties, jobs, cars)
- Portfolio or showcase: shows work or an experience; the design is the product
- Event, campaign or landing page: one goal, one page, focused or time-limited
Writes: BRIEF.type
Follow-up: "Other" covers shop, blog or magazine, community, booking. Checkout, booking and login are not part of a pure static build: say so and propose an integration in round 4. A **virtual room, multiplayer space or anything with a live server** (like a shared meeting room) is outside this catalog: say so honestly, offer the closest static version (a showcase or lobby with the visuals), write the gap to `brief/FRAMEWORK-FEEDBACK.md`, and do not promise an offline file ([0019](../../dev/docs/decisions/0019-delivery-routes.md)).

## Q1.4 Main goal
Ask: What is the most important thing the website should achieve?
Why: the whole page hierarchy and every call to action follow from this.
Type: single
Options:
- Get enquiries or contacts: forms, phone, appointments
- Present and impress: brand, trust, a memorable first impression
- Sell or list things: people find an item and take the next step
- Inform or support existing customers: service, documents, answers
Writes: BRIEF.intent.goal

## Q1.5 The one action
Ask: What should a visitor do after one minute on the site? Describe the single most wanted action.
Why: the primary call to action, placed in the first screen. It must be concrete ("request a viewing", "call", "book a demo").
Type: free text via Other, with suggestions as options: Send a message / Call or book a call / Search and open an item / Download something
Writes: BRIEF.intent.primaryAction

## Q1.6 What exists already
Ask: What do you already have that we should use?
Why: avoids invention and sets the asset needs.
Type: multi
Options:
- Logo and brand colours
- Texts (pages, descriptions)
- Photos or videos
- An existing website to take over or improve (ask for the address)
Writes: BRIEF.assets.have (missing items become clearly marked placeholders)
Follow-up: a URL means fetch it, summarise structure, tone and visual style, and ask what to keep.

## Round 1 output
Write the "Round 1" section of `brief/INTAKE.md` and fill BRIEF: identity, type, intent, assets. Recap in three lines and continue to round 2 unless the user stops.
