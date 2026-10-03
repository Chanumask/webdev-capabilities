# 0013: Clean repository root

Date: 2026-10-03 · Status: active

**Context.** The root had about 30 entries (framework folders, tools, tests, docs, configs, tool output). Users who only build websites could not tell what matters, and editors such as Zed show every dotfile.

**Decision.**
- The root holds only what a website-mode user needs plus unavoidable files: `README.md`, `CLAUDE.md`, `package.json` (+ lockfile), `sites/`, `exports/`, and the folders `framework/` and `dev/`.
- `framework/` is everything the agent builds from: workflow, conventions, `intake/`, `launch/`, `templates/` (brief and launch templates, and `starter/`), `capabilities/`, `examples/`, `tools/` (the commands).
- `dev/` is the maintainer area: `docs/`, `scripts/` (docs check, changelog archive, smoke test), `tests/`, `hooks/`, `config/` (Prettier, ESLint, commit message template).
- Hidden entries in the root are limited to what tools require at that location: `.git`, `.gitignore`, `.gitattributes`, `.editorconfig`, `.claude` (skills, agents, settings, local setup state in `.claude/framework-state.json`) and `.zed/settings.json`, which hides tool output and `node_modules` from the Zed file tree.
- `core.hooksPath` is `dev/hooks`; `npm run setup` sets it. Prettier and ESLint run with explicit `--config` paths (`npm run format|lint`, hooks).
- `examples/` and `templates/` are resolved under `framework/` by `framework/tools/lib.mjs`; `sites/` stays at the root.

**Why.** A reader sees what to use (`sites/`, `exports/`) and what is machinery, without losing any behaviour. Tool-specific root files could not be removed, only reduced.

**Rules out.** Framework internals in the root; moving `sites/` or `exports/` (users work there); relocating `.editorconfig` or `.claude` (tools expect them at the root).

**Note.** Clones made before this change have `core.hooksPath=.githooks`; run `npm run setup` once to point it at `dev/hooks`.
