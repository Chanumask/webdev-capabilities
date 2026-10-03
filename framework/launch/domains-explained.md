# Domains and hosting, explained

For people who have never bought a domain. The agent uses this to explain things in the user's words; users can read it too. Prices and offers change, so the agent checks current ones before quoting.

## The five separate things

Putting a website online involves five things. They are **independent of each other** and can each be swapped without touching the others.

| Thing | In everyday words | Example | Typical cost |
|---|---|---|---|
| **Domain name** | the address people type | `meyer-architekten.de` | about 5 to 15 euros per year (`.de`, `.com` similar) |
| **Registrar** | the shop where you rent the address | INWX, IONOS, Hetzner, Cloudflare | included in the domain price |
| **DNS** | the address book: says which server an address points to | records like `www → my-site.pages.dev` | free at registrar or host |
| **Hosting** | where the website files are stored and served from | Cloudflare Pages, Netlify | free for a site like this |
| **Content system (CMS)** | where owners edit texts and items | Wix, Sanity | free to a few euros per month |

Email is a sixth, separate thing (mailboxes such as `info@meyer-architekten.de`), also set up through DNS records (MX).

**Wix and the domain:** if the CMS is Wix, Wix is only the place where texts are edited. The website itself is hosted elsewhere, so the domain is connected to the **hosting**, not to Wix. Wix handles the domain only when Wix hosts the whole website (a classic Wix site or Wix-hosted headless), which is not our default.

## Who owns what
- The **domain must be registered in the owner's name** (the "registrant"), in an account the owner controls, with a shared company email. An agency or developer should never be the only holder.
- Turn on **auto-renew** and **transfer lock**, and two-factor login. A lost domain is the worst way to lose a website.
- `.de` domains are administered by DENIC; registrars are resellers. Owner data may be shown in the public registry in reduced form; ask the registrar about "privacy" options. This is not legal advice.

## Choosing a name
Short, easy to say and spell, no hyphens or numbers if possible, matches the business name. `.de` for a German audience, `.com` for international. Check that the name does not infringe someone's trademark or company name. Check availability at any registrar's search box.

## Which registrar
| Need | Reasonable choices | Note |
|---|---|---|
| `.de` | INWX, Hetzner, IONOS, Strato, united-domains | Cloudflare does not register `.de` names |
| `.com`, `.org`, `.net`, many others | Cloudflare Registrar (sells at cost), INWX, Porkbun, Namecheap | easy DNS if combined with Cloudflare |
| The owner already has an account somewhere | use it, if it lets you edit DNS records | avoid creating a second account for no reason |

Pick one that lets you edit **DNS records** freely and offers two-factor login. Compare current first-year **and** renewal prices (introductory offers are often much cheaper than renewal).

## Connecting a domain to the website (the standard procedure)
1. **Deploy** the site at the host. It gets a free address such as `my-site.pages.dev`. Check it works.
2. In the **host's dashboard add the custom domain** (for example `meyer-architekten.de`). Do this **before** touching DNS.
3. **Add the DNS records** the host shows you, at the DNS provider:
   - A **subdomain** like `www.meyer-architekten.de`: a `CNAME` record named `www` pointing to the host address.
   - The **bare domain** (no www, called the "apex"): some hosts need their own name servers (Cloudflare Pages does), others accept an `ALIAS`/`ANAME` record or fixed `A` addresses.
4. **Wait.** Changes spread in minutes, sometimes up to 24 hours (a record's "TTL" says how long old answers are cached).
5. The host issues a free **HTTPS certificate** automatically once DNS is right.
6. Choose **one main address** (with or without `www`) and redirect the other to it, so search engines see one site.
7. Verify: `npm run dns-check -- <domain>` and open the site on a phone.

## Switching name servers (careful)
Moving the domain's name servers moves **all** DNS records. If the domain already has email, copy the MX, SPF, DKIM and DMARC records to the new DNS provider **first**, or email stops working. Never switch name servers without checking what exists.

## DNS records cheat sheet
| Type | Meaning | Example |
|---|---|---|
| A | name → IPv4 address | `@ → 203.0.113.10` |
| AAAA | name → IPv6 address | |
| CNAME | name → another name | `www → my-site.pages.dev` |
| ALIAS / ANAME | like CNAME but allowed on the bare domain | `@ → my-site.netlify.app` |
| MX | where email for the domain goes | set by the email provider |
| TXT | text proofs: ownership, SPF, DKIM, DMARC | set by providers |
| NS | which servers answer for this domain | set at the registrar |

`@` means the bare domain. A CNAME cannot sit on the bare domain, which is why hosts offer ALIAS or their own name servers.

## Email
Websites and mailboxes are separate. Options: mailboxes from the registrar or a hosting package (a few euros per month), Google Workspace or Microsoft 365 (more features, more cost), or forwarding addresses (free at some registrars). The email provider tells you which MX/SPF/DKIM records to add. Ask what the owner already uses before changing DNS.

## Germany and the EU (not legal advice)
German websites need an **Impressum** and a **Datenschutzerklärung** with real data. Tracking, embedded maps/videos and third-party fonts usually need consent; our default is no third-party requests, which avoids a cookie banner. The owner or a lawyer confirms the texts.

## Troubleshooting
| Symptom | Likely cause and fix |
|---|---|
| "Site can't be reached", NXDOMAIN | DNS records missing or not spread yet; check records, wait, run `dns-check` |
| Error 522 or 525 (Cloudflare) | domain not added in the host dashboard before the CNAME, or certificate still pending; wait 15 minutes, re-add the domain |
| "Not secure" | certificate not issued yet or a CAA record blocks it; ask the DNS provider to allow Let's Encrypt and Google/Cloudflare |
| www works, bare domain does not (or the reverse) | one record missing; add both and set a redirect |
| Old site still shows | cached; private window; check that the A/CNAME really changed |
| Email stopped | MX/SPF records lost after a name server switch; restore them |

## Glossary
**Apex/root domain:** `example.de` without a prefix. **Subdomain:** `www.example.de`. **Propagation:** time for DNS changes to reach everyone. **TTL:** how long answers are cached. **Registrant:** legal owner of the domain. **Nameserver:** server that answers DNS questions for the domain. **CDN:** network that serves files from a nearby location (hosts like Cloudflare include it). **Deploy:** upload the finished site to the host.
