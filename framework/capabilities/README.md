# Capabilities

Reusable building blocks. Each folder says **when to use it**, **what it needs**, **how to integrate it** and **what to watch for**. Copy into a site, then adapt (do not link). If a site improves a capability, port the improvement back here.

| Capability | Use when | Status |
|---|---|---|
| [3d-scroll-story](3d-scroll-story/README.md) | scroll-driven 3D narrative or scene | proven (framework/examples/lindenhof) |
| [cms-providers](cms-providers/README.md) | editors must change content without a developer; the CMS is a plug-in (Wix first) | contract + Wix core tested against a mock; real Wix account pending |
| [listings-filter](listings-filter/README.md) | many similar items with filters (properties, jobs, products) | proven (framework/examples/lindenhof) |
| [forms](forms/README.md) | enquiry, contact, damage report, booking request | proven as demo; sending needs a service |
| Single-file export | send a site to someone | `framework/tools/export-site.mjs` (proven) |

Ideas to add when a project needs them: image gallery with lightbox, map section (privacy-friendly), multi-language routing, blog with RSS, pricing tables, testimonials (real only), booking integrations, shop integrations (Snipcart, Shopify Buy Button), video hero, page transitions.

When adding a capability: write the README first (use, needs, integration, pitfalls, verification), include working code taken from a finished site, link it here, and mention it in `framework/intake/` if it should become a question option.
