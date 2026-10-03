# Backlog

← [CLAUDE.md](../../../CLAUDE.md) · [product index](README.md)

Ideas for the framework, not yet built. A mid-task idea is written here, not started. Promote an item by opening a feature branch for it. Items found by website sessions arrive through each site's `brief/FRAMEWORK-FEEDBACK.md`; maintainer sessions fold them in here.

| Item | Kind | Why | Cost |
|---|---|---|---|
| Verify the Wix provider against a real Wix site (collection, API key, automation to a deploy hook) | capability | core is only tested against a mock of the documented API | needs a Wix account (the maintainer has one) |
| Deploy automation (wrangler pages deploy, deploy hooks) behind explicit approval | tool | launch is guided by hand today | medium, needs accounts |
| Registrar and DNS provider specific click-by-click guides | docs | the launch guide is generic | small |
| Next-step driver as a real state machine with tests per skill | tool | status.mjs infers state from files | medium |
| Sanity provider with schema generator from the brief | capability | default CMS recommendation | small |
| Image gallery with lightbox | capability | common portfolio need | small |
| Multi-language routing (de/en) | capability | intake offers it, nothing implements it | medium |
| Blog with RSS | capability | news and magazine sites | small |
| Privacy-friendly map section | capability | contact pages | small |
| Video hero with poster and reduced-motion fallback | capability | alternative to 3D | small |
| glTF model loader path for 3D scenes | capability | realism ceiling of procedural primitives | medium |
| Deploy workflow (Cloudflare Pages, build hooks) | tool | intake offers hosting, no automation exists | medium, needs accounts |
| Visual regression screenshots across breakpoints | tool | catches layout regressions after changes | medium |
| Intake dry-run fixtures (scripted answers) | test | verifies the question catalog produces a complete brief | medium |
| Intake round for existing-site redesigns (audit first) | question | "improve my current site" is a frequent start | small |
| Starter variants (one-pager, listings, portfolio) | template | faster start for common types | medium |
| Automatic anonymisation check for feedback bundles (names, prices, emails) | tool | the wrap-up bundle is reviewed by hand today | small |
| Setup check on macOS and Linux | tooling | only Windows was tested | small |
