---
name: triage-feedback
description: Turn feedback from website sessions into framework improvements. Use in maintainer mode when the user asks what to improve, to "triage feedback", "process session reports", or when sites/*/brief/FRAMEWORK-FEEDBACK.md, SESSION-REPORT files or received feedback bundles exist and have not been processed yet.
---

# Triage feedback (maintainer mode)

Policy: [feedback loop](../../../docs/process/feedback-loop.md), [decision 0008](../../../docs/decisions/0008-feedback-loop.md). Reading customer-site feedback files is allowed here; **reading only** `sites/*/brief/FRAMEWORK-FEEDBACK.md` and `sites/*/brief/SESSION-REPORT-*.md`, never other site files, never writing in `sites/`.

## 1. Collect
- Local: `sites/*/brief/FRAMEWORK-FEEDBACK.md`, `sites/*/brief/SESSION-REPORT-*.md`.
- Received: anonymised bundles the user saved in `inbox/` (git-ignored; create it when needed).
- Only items newer than `lastFeedbackTriage` in `.framework-state.json` (if set).

## 2. Group
Cluster by target: intake catalog, agent instructions (skills, `CLAUDE.md`), capability, tool, user docs, design quality. Merge duplicates and count how many sessions or sites mention each. Keep evidence short and **free of customer names, copy, prices and secrets** (they must never reach tracked files).

## 3. Decide with the user
Present the clusters, most frequent and highest priority first. One `AskUserQuestion` call: for the top items, **take now / backlog / won't do**, with a one-line reason each. Mind principles ([principles](../../../docs/product/principles.md)): does it reduce correction rounds, keep the user non-technical, stay private?

## 4. Act (on a feature branch, `feature-workflow` skill)
- Backlog items: add rows to [backlog](../../../docs/product/backlog.md) with the number of sessions that raised them.
- Take now: separate branches by topic (intake change, instruction change, capability, docs). Intake and recommendation changes get a decision entry.
- Won't do: note the reason in the changelog entry so it is not re-litigated.

## 5. Record
Set `lastFeedbackTriage` (ISO date) in `.framework-state.json`. Add a changelog entry "feedback batch" with counts and links, no customer details. Tell the user which sites' notes were processed.
