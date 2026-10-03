# Extending the repository

← [CLAUDE.md](../../CLAUDE.md) · [process index](README.md)

How to add the things this framework is made of. All of it is maintainer-mode work on a feature branch ([git workflow](git-workflow.md)) with the [quality gates](quality-gates.md).

## A new capability (`capabilities/<name>/`)

1. **Start from shipped work.** Build it in a real or example site first; extract only what worked.
2. Create `capabilities/<name>/README.md` with: use when, needs, integration steps, design rules, pitfalls (all hit during development), verification. Put working code next to it.
3. Add a row to `capabilities/README.md`.
4. If users should be able to choose it, add an option to the matching intake question (below) and a field in the brief template.
5. If the starter should include it by default, change `templates/starter/` and run `npm run smoke`.
6. Log a decision if the capability implies a stack choice (`decision-log` skill). Changelog entry.

## A new or changed intake question (`framework/intake/`)

1. Pick the round by purpose ([round index](../../framework/intake/README.md)). Keep rounds short and ordered from broad to detailed.
2. Use the question format: `Ask`, `Why`, `Type`, `Options`, `Follow-up`, `Writes`. Technical questions carry a recommended option, first in the list, with the reason.
3. Add the matching field to `framework/templates/brief/BRIEF.md` (the "Writes" target) and, if relevant, to `ACCEPTANCE.md`.
4. Check the rules in [intake README](../../framework/intake/README.md): plain language, at most four questions per call, no invented facts.
5. Scope `intake`. Changing a **recommendation** is a decision: log it with the reason.

## A new skill (`.claude/skills/<name>/SKILL.md`)

Frontmatter `name` and a `description` that says when it triggers. The body points at docs instead of restating them. Add it to the skills list in `CLAUDE.md`, to `scripts/check-docs.mjs` (so its links are checked) and to the setup skill check in `tools/setup.mjs`. Scope `skills`.

## A new tool or command (`tools/`, `package.json` script)

Write the script with a usage header, a test in `tests/`, a row in the command table of [`framework/CONVENTIONS.md`](../../framework/CONVENTIONS.md) and in the root `README.md`. Scripts must work with `WEBDEV_SITES_DIR` set (tests use a temporary folder). Scope `tools`.

## A starter or template change (`templates/starter/`)

Keep it minimal: everything optional is a capability. Placeholders use `__SLUG__`, `__NAME__`, `__DATE__`. `npm run smoke` must pass. Existing sites are not migrated automatically; say so in the changelog.

## A new example (`examples/<slug>/`)

Only finished, high-quality projects that teach something. Include `brief/BRIEF.md`, `DESIGN.md`, `PRODUCT.md`. Add it to `examples/README.md`; extract reusable parts into `capabilities/`.

## Checklist before merge-back

- One topic, one branch; all gates green; docs and indexes updated; backlog item removed or updated; changelog entry; decision logged if non-obvious; handover block if the user still has to push `main`.
