---
name: launch-site
description: Take a finished website online on a real domain, guided step by step. Use when the user is happy with a site and wants to publish, deploy, go live, "put it online", connect or buy a domain, choose hosting, or asks how domains and hosting work. Also use when the status of a site is launch-prepare, deploy or verify. Explains domains and hosting from scratch, prepares everything that needs no account, and walks the user through the clicks.
---

# Launch site (website mode)

Playbook: [launch playbook](../../../framework/launch/launch-playbook.md). Background to explain from: [domains explained](../../../framework/launch/domains-explained.md), [hosting options](../../../framework/launch/hosting-options.md). Principles: agent-led ([NEXT-STEPS](../../../framework/NEXT-STEPS.md)), website mode (write only in `sites/<slug>` and `exports/`).

## Start
Run `npm run status -- <slug>` and say where the site stands. Assume the user has **never bought a domain**: explain the five separate things (domain, registrar, DNS, hosting, CMS) in a few plain sentences before asking anything, and say that the CMS, the hosting and the domain are independent (Wix as CMS does not mean Wix hosts the site or the domain).

## Run the playbook
Phases A to F in the playbook: decide (one `AskUserQuestion` round with recommendations), prepare (`npm run launch-prep`, `npm run launch-check`, `npm run cms:check` when a CMS is used), deploy, domain, verify, hand over. Update the brief front matter (`launch: decided | prepared | deployed | live`) and `launch/LAUNCH.md` as steps finish. Commit milestones in the site repository.

## Hard rules
- **Never** create accounts, buy anything, change DNS, deploy, create or push repositories without the user's explicit yes for that action. The user does account, payment and domain-ownership steps; you say exactly what to click and verify the result with the tools.
- The owner must own the domain and every account. Never use your own or the builder's login for the customer.
- **Never ask for passwords or API keys in chat.** Tell the user to put keys in `sites/<slug>/.env` themselves (create `.env.example` listing the variable names); `.env` is never committed.
- Check current prices and limits before quoting them; they change. Not legal advice for Impressum and privacy texts; real data comes from the owner.
- Run `wrangler pages deploy` only after the user logged in themselves and said yes.

## Always
After every step, say what is done, what is next, and what the user waits for (DNS can take up to a day). Offer the next step with `AskUserQuestion`, recommended first. When finished (`launch: live`) offer `handover-site`.
