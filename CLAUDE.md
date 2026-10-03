# webdev-capabilities: operating manual for the agent

This repository is a **framework for creating high-end websites with Claude Code**. The people using it are usually **not technical**: they describe what they want in plain language, answer your questions, look at the result on localhost, and send feedback. You do all engineering. Always answer in the user's language.

## First thing in a fresh clone
If `.framework-state.json` does not exist, or the user says "set up" / "get started" / gives you this repository link, run the `onboard` skill first: `npm run setup`, report what is set up and what needs attention, then offer the next steps (new website, edit an existing one, look at the example, ask questions). The full procedure is in `README.md` ("Instructions for the agent").

## How a conversation starts
When the user wants a website (any phrasing: "I want a new website", "build me a site for ...", "neue Website"), **do not start coding and do not ask a single free-form question**. Invoke the `new-site` skill and run the design intake: several rounds of questions with the `AskUserQuestion` tool, each round more detailed than the last, covering intent, audience, content, style, 3D/motion, architecture (with a recommended option for every technical choice) and a final review. Details: `framework/intake/`.

| User says | You do |
|---|---|
| just cloned / "set up" / "get started" / "what can this do" | `onboard` skill |
| wants a new site | `new-site` skill (intake), then `build-site` after approval |
| mentions an existing site, gives feedback, wants a change | `change-site` skill |
| wants to send / share / export | `export-site` skill |
| asks "how does this work" | explain the workflow in 5 lines from `framework/WORKFLOW.md`, offer to start |

## Non-negotiables
- **Never build before the brief is approved** (round 6, explicit "yes").
- **Everything is shown on localhost** (`npm run dev -- <slug>`), and can be **exported as one offline HTML file** (`npm run export -- <slug>`).
- **No invented facts**: prices, testimonials, statistics, legal data, people. Unknown facts are visibly marked placeholders.
- **One brief per site**: `sites/<slug>/brief/BRIEF.md` is the source of truth; update it before changing a decision; log changes in `brief/CHANGELOG.md`.
- **Do not push, publish, delete or spend money** (repositories, deployments, domains, paid CMS accounts) without explicit approval.
- Commit at milestones (`brief:`, `build:`, `change:`, `docs:`); never commit `node_modules`, `dist`, `exports`, `.env`.
- Keep the user's effort low: ask in batches, recommend defaults, explain consequences in plain words.

## Map
- Process: `framework/WORKFLOW.md`, `framework/CONVENTIONS.md`, `framework/intake/`, `framework/templates/brief/`
- Building blocks: `capabilities/` (3D scroll story, CMS patterns)
- Starter project: `templates/starter/`; your sites: `sites/<slug>/`; reference projects: `examples/` (`lindenhof` = the quality bar)
- Commands: `npm run setup | new-site | dev | stop | build | list | export` (see `framework/CONVENTIONS.md`)
- Research: `docs/` (tool evaluation, CMS and Git options)
- Skills: `.claude/skills/` (`onboard`, `new-site`, `build-site`, `change-site`, `export-site`, `impeccable`, `playwright-cli`); agents: `.claude/agents/` (Impeccable reviewer and documenter)

## Working practices
- Use `playwright-cli` to look at every UI change in a real browser (390, 820 and 1440 px). Never judge visuals you have not seen.
- Design quality comes from the Impeccable skill: read `reference/craft-floor.md` before UI edits; use bounded verification (one batched inspection round, one confirming round), then the finish reviewer, then the documenter.
- Prefer restrained, high-quality palettes and realistic materials unless the brief says otherwise; one authored motion moment; readable text over scenes; calm fallbacks for reduced motion and no-WebGL.
- Windows environment: prefer the Write/Edit tools for creating files; long shell heredocs with quotes can fail.
- Known engineering lessons are in `framework/CONVENTIONS.md` and `capabilities/3d-scroll-story/README.md` (e.g. GSAP scrub does not fire ScrollTrigger `onUpdate`; never put negative margin on a sticky element; keep base scale on every axis when scaling metre-authored groups).

## Staying consistent
When the process changes (new question, new capability, new convention), update the matching file in `framework/` or `capabilities/` and this manual in the same change.
