# Tool Evaluation

Stats via GitHub API on 2026-10-03. Verdicts are my judgement, not benchmarks.

## The five recommended tools

### 1. Impeccable (https://impeccable.style) — **Use (core)**
- Repo `pbakaus/impeccable`, Apache-2.0, ~74k stars, created Nov 2025, pushed daily. Most actively maintained of the list.
- A design vocabulary plus commands for agents: `audit`, `polish`, `typeset`, `layout`, `colorize`, `animate`, `delight`, `distill`, `clarify`, and an anti-"AI slop" detector (site claims 61 checks, run by a local binary, no API calls).
- Works on *existing* output: it critiques and refines, which is what you want when iterating with a client.
- Installed here (project scope, no hooks): `npx impeccable install --yes --project --providers=claude --no-hooks`. Run `/impeccable init` once per project to capture design context.
- Caveat: installs a native binary and four subagents into `.claude/`. Hooks were skipped; add them later for automatic checks while editing.

### 2. Playwright CLI (`@playwright/cli`) — **Use (core)**
- Microsoft. Drives a real browser from the terminal and ships a skill, so Claude can open the page, screenshot it, click, check responsive breakpoints and console errors.
- Why it matters for 3D/animation sites: Claude cannot judge visuals it cannot see. This closes the loop (build, screenshot, fix).
- Installed here: `npm i -g @playwright/cli@latest`, then `playwright-cli install --skills` (Node 20+). Uses installed Edge by default.
- Output folder `.playwright-cli/` may contain credentials; it is git-ignored.
- Alternative: the Claude-in-Chrome extension, for your real logged-in browser. Playwright is better for repeatable/headless checks.

### 3. Taste Skill (https://www.tasteskill.dev) — **Optional**
- Repo `Leonxlnx/taste-skill`, MIT, ~92k stars, created Feb 2026. Install: `npx skills add Leonxlnx/taste-skill` (`design-taste-frontend`).
- Rules to avoid generic output: brief inference (industry/audience/mood), design-system mapping, dark-mode protocol, pre-flight checks, redesign-audit mode.
- v2 is flagged **experimental**; wording may change before stable.
- It overlaps with Impeccable (both steer the agent's taste). Running both risks conflicting rules. Suggestion: Impeccable by default; try Taste on one greenfield project and compare. Not installed here.
- Star counts this high this fast are partly hype; judge by output on your own briefs.

### 4. awesome-claude-design (https://github.com/VoltAgent/awesome-claude-design) — **Reference only**
- 68 `DESIGN.md` files modelled on brands (Stripe, Vercel, Spotify, Ferrari...). MIT, ~4k stars, last push June 2026.
- Not a skill and not code. Designed to be uploaded to Anthropic's Claude Design workspace. Otherwise you can paste a DESIGN.md into a prompt as a style reference.
- Caveat: these imitate real brands. Use for mood and structure; don't copy a brand's identity for a client.

### 5. img2threejs (https://github.com/img2threejs/img2threejs) — **Situational**
- Turns a reference image into a procedural, code-only Three.js model (no mesh files), with quality gates. Python 3.10+, stdlib only. Apache-2.0, ~17k stars, created July 2026. (Its page text claims v2.0.0 in Jan 2025, which contradicts the creation date; treat self-descriptions with caution.)
- Good fit: stylised hero objects and simple props that stay tiny in file size.
- Poor fit: realistic or complex models, characters. For those use real GLB assets (Blender, licensed Sketchfab models, or an image-to-3D service) loaded with `GLTFLoader`.
- Install: `git clone https://github.com/img2threejs/img2threejs.git .claude/skills/img2threejs`. Not installed here. Read the code first (90+ Python modules run locally).

## Alternatives worth knowing

| Tool | What | Verdict |
|---|---|---|
| **Three.js + GSAP ScrollTrigger + Lenis** | The actual 3D/animation engine behind most award-style sites | In the starter. Core. |
| **React Three Fiber + drei** | Declarative Three.js for React | Only if a project needs React/complex state; Astro + vanilla Three is lighter. |
| **Spline / Rive** | Visual 3D / interactive animation editors, embeddable | Great when a designer builds the asset and Claude wires it up. |
| **Blender to GLB (Draco/meshopt)** | Real 3D assets | Needed for anything realistic. |
| **Anthropic `frontend-design` skill/plugin** | Official anti-generic-design skill | Lighter than Impeccable/Taste; check the `/plugin` marketplace. |
| **Community 3D skills** (e.g. freshtechbro/claudedesignskills: R3F, GSAP, shaders) | Reference knowledge for Claude | Unvetted. Skim the SKILL.md first; often unnecessary since Claude already knows these libraries. |
| **shadcn/ui, Magic UI, Aceternity UI** | Component libraries with animated effects | Good for non-3D sections. |

## Recommended combo
**Impeccable + Playwright CLI**, with a Three.js/GSAP stack. Add Taste or img2threejs per project only when it earns its place. More skills means more context noise and conflicting instructions.

## Security note
Skills are instructions that run with your permissions, and some ship binaries or scripts. Read what you install, prefer project scope over global, and pin versions for client work.
