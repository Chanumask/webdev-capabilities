# Principles

← [CLAUDE.md](../../../CLAUDE.md) · [product index](README.md)

The rules every decision is checked against. If a proposal breaks one, either change the proposal or log a decision that explicitly overrides the principle and says why.

## Product principles

1. **One shot, little tuning.** The intake captures the full context up front, so the first build is close to what the user wants. Every feature that reduces correction rounds beats one that adds options.
2. **The user is not technical.** They answer questions, look at the result, give feedback in plain words. The agent does all engineering and explains consequences, not jargon.
3. **The agent leads.** Website sessions are driven by the agent's questions and proposals; the user never has to know what to ask next. Every reply ends with the next step ([0009](../decisions/0009-agent-led-website-mode.md)).
4. **Recommend, never dictate.** Every technical question has a recommended option with the reason, and the user can always write their own.
5. **Always visible, always shareable.** Every site runs on localhost and exports to one offline HTML file. Nothing requires a deployment to be judged.
6. **High quality is restrained.** Real materials, quiet palettes, one authored motion moment, readable text over scenes, calm fallbacks. Colourful and busy is an explicit choice, not a default.
7. **No invented facts.** Prices, testimonials, statistics, legal data and people are real or visibly marked placeholders.
8. **Customer work stays private.** Sites live in their own repositories, never in the shared framework repo.
9. **Free by default.** Everything that can cost money is proposed with its price and the owner owns every account and the domain ([0010](../decisions/0010-launch-and-handover.md)).
10. **Components are replaceable.** CMS, hosting and domain are independent plug-ins behind small contracts ([0011](../decisions/0011-pluggable-cms-providers.md)); no choice of the first client is baked in. The framework uses open-source tools.

## Engineering principles

1. **Decide before code.** Non-obvious choices are logged in [decisions](../decisions/README.md) when made. Alternatives are evaluated before implementing.
2. **One branch, one topic.** Work happens on feature branches; unrelated findings get their own branch. Squash merge keeps `main` readable. `main` changes only by the local squash-merge and a push the user approved ([0012](../decisions/0012-push-with-approval.md)).
3. **Tests run, not just exist.** Format, lint, tests and the docs check are green before every commit ([quality gates](../process/quality-gates.md)).
4. **Docs are code.** Docs are indexed, linked, size-budgeted and checked by `dev/scripts/check-docs.mjs`.
5. **Capabilities come from shipped work.** A capability is extracted from a finished site and documented with its pitfalls, never invented in the abstract.
6. **Mode discipline.** Website sessions never edit the framework; maintainer sessions never touch customer sites ([0005](../decisions/0005-session-modes.md)).
7. **Sessions hand over cleanly.** Work in flight ends with a [handover block](../process/session-handover.md).
