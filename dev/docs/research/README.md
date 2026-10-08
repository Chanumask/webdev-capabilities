# Research notes

← [CLAUDE.md](../../../CLAUDE.md) · [docs index](../README.md)

Research behind tool and CMS choices, written 2026-10-03. Star counts and versions were checked against the GitHub API that day; re-check before relying on them.

| File | Read when... |
|---|---|
| [01-tool-evaluation.md](01-tool-evaluation.md) | Choosing or revisiting a design or 3D tool (Impeccable, Playwright CLI, Taste, img2threejs and alternatives) |
| [02-cms-and-git.md](02-cms-and-git.md) | Deciding on a CMS (Wix Headless, Sanity, Storyblok, Decap) or on repository setup for client work |
| [03-dev-setup-and-workflow.md](03-dev-setup-and-workflow.md) | Looking for notes on the reference project (framework/examples/lindenhof) and engineering lessons |
| [04-photorealism-problem.md](04-photorealism-problem.md) | Why the 3D output looks cartoony, the lighting spike, repo facts for the photoreal work |
| [05-photorealism-candidates.md](05-photorealism-candidates.md) | Verified versions, licences, prices and export impact of photoreal tools, assets and skills |
| [06-photorealism-plan.md](06-photorealism-plan.md) | The proposed realism tiers, branches, acceptance and draft decisions (awaiting approval) |
| [07-photorealism-quality-spikes.md](07-photorealism-quality-spikes.md) | What photorealism the tiers actually reach (images, byte and render numbers, pitfalls found) |
| [08-people-and-characters.md](08-people-and-characters.md) | Where human models come from (Rocketbox, Mixamo, MPFB2, MetaHuman), their licences and what a test render showed |

## TL;DR
- **Use:** Impeccable (design quality), Playwright CLI (the agent sees the result), Astro + Three.js + GSAP (stack).
- **Optional:** Taste Skill (overlaps Impeccable), img2threejs (only for "model this reference image" jobs).
- **CMS:** none of the design tools includes one. The first client wants **Wix Headless** with Astro; Sanity is the default otherwise; Decap or Tina only when content should live in Git.
- **Git:** local git always; one private repository per customer site ([decision 0003](../decisions/0003-sites-own-repos.md)).
