---
name: connect-cms
description: Set up Wix (or another CMS) as the content editor of a website and link the owner's account, step by step. Use when the user says "set up Wix as CMS", "link my Wix account", "connect the CMS", "editors should change content themselves", or when the brief names Wix as CMS and `npm run status` offers it. The owner clicks, the agent guides and checks the connection; no key ever passes through the chat.
---

# Connect CMS (website mode)

Guide: [Wix setup, step by step](../../../framework/capabilities/cms-providers/wix/SETUP.md) (German menu names, pitfalls). Provider contract: [cms-providers](../../../framework/capabilities/cms-providers/README.md). Website mode applies; agent-led ([NEXT-STEPS](../../../framework/NEXT-STEPS.md)).

**Secrets rule.** Keys and the site ID go only into `sites/<slug>/.env`, entered by the user. Never ask for them in chat, never open or print `.env`. If a secret reaches you anyway, warn the user at once (kind and place, never the value), copy it nowhere, recommend revoking and replacing it ([CLAUDE.md](../../../CLAUDE.md)).

1. `npm run status -- <slug>`. Confirm which CMS the brief chose (technology table, section 11). Only Wix has a provider so far; for another CMS say so and follow [extending](../../../dev/docs/process/extending.md) in maintainer mode, or stay with `files`.
2. Ask with `AskUserQuestion` whether the user already has a Wix account and a site (options: yes; account but no site; nothing yet). The account and every plan must belong to the **owner** of the content, not to us.
3. Walk through `SETUP.md` one step per message, in the user's language, using the German menu names while they have a German dashboard. Order: site → CMS app → collection and items → site ID → API key (specific site, read data items only) → `.env`. The user clicks; you do not ask for screenshots of key screens (a screenshot of the permission list without the key is fine).
4. Collections and fields come from the brief (section 11). Give the user the exact collection ID and field names to create; keep names short and lower case.
5. When the user says `.env` is saved: `npm run cms:check -- <slug>`. Read the result to them in plain words and use the table in SETUP.md for errors. Do not retry blindly more than twice; ask what the screen shows.
6. When it passes: record the choice in the brief (CMS row: Wix, status done), the date in `brief/CHANGELOG.md`, and add Wix to the accounts list for the handover (`ACCOUNTS`). Then connect the content in the site (provider file in `src/content/`, see the Wix provider README) via `build-site` or `change-site`.
7. If the guide differed from the screen (renamed menu, missing option), write it in `brief/FRAMEWORK-FEEDBACK.md` with the German label you were told.
8. Offer the next step from `npm run status` (usually `change-site` or `launch-site`).
