# 0010: Launch and handover workflow

Date: 2026-10-03 · Status: active

**Context.** After the user is happy the site must go online on a real domain and be handed to the owner. Users usually have no experience with domains, DNS and hosting. The agent cannot and must not create accounts or spend money.

**Decision.**
- Stages 7 (launch) and 8 (handover) of the website workflow, run by the `launch-site` and `handover-site` skills from [`framework/launch/`](../../framework/launch/README.md): decide, prepare, deploy, connect domain, verify, hand over.
- The agent explains domain, registrar, DNS, hosting and CMS as five independent things, leads each step, and verifies with tools (`launch-prep`, `launch-check`, `cms:check`, `dns-check`, `handover`).
- **Owner owns everything:** domain and all accounts are registered by the website owner; helpers get named access. No account creation, payment, DNS change, deployment, repository creation or push without the user's explicit yes for that action. No secrets in chat; keys live in the site's git-ignored `.env`.
- Default host: Cloudflare Pages (free; Direct Upload needs no git; with a CMS that publishes automatically, a git-connected project plus deploy hook). Alternatives and the recommendation logic are in `hosting-options.md`.
- Launch state lives in the brief front matter (`launch`, `handover`, `domain`, `host`).

**Why.** Takes the unknowns out of going online while keeping money, ownership and credentials with the owner. Verified facts about hosts and registrars are re-checked before quoting prices.

**Rules out.** The agent buying domains or creating accounts; agency-owned domains; deploying without an explicit yes; secrets pasted into chats.
