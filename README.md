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
   (`npm run setup:quick` skips the example build.) It checks Node 22.12 or newer, npm and git, installs the Playwright CLI globally if it is missing, prepares the Impeccable design tool (it downloads a small engine on first run), verifies the project skills, installs and builds `framework/examples/lindenhof` as a smoke test, and writes `.claude/framework-state.json`.
   - If something fails, read the FAIL line, fix the cause and run it again. Typical causes: Node too old (install Node 22 or newer from nodejs.org), no Chrome or Edge for the browser checks (install one, then `playwright-cli install`), missing git identity (`git config --global user.name "..."` and `user.email "..."`), no network.
   - Setup never pushes, publishes, creates accounts or spends money.
4. **Report the status** to the user in their language, short and plain: what is set up and working, what needs attention (for example git identity, GitHub access, browser), what the repository contains (`sites/` for their websites, `framework/examples/` for reference projects), and how it works in one paragraph (you interview them in rounds, they approve a brief, you build it on localhost, they give feedback, you export one HTML file).
5. **Offer the next steps** with one `AskUserQuestion` call, then continue with their choice:
   - **Start a new website** (Recommended): design intake with several rounds of questions, then the build. Skill: `new-site`.
   - **Edit an existing website**: pick a site from `sites/`, describe the change. Skill: `change-site`.
   - **Look at the example**: `npm run dev -- lindenhof`, give them the localhost address and explain how to scroll through it.
   - **Ask questions about this repository**: workflow, question rounds, tools, CMS options, costs, limits. Answer from this README, `CLAUDE.md`, `framework/` and `dev/docs/`.

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
7. When you are happy, the agent guides you through **going online**: choosing hosting and a domain (it explains everything from scratch, you do the account and payment steps), checking that it works, and a **handover** package for the owner.
8. When you are done, say **"wrap up"**: the agent summarises the session, what worked, what was unclear, and what the framework should improve. You can send that summary (anonymised) to the maintainer.

Other things you can say: "edit the Meyer site", "make it less colourful", "export the site", "what does this repository do?", "show me the example".

## What is in here

If you only build websites, you only ever look at **`sites/`** (your websites) and **`exports/`** (files to send). The rest is the machinery.

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

- **`framework/`** is what the agent builds from: the questions it asks you, the guides for going online, the templates and building blocks. Edit it only when you want to change how the framework works.
- **`dev/`** is for maintainers: documentation of decisions and process, tests, git hooks, formatting and lint configuration.
- Hidden entries (`.git`, `.claude`, `.zed`, `.gitignore`, ...) are configuration; you can ignore them.

## Commands (Claude runs them for you)

```
npm run setup                       check and prepare this machine
npm run new-site -- <slug> "Name"   create a site from the starter
npm run dev -- <slug>               show it on localhost
npm run stop -- <slug>              stop it
npm run build -- <slug>             production build
npm run export -- <slug>            one offline HTML file in exports/<slug>/
npm run list                        all sites, examples, templates
npm run status -- <slug>            where a site stands and what to do next
npm run launch-prep -- <slug> --domain d.de   prepare going online (no network)
npm run launch-check -- <slug>      pre-launch checks
npm run dns-check -- <domain>       does the domain work yet?
npm run handover -- <slug>          handover package for the owner
```

## Requirements
Node.js 22.12 or newer, npm, git, Chrome or Edge, and Claude Code. The Impeccable design skill and the Playwright skill are part of this repository (`.claude/skills`); the setup installs the Playwright CLI and prepares the rest.

## Two kinds of sessions

At the start of every chat the agent decides (or asks) which mode applies:

- **Website mode:** you build, change or export a website. The agent works only inside `sites/<slug>` (each site is its own private git repository) and never edits the framework.
- **Maintainer mode:** you improve the framework itself (capabilities, the question catalog, tools, docs). The agent works on a **feature branch**, runs the quality gates (`npm run check`), merges locally and stops. **The agent may push, but asks for your explicit approval every time** (and never force-pushes).

Rules and reasons: `dev/docs/process/modes.md`, `dev/docs/process/git-workflow.md`, `dev/docs/decisions/`.

## For maintainers

```
npm run setup          also activates the git hooks (conventional commits, no commits on main, no push of main, secret guard)
npm run check          format, lint, tests, docs check
npm run smoke          starter template installs and builds from scratch
```

Extend the repo with `dev/docs/process/extending.md` (capability, intake question, skill, tool, template, example). Ideas live in `dev/docs/product/backlog.md`; things found while building sites arrive in `sites/*/brief/FRAMEWORK-FEEDBACK.md`.

## Where to read more
- `CLAUDE.md`: how the agent behaves here
- `framework/WORKFLOW.md`: the stages from idea to delivery
- `framework/intake/`: the question catalog (six rounds)
- `framework/CONVENTIONS.md`: structure and naming
- `framework/capabilities/`: reusable parts
- `dev/docs/`: tool and CMS research
