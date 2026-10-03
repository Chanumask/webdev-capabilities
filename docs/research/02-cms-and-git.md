# Git/GitHub and CMS

## Do we need a GitHub repository?

**Short answer:** Local `git`: yes, always (undo, history, safe experiments with AI edits). A *remote* (GitHub/GitLab): practically yes for client work, though not strictly for first prototypes.

| Need | Remote repo required? |
|---|---|
| Prototype on your machine | No (local git is enough) |
| Deploy via Netlify / Vercel / Cloudflare Pages (auto-build on push) | Yes (or manual CLI deploys) |
| Git-based CMS (Decap, TinaCMS, CloudCannon) | Yes: content is committed to the repo |
| API-based CMS (Sanity, Storyblok, Prismic) | Not for content; yes for code deploys |
| Backup, handover to the client or another dev | Yes |

**Structure options**
- *One repo per client site* (recommended for client work): clean ownership, easy transfer, separate deploys and secrets.
- *One monorepo* (this folder): handy for reusing starters/components across your own sites. `templates/starter` is the template; copy it per client, then give each client its own repo.
- Use private repos. Put the client's org as owner if they pay for hosting.

## CMS: what non-technical editors need
Log in with email, edit text/images in a friendly UI, hit Publish, see the site update within a minute or two. They never touch code, Git or GitHub.

### Candidates (from 2026 comparisons; verify pricing before quoting)
| CMS | Type | Editor experience | Fit |
|---|---|---|---|
| **Storyblok** | API, SaaS | Visual editor: live site inside the CMS, click-to-edit. Official Astro integration. | **Best for non-tech clients on design-heavy sites.** Paid tiers can get pricey. |
| **Sanity** | API, SaaS | Excellent, customisable Studio; generous free tier; real-time collaboration | **Best default** if you can spend time on the schema. Visual editing add-on exists. |
| **Prismic** | API, SaaS | Slice-based page building aimed at marketers | Good for landing-page-heavy sites. |
| **TinaCMS** | Git-based | Inline visual editing | Good if content must live in Git; needs GitHub. |
| **Decap CMS** | Git-based, open source | Functional but dated UI | Free, fine for small brochure sites; needs GitHub auth setup. |
| **CloudCannon** | Git-based SaaS | Polished visual editing for static sites | Strong agency option; paid. |
| **Payload** | Self-hosted, code-first | Good admin | Needs hosting + DB; overkill for brochure sites. |

### Important for 3D/animation sites
CMS content works for text, images, links, lists, pricing, team, blog. The *3D scene and animation choreography stay in code*. Design it so that:
- The client edits **content slots** (headlines, images, product names, a colour from a fixed palette, at most a GLB upload), never layout or motion.
- Only a few safe knobs are exposed (hero title, CTA text, accent colour from a list).
- A text-only fallback exists for `prefers-reduced-motion` and no-WebGL devices.
- A webhook from CMS publish triggers a hosting rebuild, so edits go live automatically.

### Update 2026-10-03: client wants Wix (Storyblok is too complicated for them)
Wix is a valid choice. **Wix Headless** keeps the editor experience the client already knows (Wix dashboard / Business Manager, CMS collections) while we build the frontend in Astro. Wix publishes Astro templates, an Astro integration (`@wix/astro`) and a data SDK (`@wix/data`, `@wix/sdk`) for reading CMS collections from an external frontend. Sources: [Wix Headless](https://www.wix.com/studio/developers/headless), [Astro templates](https://dev.wix.com/docs/go-headless/wix-managed-headless/wix-managed-templates/astro-templates), [Data Quick Start](https://dev.wix.com/docs/go-headless/self-managed-headless/tutorials/java-script-sdk-tutorials/data-quick-start).

- **What the client edits:** collections such as Objekte (listings), Leistungen, Texte, in the Wix dashboard. Saving updates the data we read.
- **Static build caveat:** Astro builds static HTML, so a Wix publish needs a rebuild hook on the host (Netlify/Vercel/Cloudflare build hook triggered by Wix automation/webhook), or switch the listings page to server rendering.
- **Not verified yet:** exact Wix plan/pricing needed for Headless, webhook options, and image handling (a community thread reports image URL issues). Check with the client's Wix account before promising.
- **Needs from the client:** a Wix account/site with Headless enabled and an API key; we cannot connect it without those.
- **Code is ready for it:** `examples/lindenhof/src/content/provider.ts` is the single swap point; pages never import the data file directly.

### Recommendation
0. **If the client insists on Wix: Astro + Wix Headless** (see update above).
1. Default otherwise: **Astro + Sanity** (cheap, flexible, no repo access for the client), or **Astro + Storyblok** when the client wants to click directly on the page.
2. Tiny site, client fine with Git-backed content: **Decap or Tina**.
3. Master one CMS before using several across projects; reuse schema patterns.

### Do the five tools include a CMS?
No. Impeccable and Taste influence design, Playwright tests, img2threejs makes 3D models, awesome-claude-design is a style library. The CMS is a separate decision. Sanity and Storyblok both offer agent/MCP tooling that may help Claude model schemas; I haven't verified it, so check when you start the first CMS project.
