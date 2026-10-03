# 0006: Tooling and quality gates

Date: 2026-10-03 · Status: active

**Context.** The repository contains Node scripts (`tools/`, `scripts/`, `tests/`), Markdown docs, Astro templates and example projects. Chanumask uses pnpm, Vitest and strict TypeScript for an application; that is more than needed here.

**Decision.**
- npm and plain Node 22.12 or newer. Root dev dependencies: Prettier, ESLint (`@eslint/js`, `globals`).
- Format and lint cover the repo's own scripts (`tools/`, `scripts/`, `tests/`, root config). Examples, templates, sites and capabilities are excluded: they have their own toolchains or are reference code.
- Tests use the built-in `node --test` in `tests/`: hooks (main guard, deletion guard, secret guard, push guard, commit messages), `new-site`, site discovery.
- `scripts/check-docs.mjs` is the docs gate (links, indexes, status, budgets), copied from Chanumask and extended to `framework/`, `capabilities/` and the project skills.
- `npm run check` runs format check, lint, tests and docs check. `npm run smoke` installs and builds the starter from scratch; `smoke:examples` also builds the examples.
- Website quality (screenshots, accessibility, finish review) is checked per site through its acceptance checklist, not through these gates.

**Why.** The smallest toolset that catches real mistakes in this repository, with no heavy dependency tree for people who mostly use it through an agent.

**Rules out.** pnpm workspaces, Vitest, TypeScript project references for the repo's own scripts, mandatory visual regression tests (on the backlog).
