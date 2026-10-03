# Handover: __NAME__

Created __DATE__. This folder contains everything needed to run and change the website without the people who built it.

## What you have
- **The website:** https://__CANONICAL_HOST__ (hosting: __HOST__).
- `offline-copy/`: the site as plain files; double-click `index.html` to open it in any browser without internet.
- `site-source.zip`: the complete source code (a developer can rebuild and change everything from it).
- `CLIENT-GUIDE.md`: how to change content and what to do if something breaks (read this first).
- `ACCOUNTS-AND-ACCESS.md`: which accounts exist, who owns them, where bills go (no passwords in this file).
- `records/`: the design brief (what was agreed and why), acceptance checklist, change log, design system.
- `LAUNCH-RECORD.md`: how the site was put online, with the DNS records used.

## How it is built, in plain words
The website is a set of fast, simple pages that are built once and then served from the hosting provider. It does not run a database or a server of its own, so it is cheap, quick and hard to hack. Texts and items that change are edited in the **content system** (see the guide) or by asking the person who maintains the site. The look and the animation are part of the code and are not meant to be changed by editors.

## The four things that make a website
| Thing | Where it is | Who owns it |
|---|---|---|
| Domain name (the address) | registrar: ______ | the owner |
| DNS (the address book entries) | ______ | the owner |
| Hosting (where the files are served from) | __HOST__ | the owner |
| Content system | ______ | the owner |
Never let a developer or agency be the only owner of the domain or the hosting account.

## Yearly costs and renewals
See `LAUNCH-RECORD.md` section 7 and `ACCOUNTS-AND-ACCESS.md`. Put the renewal dates in a calendar.

## Changing the website later
1. Content (texts, items, prices): follow `CLIENT-GUIDE.md`.
2. Anything else (new section, new look, new feature): write down what you want and why, and give the source (`site-source.zip` or the repository) and `records/BRIEF.md` to your developer or to the same agent workflow.
3. After any change: open the site on a phone and a computer, and test the contact form.

## Backups
The source code is in the site repository and in `site-source.zip`. Content in the content system is kept by that service; export it once a quarter if it is important. The hosting provider keeps previous versions of the site and can roll back.

## Support and responsibilities
| Topic | Contact |
|---|---|
| Content questions | ______ |
| Technical problems | ______ |
| Domain or hosting billing | the account owner |

## Ending the collaboration
Check that every account in `ACCOUNTS-AND-ACCESS.md` is in the owner's name, that two-factor login and recovery codes are with the owner, and that former helpers are removed from every service.
