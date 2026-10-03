# Dev Setup and Workflow

## What exists in this folder
```
Websites/
  docs/                 these notes
  templates/starter/       Astro 7 + Tailwind 4 + Three.js + GSAP + Lenis, with a scroll-driven 3D demo
  .claude/skills/       impeccable, playwright-cli (project scope)
  .claude/agents/       4 Impeccable subagents
  .playwright/          Playwright CLI config (git-ignored)
```
- `git init` was run (no commits yet, no remote).
- Machine: Node 24, npm 11, git 2.55. Global: `@playwright/cli`.
- Starter: `npm run build` succeeds. I have **not** yet looked at it in a browser; run it and screenshot with Playwright.
- `npm audit` reports 2 high findings on `http-cache-semantics` via Astro. The suggested "fix" downgrades Astro to 2.x, so ignore it and watch for an Astro update. It is a build-tool dependency, not shipped to visitors.

## First site: examples/lindenhof (fictional property management)
Astro + Three.js + GSAP + Lenis. One pinned axonometric house, scroll-driven: floors drop in, explode into plan views (Erdgeschoss = Mieterservice, 1. OG = Mieten, 2. OG = Kaufen, DG = Eigentümer), then pull back into a Siedlung. Design direction: *Das Neue Frankfurt* housing-reform graphics (drenched colour fields, chalk volumes with ink outlines, Jost + Atkinson Hyperlegible). Product truth in `PRODUCT.md`, direction contract in `.impeccable/surfaces/`, design system in `DESIGN.md` (written at finish).

- Run: `cd examples/lindenhof && npm run dev` (or `npx astro dev --background`).
- Scene code: `src/scripts/scene/` (kit = merged-geometry builder, building = floors/roof, scene = state, camera and scroll timeline). Scroll anchors in `scene.ts` (`A`) must match the section heights in `index.astro`.
- Content slots: `src/content/site.ts`, accessed only through `provider.ts`.
- Demo only: sample listings, forms have no backend, placeholder phone numbers.
- Lessons: GSAP scrub smoothing does not fire ScrollTrigger `onUpdate` (drive rendering from the timeline); never put negative margin on a sticky element, put it on the next sibling.

## Start a new site
See the root README and `framework/WORKFLOW.md`: tell Claude "I want a new website"; it runs the intake, builds the site in `sites/<slug>/`, shows it on localhost and can export a single offline HTML file.

## Why Astro
Static HTML by default (fast, SEO-friendly); JS/3D loads only where used; integrations for Storyblok, Sanity, Decap, Tina; React islands (R3F) can be added per page. Next.js is the alternative for app-like sites.

## Optional installs later
```bash
npx skills add Leonxlnx/taste-skill                                                   # Taste Skill
git clone https://github.com/img2threejs/img2threejs.git .claude/skills/img2threejs   # img2threejs
npx impeccable install --yes --project --providers=claude --force                      # re-run WITH hooks
```

## Prompt recipes
- "Read docs/ and sites/<client>. Build the hero as a scroll-driven Three.js scene with a reduced-motion fallback; screenshot mobile and desktop with playwright-cli and fix what looks off."
- "/impeccable audit", then "/impeccable polish" on the finished page.
- "Model the content as Sanity schema: hero, features, testimonials, contact. The 3D scene stays in code."
