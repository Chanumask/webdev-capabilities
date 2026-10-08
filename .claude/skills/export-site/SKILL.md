---
name: export-site
description: Export a website as one standalone HTML file (or zip) that can be sent to anyone and opened offline with all animations. Use when the user wants to send, share, mail or hand over a site, or asks for "export", "Datei zum Verschicken", "HTML file".
---

# Export a site as a single file

1. Identify the site (`npm run list`).
2. Optional first look at the weight: `npm run weight -- <slug>` (heaviest files and the estimated size of the single file). Then run `npm run export -- <slug>` from the repository root (add `-- --zip` for a zip). It builds the site and writes `exports/<slug>/index.html` with all scripts, styles, fonts, images and every asset a script loads (frames, HDRI, models) inlined (other pages become sub-folders with relative links). It reports the heaviest assets and warns above 15 MB; above 25 MB it fails with exit code 2 ([0014](../../../dev/docs/decisions/0014-export-budgets-and-variants.md)). `-- --light` makes a lighter copy to send (images re-encoded to at most 960 px, pages get `window.__LIGHT_EXPORT = true` so a scene can load a reduced asset set); `-- --max-mb=N` accepts a bigger file after the user agreed.
3. **Test it** from disk. `playwright-cli` blocks `file:` URLs by default, so use the second config that `npm run setup` writes: `playwright-cli open --config .playwright/file.config.json file:///.../exports/<slug>/index.html` (if the file is missing, run `npm run setup`). Check the console for errors, scroll through the animation, check forms and navigation.
4. Tell the user where the file is, its size, and that it opens by double-click in any modern browser without internet. Mention limits: forms in the export are demos unless a form service is configured; CMS-driven content is frozen at export time; very large 3D scenes need a desktop browser.
5. If the user wants a live link instead, hand over to the `launch-site` skill (it explains domains and hosting and guides the launch); never create repositories or publish without an explicit yes.

## Next step
Agent-led ([NEXT-STEPS](../../../framework/NEXT-STEPS.md)): when this skill finishes, run `npm run status -- <slug>`, say where the site stands and offer the next step with `AskUserQuestion` (recommended first). Never end with an open "let me know".
