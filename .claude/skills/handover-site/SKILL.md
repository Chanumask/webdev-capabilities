---
name: handover-site
description: Hand a live website over to its owner with a complete package and walkthrough. Use after the site is online, or when the user asks for a handover, "Übergabe", documentation for the client, an accounts overview, or how the owner will maintain the site. Creates the handover package, checks ownership of every account, and explains content editing, costs and support in plain language.
---

# Handover site (website mode)

Guide: [handover](../../../framework/launch/handover.md). Templates: `framework/templates/launch/`. Website mode applies; agent-led ([NEXT-STEPS](../../../framework/NEXT-STEPS.md)).

1. `npm run status -- <slug>`; confirm `launch: live`. If not, go back to `launch-site`.
2. Run `npm run handover -- <slug>`; open the generated files and fill every blank that matters with the user (contacts, registrar and DNS names, CMS address, renewal dates, real costs).
3. Check that no password, key or recovery code is in any file. Never ask for them.
4. Ownership check with the user: every account is in the owner's name, two-factor on, recovery codes with the owner, helpers removed or named.
5. Walk the owner through (in plain language, the user may relay it): editing content, how changes go live, costs and renewals, what to do when something breaks, who to call.
6. Repository: a remote repository only if the owner creates it and the user says yes; otherwise `site-source.zip` is the backup.
7. Record in `brief/CHANGELOG.md`, set the brief `status: delivered`, commit in the site repository.
8. Offer the next step: `wrap-up` (session report and framework feedback), or `change-site` for new wishes.
