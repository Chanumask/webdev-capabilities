# tools-dev

Developer tools that are not part of the site build.

`thumbs.astro` + `thumbs.ts` render stills (listing thumbnails, section images) from the 3D kit.

To regenerate: copy `thumbs.astro` to `src/pages/thumbs.astro` and `thumbs.ts` to `src/scripts/thumbs.ts`, start the site (`npm run dev -- lindenhof`), open `/thumbs`, screenshot each `<img id>` into `public/thumbs/<id>.jpg` with `playwright-cli screenshot "#<id>" --filename=... --type jpeg`, then delete the two copied files again.
