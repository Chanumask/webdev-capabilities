# Docs index (research notes)

The working process of the framework is in `../framework/` and `../CLAUDE.md`. This folder holds the research behind tool and CMS choices.

Research and setup notes for building high-end, animated/3D client websites with Claude Code.
Written 2026-10-03. Star counts and versions were checked against the GitHub API that day; re-check before relying on them.

| File | Content |
|---|---|
| [01-tool-evaluation.md](01-tool-evaluation.md) | Verdict on the 5 recommended tools + alternatives |
| [02-cms-and-git.md](02-cms-and-git.md) | Do we need GitHub? Which CMS for non-technical clients? |
| [03-dev-setup-and-workflow.md](03-dev-setup-and-workflow.md) | What is installed here and notes on the reference project |

## TL;DR
- **Use:** Impeccable (design quality), Playwright CLI (Claude sees/tests the result), Astro + Three.js + GSAP (stack).
- **Optional:** Taste Skill (overlaps Impeccable; try on a greenfield project, don't run both at once), img2threejs (only for "model this reference image" jobs).
- **Skip as a skill:** awesome-claude-design is a library of DESIGN.md inspirations, useful as reference only.
- **Git:** local git always; a remote (GitHub etc.) per client site is effectively required for hosting/deploys and Git-based CMSs.
- **CMS:** none of the five tools includes one. Client wants **Wix**: use Wix Headless with Astro (see 02). Sanity or Storyblok for most clients (editors need no repo access). Decap/Tina only if the client wants content in Git.
