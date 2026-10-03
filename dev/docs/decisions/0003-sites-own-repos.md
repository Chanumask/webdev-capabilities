# 0003: Customer sites live in their own repositories

Date: 2026-10-03 · Status: active

**Context.** Websites for customers contain their content, briefs, assets and sometimes keys. The framework repository is shared and pushed to GitHub. The first version of the repository committed sites in `sites/`.

**Decision.**
- `sites/*` is git-ignored in the framework repository (only `sites/README.md` is tracked).
- `npm run new-site` runs `git init -b main` in the new site and makes the first commit. Website sessions commit milestones there (`brief:`, `build:`, `change:`).
- Publishing a site (creating a remote repository, pushing, deployment) is a separate approval and a repository the user creates.
- `framework/examples/` and `framework/templates/` are tracked in the framework repository because they are shared reference material.
- `dev/hooks/pre-commit` refuses staged files under `sites/`, `exports/`, `.smoke/` and env files.

**Why.** Customer work stays private and portable, history of a site is independent of framework history, and handing a site to a customer is just handing a repository.

**Rules out.** Sites as folders in the framework history; one repository for all customers.
