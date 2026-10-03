# Hosting options

Hosting is independent of the CMS and of the domain. The site is **static files** (built once), so hosting is cheap or free. Facts were checked against provider documentation on 2026-10-03; re-check limits and prices before promising anything.

## Comparison

| Option | Cost for a site like this | Needs a git repository | Build hook for CMS changes | Notes |
|---|---|---|---|---|
| **Cloudflare Pages** (recommended) | free | no (Direct Upload with `wrangler`) or yes (git integration) | yes, with git integration (deploy hook URL) | global CDN, free HTTPS, rollback of every deployment; apex domain needs Cloudflare name servers, subdomains need a CNAME; Direct Upload projects cannot be switched to git later |
| **Netlify** | free tier | no (drag-and-drop or CLI) or yes | yes (build hook) | built-in form handling; apex via ALIAS or Netlify DNS |
| **Vercel** | the free "Hobby" plan is for non-commercial use; business sites need a paid plan | yes (or CLI) | yes (deploy hook) | check terms before using Hobby for a company site |
| **GitHub Pages** | free | yes | no hooks; use GitHub Actions | static only, custom domain supported |
| **Owner's existing web space** (IONOS, Strato, ...) | already paid | no | no | upload the built files by FTP; fine for sites without a CMS; simple for owners who already have it |
| **Wix-hosted frontend** | Wix premium plan needed for a custom domain | no | not needed | Wix runs the frontend; domain is connected inside Wix; ties the site to Wix |

## Recommendation logic
1. **No CMS, or content changes only through the agent/developer:** Cloudflare Pages with Direct Upload. No GitHub needed; every change is a rebuild and `wrangler pages deploy`.
2. **CMS with automatic publishing** (editors press Publish and the site updates): a host with **git integration and a deploy hook** (Cloudflare Pages via git, or Netlify). The site needs a remote repository (owner's GitHub account); the CMS calls the deploy hook when content changes. Wix: an Automation with trigger "item added/updated in collection" and action "Send HTTP request" to the hook URL. Sanity: a webhook.
3. **Owner already pays for web hosting and wants nothing else:** upload `dist/` by FTP; content changes need a developer.
4. **The owner insists on keeping everything in Wix:** use Wix-hosted headless; the domain then lives in Wix.

## What the agent prepares for every host
`public/robots.txt`, `public/sitemap.xml`, security headers (`_headers` for Cloudflare/Netlify, `vercel.json` for Vercel), the site address in `astro.config.mjs`, a 404 page, and the exact deploy commands in `launch/LAUNCH.md`. The agent runs `npx wrangler login` and deploy commands only when the user explicitly approves and after the user has logged in themselves.

## Costs the user should know
Domain yearly, optional email mailboxes monthly, CMS plan if needed, form service if above its free limit. Hosting itself is normally free at this size. Everything that can cost money is proposed with a price and never switched on without the user's yes.
