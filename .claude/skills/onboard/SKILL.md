---
name: onboard
description: Set up this repository on a fresh machine and report status. Use when the repository was just cloned, when the user says "set up", "setup", "einrichten", "get started", "what can this do", when .framework-state.json is missing, or when the user asks what is installed and what to do next.
---

# Onboard: set up, report, offer next steps

## 1. Run the setup
From the repository root run `npm run setup` (use `npm run setup:quick` to skip the example build). It checks Node, npm and git, activates the repository git hooks (commit and push guards), installs the Playwright CLI if missing, prepares the Impeccable design tool, verifies the framework skills, installs and builds the example site as a smoke test and writes `.framework-state.json`. If a step fails, read the FAIL line, fix the cause (for example install Node 22+, install Chrome or Edge, set `git config user.name/email`) and run the setup again. Do not hide failures.

Do not push, publish, create accounts or spend money during setup.

## 2. Report status (plain language, short)
Tell the user, in their language:
- **Set up:** what is now installed and working (Node, git, browser checks, design tool, skills, example site).
- **Needs attention:** anything that failed or is optional (git identity, GitHub remote, browser).
- **What exists:** `sites/` (their sites, usually empty at first), `examples/` (reference projects).
- **How it works in one paragraph:** you ask, I interview you in rounds, you approve a brief, I build it on localhost, you give feedback, I export a single HTML file.

Mention that sessions run in one of two modes (website mode for building sites, maintainer mode for improving the framework) and that the agent asks which one at session start.

## 3. Offer the next steps
End with one `AskUserQuestion` call (options as below, adapted to what exists; "Other" is automatic):
- **Start a new website (Recommended):** run the design intake (`new-site` skill)
- **Edit an existing website:** list `sites/` and open the `change-site` skill (only offer when at least one site exists)
- **Look at the example:** start `examples/lindenhof` with `npm run dev -- lindenhof`, give the localhost address and explain how to scroll through it
- **Ask questions about this repository:** explain the workflow, the question rounds, the tools, the CMS options; answer from `README.md`, `CLAUDE.md`, `framework/` and `docs/`

Then continue with the chosen path. If the user picks questions, answer and offer the options again afterwards.
