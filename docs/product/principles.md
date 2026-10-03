# Principles

← [CLAUDE.md](../../CLAUDE.md) · [product index](README.md)

The rules every decision is checked against. If a proposal breaks one, either change the proposal or log a decision that explicitly overrides the principle and says why.

## Product principles

1. **One shot, little tuning.** The intake captures the full context up front, so the first build is close to what the user wants. Every feature that reduces correction rounds beats one that adds options.
2. **The user is not technical.** They answer questions, look at the result, give feedback in plain words. The agent does all engineering and explains consequences, not jargon.
3. **Recommend, never dictate.** Every technical question has a recommended option with the reason, and the user can always write their own.
4. **Always visible, always shareable.** Every site runs on localhost and exports to one offline HTML file. Nothing requires a deployment to be judged.
5. **High quality is restrained.** Real materials, quiet palettes, one authored motion moment, readable text over scenes, calm fallbacks. Colourful and busy is an explicit choice, not a default.
6. **No invented facts.** Prices, testimonials, statistics, legal data and people are real or visibly marked placeholders.
7. **Customer work stays private.** Sites live in their own repositories, never in the shared framework repo.
8. **Free by default.** The framework uses open-source tools. Anything that can charge money (CMS plans, hosting, form services) is proposed with its cost and never enabled without the user's explicit yes.

## Engineering principles

1. **Decide before code.** Non-obvious choices are logged in [decisions](../decisions/README.md) when made. Alternatives are evaluated before implementing.
2. **One branch, one topic.** Work happens on feature branches; unrelated findings get their own branch. Squash merge keeps `main` readable. `main` changes only by the user's push ([0002](../decisions/0002-git-workflow.md)).
3. **Tests run, not just exist.** Format, lint, tests and the docs check are green before every commit ([quality gates](../process/quality-gates.md)).
4. **Docs are code.** Docs are indexed, linked, size-budgeted and checked by `scripts/check-docs.mjs`.
5. **Capabilities come from shipped work.** A capability is extracted from a finished site and documented with its pitfalls, never invented in the abstract.
6. **Mode discipline.** Website sessions never edit the framework; maintainer sessions never touch customer sites ([0005](../decisions/0005-session-modes.md)).
7. **Sessions hand over cleanly.** Work in flight ends with a [handover block](../process/session-handover.md).
