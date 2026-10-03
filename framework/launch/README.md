# Launch and handover

What happens after the user is happy with a website: put it online on a real domain, hand it over to the owner. Website mode only. The agent leads every step ([next steps](../NEXT-STEPS.md)); the user does what only the owner can do (accounts, payments, domain ownership).

| File | Read when... |
|---|---|
| [domains-explained.md](domains-explained.md) | Explaining domain, registrar, DNS, hosting, email and the standard connection procedure to a beginner |
| [hosting-options.md](hosting-options.md) | Choosing a host; CMS rebuild hooks; costs |
| [launch-playbook.md](launch-playbook.md) | Running the launch: phases A to F with questions, tools and approvals |
| [handover.md](handover.md) | Preparing the handover package and the owner walkthrough |

Templates copied into each site by `npm run launch-prep`: `framework/templates/launch/` (LAUNCH, HANDOVER, CLIENT-GUIDE, ACCOUNTS).

## Commands
```
npm run status -- <site>                      stage and proposed next steps
npm run launch-prep -- <site> --domain d.de   prepare files, guide, front matter (no network)
npm run launch-check -- <site>                pre-launch checks on the built site
npm run cms:check -- <site>                   test the CMS connection from the site's .env
npm run dns-check -- <domain>                 what the internet sees for the domain
npm run handover -- <site>                    handover package in exports/<site>-handover/
```

## Boundaries
No account creation, payment, DNS change, deployment or repository creation without the user's explicit yes for that action. No secrets in chat or in files that are committed. Decision: [0010](../../docs/decisions/0010-launch-and-handover.md).
