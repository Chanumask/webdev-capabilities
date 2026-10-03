# Launch guide: __NAME__

Prepared __DATE__. Domain: **__DOMAIN__** (main address: **__CANONICAL_HOST__**). Hosting: **__HOST__**.

You do the clicking, because accounts, payments and domain ownership must stay with the owner of the website. The agent prepares everything, tells you exactly what to click, and checks the result with tools after each step. Tick the boxes as you go; the agent keeps this file up to date.

Plain-language background on every term: `framework/launch/domains-explained.md`.

## 0. Before anything goes online
- [ ] The site is approved by the owner (all feedback applied).
- [ ] Pre-launch check passes: `npm run launch-check -- __SLUG__ --domain __DOMAIN__` (no blocking items; warnings reviewed).
- [ ] Real content replaced every placeholder (texts, phone, address, prices, images).
- [ ] Legal pages have the real data (Impressum, Datenschutz for German sites). **Not legal advice: have the owner or a lawyer confirm the texts.**
- [ ] The owner knows what it will cost per year (section 7).

## 1. Accounts (all in the owner's name)
- [ ] Email address for the accounts (a shared company address, not a personal one).
- [ ] Hosting account created: __HOST__.
- [ ] Domain registrar account created (section 2).
- [ ] Two-factor login switched on everywhere. Recovery codes stored safely (password manager).
- [ ] Entered in `ACCOUNTS.md` (service, owner, login email, no passwords).

## 2. Domain name
- [ ] Name chosen and checked for availability: __DOMAIN__
- [ ] Registered by the owner (registrant = the owner's name and address) at: ______ , price per year: ______
- [ ] Auto-renew on, transfer lock on.

## 3. Hosting: deploy the site
Cloudflare Pages (direct upload, no GitHub needed):
- [ ] `npm run build -- __SLUG__`
- [ ] Log in once: `npx wrangler login` (opens a browser, you approve)
- [ ] Create the project: `npx wrangler pages project create __SLUG__`
- [ ] Deploy: `npx wrangler pages deploy sites/__SLUG__/dist --project-name __SLUG__`
- [ ] The preview address `https://__SLUG__.pages.dev` opens and looks right.

Other hosts: the agent writes the exact steps here when you choose them (Netlify, Vercel, GitHub Pages, your own web space).

## 4. Connect the domain
- [ ] In the hosting dashboard: add the custom domain __CANONICAL_HOST__ **first**.
- [ ] At the DNS provider: add the records the dashboard shows (the agent lists them here):

| Name | Type | Value | Purpose |
|---|---|---|---|
| _fill in_ | | | |

- [ ] If the host needs its own name servers for the main domain (Cloudflare Pages does for `example.de` without www): copy existing email records **before** switching name servers, then switch.
- [ ] The other address (with or without www) redirects to the main address.

## 5. Verify
- [ ] `npm run dns-check -- __DOMAIN__` says LIVE (HTTPS works, certificate valid).
- [ ] Open the site on a phone and a computer: all pages, menu, forms, images, animation.
- [ ] Send a test message through the contact form (if a form service is connected).
- [ ] Google: submit `https://__CANONICAL_HOST__/sitemap.xml` in Google Search Console (optional but recommended).

## 6. After launch
- [ ] Brief marked `launch: live` and the domain/hosting details written to `ACCOUNTS.md`.
- [ ] Handover package created: `npm run handover -- __SLUG__`.
- [ ] Calendar reminders for domain renewal and any yearly plans (section 7).

## 7. Costs per year (fill in real prices; they change)
| Item | Provider | Cost | Renews |
|---|---|---|---|
| Domain __DOMAIN__ | | | |
| Hosting | __HOST__ | usually free for this kind of site | |
| CMS | | | |
| Email mailboxes (if any) | | | |
| Form service (if any) | | | |

## 8. If something goes wrong
- Site shows an error (522, 525, "not secure"): wait 15 minutes after DNS changes, then ask the agent to run `dns-check`.
- Old content still shows: the browser cache; hard-refresh (Ctrl+F5) or try a private window.
- Email stopped after switching name servers: the email records (MX, SPF, DKIM) were not copied. Add them back at the new DNS provider.
- Roll back: redeploy the previous version (Cloudflare Pages keeps every deployment; pick the older one and "Rollback").
