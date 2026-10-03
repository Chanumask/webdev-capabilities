# Documentation rules and lifecycle

← [CLAUDE.md](../../CLAUDE.md) · [process index](README.md)

Docs are what a fresh session reads to get oriented, so their size is a running cost. The failure to avoid: logs that grow into hundreds of KB and get read in full at every session start. Everything here keeps the read set small and the history intact. Adapted from Chanumask ([0001](../decisions/0001-adopt-and-adapt-chanumask-workflow.md)).

## Structure

- Every folder under `docs/` has a `README.md` index: a table of `file | read when...`. Every file in the folder is listed there. `docs/README.md` lists every sub-folder.
- Every doc under `docs/` starts with a back link (`← [CLAUDE.md](...)`), one topic per file, headings not deeper than three levels.
- Link with relative paths. `node scripts/check-docs.mjs` fails on a broken link, an unindexed file, a decision whose status disagrees with its index row, or a blown budget.
- The check also covers `CLAUDE.md`, `README.md`, the project skills, `framework/` and `capabilities/`.

## Size budgets

| Thing | Budget | When exceeded |
|---|---|---|
| Any doc | 300 lines | Split by topic, or move detail into a sub-doc and link it. |
| `docs/changelog.md` (live) | 150 lines | Archive the oldest entries (below). |
| One changelog entry | 25 lines, plus a handover block of at most 15 | Cut it. The *why* belongs in a decision, the *how* in git. |
| One decision file | 60 lines | Split, or link a design doc. |
| Decision index | one line per decision | Never prose in the index. |
| `CLAUDE.md` | 100 lines | Move content into `docs/` and link it. |

## What goes where

| Question | Home |
|---|---|
| What was decided, and why? | `docs/decisions/NNNN-slug.md` |
| What happened this session? | `docs/changelog.md`, short entry with links |
| What should the next session do? | Handover block at the end of the newest changelog entry |
| How do we work (framework repo)? | `docs/process/` |
| How is a website made (user process)? | `framework/` (workflow, conventions, intake) |
| Reusable building blocks | `capabilities/<name>/README.md` |
| Tool and CMS research | `docs/research/` |
| Ideas not yet built | `docs/product/backlog.md` |

## Decisions: one file each

`docs/decisions/NNNN-short-slug.md` with a fixed header: `# NNNN: Title`, then `Date: YYYY-MM-DD · Status: active | superseded | archived`, then Context / Decision / Why / Rules out. The index has one line per decision. A superseded decision keeps its file, its status changes, and the new decision links back. Use the `decision-log` skill.

## Changelog: short, then archived

Entry format: date, kind, title, then 3 to 10 bullets of *what changed* with links to decisions and branches. No essays. When the live file passes its budget run `node scripts/archive-changelog.mjs`: it moves the oldest entries, text unchanged, to `docs/archive/changelog-YYYY-MM.md` and never touches the newest entry (it may hold the handover).

## Deleting old context

Archive first (a move, not a deletion). Git is the real archive. Deleting any file or doc is a user decision every time ([0004](../decisions/0004-no-deletion-without-approval.md)); Claude proposes exactly what and waits. Superseded decisions stay with a status line.

## Session-start read set (maintainer mode)

`CLAUDE.md` (auto-loaded), [principles](../product/principles.md), the decision index, the top changelog entry, then only the category docs the topic needs.
