---
name: sanity-check
description: Run this repository's quality gates (format, lint, tests, docs check, starter smoke build) for whatever changed. Use in maintainer mode after any change and always immediately before git commit. Also use standalone to verify the repository is clean.
---

# Sanity check

Operationalizes [quality gates](../../../dev/docs/process/quality-gates.md), which lists the commands and what each covers.

## Run
1. `npm run check` (format check, lint, tests, docs check). Fix every error; treat warnings as things to fix or justify. `npm run format` fixes formatting.
2. Starter, capability or tool change: `npm run smoke` (add `smoke:examples` when scenes or exports are affected, and look at the result in a browser with `playwright-cli` at 390, 820 and 1440 px).
3. Hook or tool behaviour changed: confirm a test in `dev/tests/` covers it.
4. Intake or template change: every question still has `Ask`, `Why`, `Type`, `Options`, `Writes`; technical questions have a recommended option; the brief template has the matching field.
5. Docs-only change: re-read the diff for accuracy and dead links.

## Twice
Run once while context is fresh and again right before `git commit`. A hook block is a signal to fix the cause, not to use `--no-verify`.
