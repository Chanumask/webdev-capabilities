# webdev-capabilities

A framework for creating **high-end websites with Claude Code**, including animated 3D scenes, without needing to be technical.

## How you use it

1. Open this folder in Claude Code.
2. Say what you want, e.g. **"I want a new website for my architecture studio."**
3. Claude asks you questions in several rounds: what and why, who it is for, content, look and feel, animation, technology (with a recommended answer for every technical choice), and then a final review. Answer quickly or in detail. "You decide" is always allowed.
4. You approve the summary. Claude builds the site in one go.
5. You look at it in your browser on **localhost** (Claude gives you the address) and send feedback in plain words.
6. When you want to share it: ask for an **export**. You get one HTML file that opens by double-click, offline, with all animations.

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
npm run new-site -- <slug> "Name"   create a site from the starter
npm run dev -- <slug>               show it on localhost
npm run stop -- <slug>              stop it
npm run build -- <slug>             production build
npm run export -- <slug>            one offline HTML file in exports/<slug>/
npm run list                        all sites, examples, templates
```

Try the reference: `npm run dev -- lindenhof`.

## Requirements
Node.js 22 or newer, npm, git, a browser. Claude Code with the Impeccable and Playwright skills (already in `.claude/skills`).

## Where to read more
- `CLAUDE.md`: how the agent behaves here
- `framework/WORKFLOW.md`: the stages from idea to delivery
- `framework/intake/`: the question catalog
- `framework/CONVENTIONS.md`: structure and naming
- `docs/`: tool research
