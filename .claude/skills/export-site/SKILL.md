---
name: export-site
description: Export a website as one standalone HTML file (or zip) that can be sent to anyone and opened offline with all animations. Use when the user wants to send, share, mail or hand over a site, or asks for "export", "Datei zum Verschicken", "HTML file".
---

# Export a site as a single file

1. Identify the site (`npm run list`).
2. Run `npm run export -- <slug>` from the repository root (add `-- --zip` for a zip). It builds the site and writes `exports/<slug>/index.html` with all scripts, styles, fonts and images inlined (other pages become sub-folders with relative links).
3. **Test it** from disk: open `file:///.../exports/<slug>/index.html` with `playwright-cli`, check the console for errors, scroll through the animation, check forms and navigation.
4. Tell the user where the file is, its size, and that it opens by double-click in any modern browser without internet. Mention limits: forms in the export are demos unless a form service is configured; CMS-driven content is frozen at export time; very large 3D scenes need a desktop browser.
5. If the user wants a live link instead, hand over to the `launch-site` skill (it explains domains and hosting and guides the launch); never create repositories or publish without an explicit yes.

## Next step
Agent-led ([NEXT-STEPS](../../../framework/NEXT-STEPS.md)): when this skill finishes, run `npm run status -- <slug>`, say where the site stands and offer the next step with `AskUserQuestion` (recommended first). Never end with an open "let me know".
