# Launch playbook (agent script)

Used by the `launch-site` skill. The agent leads: it asks, explains and proposes the next step every time; the user does the account and payment clicking. Background for explanations: [domains explained](domains-explained.md), [hosting options](hosting-options.md). Templates: `framework/templates/launch/`.

Hard rules: never create accounts, spend money, change DNS, add remotes or deploy without the user's explicit yes for that specific action; never ask the user to paste passwords or API keys into the chat (keys go into the site's `.env` file that the user edits themselves); the owner must own every account and the domain.

## Phase A: Happy? Decide (brief front matter `launch: decided`)
1. Run `npm run status -- <slug>`. If the site is in review, ask: "Are you happy with the site, or is there anything left to change?" (options: change something / happy, launch / export a copy first).
2. One round of `AskUserQuestion` (max 4 questions), each with a recommended option and the reason:
   - **Domain:** I already own one (ask for it) / I need one: I will help choose and explain how to buy / not yet, use the free preview address first (Recommended when undecided).
   - **Hosting:** Cloudflare Pages (Recommended) / Netlify / the owner's existing web space / Wix-hosted. Apply the recommendation logic in [hosting options](hosting-options.md): CMS with auto-publish means git-based host plus deploy hook.
   - **Email:** keep existing / needs mailboxes / none. (Never change name servers before knowing this.)
   - **Who owns the accounts:** the owner themselves (Recommended) / the user creates them on the owner's behalf with the owner's details.
3. Explain the five separate things in three sentences (use the table in domains explained), and that CMS, hosting and domain are independent.
4. Record decisions in `brief/BRIEF.md` (technology table and launch section) and set `launch: decided`.

## Phase B: Prepare (`launch: prepared`)
1. If a domain is known: `npm run launch-prep -- <slug> --domain <domain> --host <host>` (add `--www` to make www the main address). Without a domain: run it with `--host` only; the domain steps stay open.
2. Replace placeholders with real content together with the user (list what is still marked "Platzhalter", "Beispiel", demo phone numbers, legal data). Ask for real Impressum data; never invent it.
3. `npm run launch-check -- <slug> --domain <domain>`: fix every FAIL, discuss every WARN. Re-run until no FAIL.
4. If a CMS is used: `npm run cms:check -- <slug>`; explain the rebuild hook (deploy hook URL) and where it is entered (CMS automation or webhook).
5. Update `launch/LAUNCH.md` with host-specific, copy-paste-ready steps and the DNS table (values come from the host dashboard once the domain is added).
6. Commit in the site repository (`build: launch preparation`).

## Phase C: Accounts and deploy (user acts, agent guides)
Walk through `launch/LAUNCH.md` sections 1 to 3 one step at a time: say exactly what to click, wait for the user's confirmation, then verify. For Cloudflare Pages Direct Upload the agent may run `wrangler pages deploy` **after** the user ran `npx wrangler login` and said "yes, deploy". Check the preview address (`<project>.pages.dev`) together on phone and computer before connecting any domain. Set `launch: deployed` when the preview address is online.

## Phase D: Domain
1. If the owner needs a domain: guide registration at a registrar from the table in domains explained (current prices checked), owner's account and details, auto-renew and transfer lock, 2-factor.
2. Add the domain in the host dashboard first, then DNS records as shown there. Ask about existing email before changing name servers and copy those records first.
3. After each change tell the user how long to wait, and offer to check later.

## Phase E: Verify (`launch: live`)
`npm run dns-check -- <domain> [--target <project>.pages.dev]`: explain the result in plain language. When LIVE: open all pages on the live address, test forms, confirm the redirect between www and non-www, submit the sitemap (optional). Update `launch/LAUNCH.md` and `ACCOUNTS.md` (no passwords). Set `launch: live`.

## Phase F: Handover (`handover: done`)
Run the `handover-site` skill: package, owner walkthrough, accounts table, costs and renewals, who to call. Then offer `wrap-up`.

## Always
End every message with the next step and, when there are several, offer them with `AskUserQuestion` (recommended first). If the user is waiting for DNS, say what to do while waiting and offer to re-check.
