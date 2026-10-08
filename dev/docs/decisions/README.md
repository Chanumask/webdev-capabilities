# Decisions

← [CLAUDE.md](../../../CLAUDE.md) · [docs index](../README.md)

One short file per decision, format in [documentation.md](../process/documentation.md). This index is what sessions read at start; open an entry when its topic comes up. Newest last. Add entries with the `decision-log` skill.

| # | Decision | Status | Date |
|---|---|---|---|
| [0001](0001-adopt-and-adapt-chanumask-workflow.md) | Adopt the Chanumask workflow, adapted: modes, pushes need approval, sites in own repos, npm tooling | active | 2026-10-03 |
| [0002](0002-git-workflow.md) | Feature branches, local squash-merge by the agent (push rule amended by 0012) | active | 2026-10-03 |
| [0003](0003-sites-own-repos.md) | Customer sites live in their own git repositories, ignored by the framework repo | active | 2026-10-03 |
| [0004](0004-no-deletion-without-approval.md) | Nothing is deleted without explicit approval; merged feature branches excepted | active | 2026-10-03 |
| [0005](0005-session-modes.md) | Two session modes: website mode and maintainer mode, chosen at session start | active | 2026-10-03 |
| [0006](0006-tooling-and-quality-gates.md) | npm, Prettier, ESLint, node --test, docs check, starter smoke build | active | 2026-10-03 |
| [0007](0007-localhost-and-single-file-export.md) | Localhost preview and a single-file offline export built from dist | active | 2026-10-03 |
| [0008](0008-feedback-loop.md) | Feedback loop: wrap-up report in website sessions, optional anonymised bundle, triage-feedback in maintainer mode | active | 2026-10-03 |
| [0009](0009-agent-led-website-mode.md) | Website mode is agent-led: status driver, proposed next step after every stage | active | 2026-10-03 |
| [0010](0010-launch-and-handover.md) | Launch and handover workflow: owner owns accounts, no account or payment without a yes, tools to prepare and verify | active | 2026-10-03 |
| [0011](0011-pluggable-cms-providers.md) | CMS providers are plug-ins behind one contract; Wix is the first provider, REST with an API key | active | 2026-10-03 |
| [0012](0012-push-with-approval.md) | The agent may push, but only after asking for explicit approval each time; amends the push rule of 0002 | active | 2026-10-03 |
| [0013](0013-repository-structure.md) | Clean repository root: sites/ and exports/ for users, framework/ for the machinery, dev/ for maintainers | active | 2026-10-03 |
| [0014](0014-export-budgets-and-variants.md) | Export budgets (warn 15 MB, error 25 MB), `--light`, script-referenced assets inlined, meshopt only, HD frames in the file, 4K hosted only; amends 0007 | active | 2026-10-08 |
| [0015](0015-realism-tiers.md) | Realism tiers T0 to T3 (T4 backlog), defaults by subject, a stop gate before long renders | active | 2026-10-08 |
| [0016](0016-blender-as-local-asset-tool.md) | Blender 5.2 as a local tool: headless scripts for batch work, blender-mcp only in the main session, GLB validation | active | 2026-10-08 |
| [0017](0017-asset-licensing-and-ledger.md) | Asset licensing: CC0 and CC-BY only, vendored files, an ASSETS.md ledger per site | active | 2026-10-08 |
