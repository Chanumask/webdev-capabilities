# Conventions

## Repository layout

A website-mode user only ever needs `sites/` and `exports/`. Everything else is the machinery.

```
README.md        start here
CLAUDE.md        instructions for the AI agent (it reads this first)
package.json     the commands (npm run ...)
sites/           YOUR websites, one folder per site (each its own git repository, starts empty)
exports/         single-file exports and handover packages (created when needed, git-ignored)
framework/       how websites are made; the agent works from this
  WORKFLOW.md  CONVENTIONS.md  NEXT-STEPS.md
  intake/          the question catalog: six rounds of questions
  launch/          domains explained, hosting options, going online, handover
  templates/       brief and launch templates, and the starter project every site is created from
  capabilities/    reusable building blocks (3D scroll story, CMS providers, listings, forms)
  examples/        finished reference projects (lindenhof)
  tools/           the scripts behind the npm commands
dev/             only for people improving the framework: docs, tests, scripts, git hooks, config
.claude/         the agent's skills, helpers and permission settings
```

Hidden entries in the root (`.git`, `.claude`, `.zed`, `.gitignore`, `.gitattributes`, `.editorconfig`) are tool configuration. Local tool output (`.playwright*`, `.impeccable`, `dev/.smoke`) is git-ignored.

## One site = one folder

```
sites/<slug>/
  brief/            BRIEF.md (source of truth), INTAKE.md (raw answers), ACCEPTANCE.md, CHANGELOG.md, assets/ (supplied files)
  PRODUCT.md        design context for the AI tools (written in the build)
  DESIGN.md         design system record (written in the build)
  .impeccable/      design tool state: surfaces/ (direction contract), design.json
  src/
    content/        site.ts + provider.ts (content slots; the only place a CMS connects)
    layouts/ pages/ components/ styles/ scripts/
    scripts/scene/  3D scene code (only if the site has 3D)
  public/           static files (favicon, rendered stills, fonts only if not from npm)
  package.json  astro.config.mjs
```

Slug rules: lowercase letters, numbers, dashes; short; no dates (`meyer-architekten`). The folder name is the id used by every command.

## Commands (the agent runs them; the user never has to)

| Command | What it does |
|---|---|
| `npm run setup` | checks Node, git, browser tooling, prepares the design tool, builds the example as a smoke test (`:quick` skips it) |
| `npm run new-site -- <slug> "Name"` | creates `sites/<slug>` from the starter, with the brief templates, and installs dependencies |
| `npm run dev -- <slug>` | starts the site on localhost (first free port from 4321) and prints the address |
| `npm run stop -- <slug>` | stops that dev server |
| `npm run build -- <slug>` | production build into `sites/<slug>/dist` |
| `npm run export -- <slug>` | single-file offline export into `exports/<slug>/` (add `-- --zip`, `-- --light`); warns above 15 MB, fails above 25 MB |
| `npm run weight -- <slug>` | page weight of the build and the estimated size of the single file |
| `npm run assets -- add <slug> models/<id>` | downloads a CC0 Poly Haven model, texture or HDRI once into the site and lists it in `ASSETS.md` |
| `npm run blender -- check | render | frames | run | validate` | headless Blender pipeline for photoreal scenes ([capability](capabilities/blender-pipeline/README.md)) |
| `npm run status -- <slug>` | stage of a site and proposed next steps (the agent runs it to lead the conversation) |
| `npm run launch-prep -- <slug> --domain d.de` | prepares launch guide, robots, sitemap, headers, site address (no network) |
| `npm run launch-check -- <slug>` | pre-launch checks on the built site |
| `npm run cms:check -- <slug>` | tests the CMS connection from the site's `.env` (read only) |
| `npm run dns-check -- <domain>` | what the internet sees for a domain, in plain language |
| `npm run handover -- <slug>` | handover package in `exports/<slug>-handover/` |
| `npm run list` | lists sites, examples and templates |

Sites in `framework/examples/` and `framework/templates/` work with the same commands.

## Adding a site
1. User says what they want. The agent runs `/new-site`.
2. `npm run new-site -- <slug> "Name"`, then the intake rounds, then the lock.
3. Build, review on localhost, export.
Never copy another site's folder by hand. Reuse ideas through `framework/capabilities/` and `framework/examples/`.

## Continuing or changing a site
Open the chat, name the site ("the Meyer site"). The agent reads `brief/BRIEF.md`, `PRODUCT.md`, `DESIGN.md` and `brief/CHANGELOG.md` first, then follows the change workflow in `WORKFLOW.md`.

## Capabilities
`framework/capabilities/<name>/README.md` describes when to use it, what it needs, how to integrate it, and what to watch for; code lives next to it. A capability is copied into a site (not linked), then adapted. If a site improves a capability, port the improvement back into `framework/capabilities/` in the same change.

## Code conventions inside a site
- Content never sits inside components or scene code; it comes from `src/content/` through `provider.ts`.
- Colour and type tokens are CSS custom properties in `src/styles/global.css`.
- Interactive code lives in `src/scripts/`, one module per concern, imported from the page with a `<script>` tag.
- Scroll-driven scenes: one timeline module drives a single `state` object; render only when state changed; respect `prefers-reduced-motion`; keep anchors (scroll positions) in one constant that matches the CSS section heights.
- 3D geometry is authored in real-world units and baked per material (few draw calls). See `framework/capabilities/3d-scroll-story/`.
- Fonts come from `@fontsource` packages (no third-party font requests).
- Language: copy in the site language, code and comments in English, commit messages in English.
- No invented facts. Placeholders are visibly labelled ("Beispiel", "Platzhalter").

## What is committed, and where
- **Framework repository** (this one): framework, capabilities, templates, examples, tools, docs. `sites/*` is git-ignored here ([decision 0003](../dev/docs/decisions/0003-sites-own-repos.md)).
- **Each site is its own git repository** (`npm run new-site` runs `git init` and makes the first commit). Website sessions commit milestones there. Publishing a site is a separate repository the user creates.
- Never committed anywhere: `node_modules`, `dist`, `.astro`, `exports/`, `.env*`, Impeccable review screenshots (`.impeccable/review`, `.impeccable/mocks`), Playwright output.

## Two session modes
Building and changing sites is **website mode** (write only in `sites/<slug>` and `exports/`, never edit the framework, note gaps in `brief/FRAMEWORK-FEEDBACK.md`). Improving the framework is **maintainer mode** on feature branches ([modes](../dev/docs/process/modes.md), [git workflow](../dev/docs/process/git-workflow.md)).

## Documentation
Site decisions and changes go to the site's `brief/CHANGELOG.md`. Framework decisions, process and research go to `dev/docs/`. Update `CLAUDE.md` when the process itself changes (maintainer mode).
