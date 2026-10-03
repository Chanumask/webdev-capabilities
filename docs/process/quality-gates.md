# Quality gates

← [CLAUDE.md](../../CLAUDE.md) · [process index](README.md)

The checks that run, without being asked, whenever the framework repository changes in maintainer mode. Run them once while context is fresh and again right before committing, because fixes can break something else. Tooling decision: [0006](../decisions/0006-tooling-and-quality-gates.md).

| Gate | Command | Covers |
|---|---|---|
| Format | `npm run format:check` (Prettier; `npm run format` fixes) | `tools/`, `scripts/`, `tests/`, config files |
| Lint | `npm run lint` (ESLint, recommended rules) | the same scripts |
| Tests | `npm test` (`node --test`) | hooks (main guard, deletion guard, secrets, push guard, commit messages), `new-site`, site discovery |
| Docs | `npm run check:docs` | links, indexes, decision status, size budgets |
| All of the above | `npm run check` | |
| Smoke | `npm run smoke` (`:examples` for the reference sites) | starter template installs and builds from scratch |

## Rules

- **Anything reported gets fixed.** No warnings left outstanding.
- **New code gets tests, and the tests are run.** A bug fix gets a test that fails against the old behaviour.
- **Tools and hooks:** every change to a hook or tool behaviour has a test in `tests/`.
- **Starter or capability changes:** run `npm run smoke`; for changes that affect scenes or exports also `npm run smoke:examples` and look at the result in a browser with `playwright-cli` (screenshots at 390, 820 and 1440 px).
- **Intake or framework doc changes:** `npm run check:docs`, then re-read the diff for accuracy: every question still has an `Ask`, `Why`, `Type`, `Options` (with a recommended option for technical questions) and `Writes` field, and the brief template has a matching field.
- **Docs-only changes** need the docs gate and a re-read of the diff for dead or wrong statements.
- **Skills (`.claude/skills`)**: the frontmatter has `name` and a `description` that says when to use it; the body points at docs instead of restating them.
- The `pre-commit` hook is a backstop, not a substitute. `--no-verify` is not a reflex: if a hook blocks, fix the cause.

Use the `sanity-check` skill to run these in order.

## Website sessions

Customer sites do not use these gates. They use the site's own `brief/ACCEPTANCE.md`, the Impeccable detector and finish review, and browser checks ([workflow](../../framework/WORKFLOW.md)).
