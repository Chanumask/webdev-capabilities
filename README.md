# webdev-capabilities

A framework for creating **high-end websites with Claude Code**, including animated 3D scenes, without needing to be technical. You describe what you want, answer a structured set of questions, look at the result in your browser, and get a single HTML file you can send to anyone.

---

## Quick start (tell an agent this)

> Clone https://github.com/Chanumask/webdev-capabilities, read its README.md and do the setup.

That is all. The agent follows the section below, then reports what was set up and offers you the next steps.

---

## Instructions for the agent (do this after cloning)

You are Claude Code. Follow these steps in order. Do not skip the report at the end.

1. **Get the code.** If you were given a link and the repository is not on disk yet:
   `git clone https://github.com/Chanumask/webdev-capabilities.git` and work inside the new folder. Ask where to put it only if the current directory is unsuitable.
2. **Read the rules.** Read `CLAUDE.md` (how you behave here) and skim `framework/WORKFLOW.md`.
3. **Run the setup.** In the repository root run:
   ```
   npm run setup
   ```
   (`npm run setup:quick` skips the example build.) It checks Node 22.12 or newer, npm and git, installs the Playwright CLI globally if it is missing, prepares the Impeccable design tool (it downloads a small engine on first run), verifies the project skills, installs and builds `examples/lindenhof` as a smoke test, and writes `.framework-state.json`.
   - If something fails, read the FAIL line, fix the cause and run it again. Typical causes: Node too old (install Node 22 or newer from nodejs.org), no Chrome or Edge for the browser checks (install one, then `playwright-cli install`), missing git identity (`git config --global user.name "..."` and `user.email "..."`), no network.
   - Setup never pushes, publishes, creates accounts or spends money.
4. **Report the status** to the user in their language, short and plain: what is set up and working, what needs attention (for example git identity, GitHub access, browser), what the repository contains (`sites/` for their websites, `examples/` for reference projects), and how it works in one paragraph (you interview them in rounds, they approve a brief, you build it on localhost, they give feedback, you export one HTML file).
5. **Offer the next steps** with one `AskUserQuestion` call, then continue with their choice:
   - **Start a new website** (Recommended): design intake with several rounds of questions, then the build. Skill: `new-site`.
   - **Edit an existing website**: pick a site from `sites/`, describe the change. Skill: `change-site`.
   - **Look at the example**: `npm run dev -- lindenhof`, give them the localhost address and explain how to scroll through it.
   - **Ask questions about this repository**: workflow, question rounds, tools, CMS options, costs, limits. Answer from this README, `CLAUDE.md`, `framework/` and `docs/`.

The same procedure is available as the `onboard` skill (`.claude/skills/onboard`). If the user later says "set up" or "get started" again, run it again.

### What the agent can rely on
- Commands (run from the repository root): `npm run setup | new-site | dev | stop | build | list | export`. Details in `framework/CONVENTIONS.md`.
- Every site is shown on **localhost** (`npm run dev -- <slug>` prints the address) and can be **exported as one offline HTML file** (`npm run export -- <slug>`, result in `exports/<slug>/index.html`).
- Nothing is pushed, published or deleted without the user's explicit approval.

---

## How you use it (for humans)

1. Open this folder in Claude Code.
2. Say what you want, e.g. **"I want a new website for my architecture studio."**
3. Claude asks you questions in several rounds: what and why, who it is for, content, look and feel, animation, technology (with a recommended answer for every technical choice), and a final review. Answer quickly or in detail. "You decide" is always allowed.
4. You approve the summary. Claude builds the site in one go.
5. You look at it in your browser on **localhost** (Claude gives you the address) and send feedback in plain words.
6. When you want to share it, ask for an **export**: one HTML file that opens by double-click, offline, with all animations.

Other things you can say: "edit the Meyer site", "make it less colourful", "export the site", "what does this repository do?", "show me the example".

## What is in here

| Folder | Purpose |
|---|---|
| `sites/` | your websites, one folder each (starts empty) |
| `examples/` | finished reference projects (`lindenhof`: a scroll-driven 3D construction story) |
| `templates/starter/` | the empty project every new site starts from |
| `framework/` | the process: workflow, question catalog, brief templates, conventions |
| `capabilities/` | reusable building blocks (3D scroll story, CMS patterns, listings, forms) |
| `docs/` | research on tools, CMS and Git |
| `tools/` | the scripts behind the commands |
| `.claude/` | Claude Code setup: skills and agents |

## Commands (Claude runs them for you)

```
npm run setup                       check and prepare this machine
npm run new-site -- <slug> "Name"   create a site from the starter
npm run dev -- <slug>               show it on localhost
npm run stop -- <slug>              stop it
npm run build -- <slug>             production build
npm run export -- <slug>            one offline HTML file in exports/<slug>/
npm run list                        all sites, examples, templates
```

## Requirements
Node.js 22.12 or newer, npm, git, Chrome or Edge, and Claude Code. The Impeccable design skill and the Playwright skill are part of this repository (`.claude/skills`); the setup installs the Playwright CLI and prepares the rest.

## Two kinds of sessions

At the start of every chat the agent decides (or asks) which mode applies:

- **Website mode:** you build, change or export a website. The agent works only inside `sites/<slug>` (each site is its own private git repository) and never edits the framework.
- **Maintainer mode:** you improve the framework itself (capabilities, the question catalog, tools, docs). The agent works on a **feature branch**, runs the quality gates (`npm run check`), merges locally and stops. **The agent never pushes `main`; you do**: `WEBDEV_ALLOW_MAIN_PUSH=1 git push origin main`.

Rules and reasons: `docs/process/modes.md`, `docs/process/git-workflow.md`, `docs/decisions/`.

## For maintainers

```
npm run setup          also activates the git hooks (conventional commits, no commits on main, no push of main, secret guard)
npm run check          format, lint, tests, docs check
npm run smoke          starter template installs and builds from scratch
```

Extend the repo with `docs/process/extending.md` (capability, intake question, skill, tool, template, example). Ideas live in `docs/product/backlog.md`; things found while building sites arrive in `sites/*/brief/FRAMEWORK-FEEDBACK.md`.

## Where to read more
- `CLAUDE.md`: how the agent behaves here
- `framework/WORKFLOW.md`: the stages from idea to delivery
- `framework/intake/`: the question catalog (six rounds)
- `framework/CONVENTIONS.md`: structure and naming
- `capabilities/`: reusable parts
- `docs/`: tool and CMS research
