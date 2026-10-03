# Handover

Used by the `handover-site` skill after the site is live (`launch: live`). Goal: the owner can run, change and pay for the site without the builders.

## Steps
1. **Package:** `npm run handover -- <slug>` creates `exports/<slug>-handover/` with the owner's README, `CLIENT-GUIDE.md`, `ACCOUNTS-AND-ACCESS.md`, the launch record, the brief, acceptance list, change log, `PRODUCT.md`, `DESIGN.md`, an offline copy and `site-source.zip` (git archive of the site repository). It sets `handover: done`.
2. **Fill the gaps** with the user before giving it away: contact persons, registrar and DNS names, CMS address, renewal dates, real prices. Check that no passwords, API keys or recovery codes are in any file.
3. **Ownership check** with the user: every account is in the owner's name, two-factor is on, recovery codes are with the owner, helpers have their own named access.
4. **Owner walkthrough** (agent explains in plain language, user relays or sits with the owner): how to edit content (CMS), how changes go live (rebuild takes minutes), what costs money and when it renews, what to do when something is wrong, who to call.
5. **Repository:** if a remote repository for the site is wanted, the owner creates it in their GitHub account; the agent adds the remote and pushes only after the user's explicit yes. Otherwise `site-source.zip` is the backup.
6. **Maintenance offer:** state clearly how content, design and technical changes are requested afterwards (see `change-site`), and that the brief and `DESIGN.md` are the reference for any developer.
7. **Close:** update `brief/CHANGELOG.md`, set the brief `status: delivered`, offer `wrap-up`.

## Quality checks before saying "handed over"
- The live site was tested on a phone and a computer after the last change.
- The handover README names real people, services and renewal dates (no blanks that matter).
- The owner can log in to every listed account.
