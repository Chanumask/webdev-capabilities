# 0014: Export budgets and variants for heavy assets

Date: 2026-10-08 · Status: active

**Context.** [0007](0007-localhost-and-single-file-export.md) promises one offline HTML file. Photoreal assets (frame sequences, HDRIs, GLB models) are heavy, base64 adds a third, and the exporter inlines only assets referenced from HTML attributes and CSS, so assets loaded by scripts are not inlined at all. Measured in [research 07](../research/07-photorealism-quality-spikes.md): a 60-frame HD sequence is 9 MB (desk) to 16 MB (forest) as one file.

**Decision.**
- The single file stays the default and the export is **WebGL 2 only**. No WebGPU.
- **Budgets for `exports/<slug>/index.html`:** warning at 15 MB, **error at 25 MB** (the usual mail limit). The error names the heaviest assets.
- **`--light`:** poster plus a reduced set (fewer frames, lower resolution), under 6 MB.
- The exporter inlines every asset a page references, including those loaded from scripts (`.hdr`, `.glb`, `.avif`, `.webp`, frame lists), with a known MIME table. Replacement strings use function replacers (minified code contains `$&`).
- **Decoders:** meshopt only (29 KB, WASM already inlined). **No Draco and no KTX2** (about 1.2 MB of base64 WASM, blob workers untested from `file://`). Textures are WebP or AVIF.
- **Frame sequences:** 1920 px AVIF (WebP fallback for Safari before 16.4) is the default and the only set in the single file. **4K is a second set for hosted sites only**, loaded on large or high-density screens with a good connection.
- `playwright-cli` needs a config (`allowUnrestrictedFileAccess`, Edge) to open `file://`; the repo ships it and `export-site` and the smoke test use it.

**Why.** The principle "always shareable" holds for photoreal sites without hiding that they are heavier. Hard numbers make the agent choose frame count and resolution up front instead of discovering the weight at export.

**Rules out.** Unbounded single files; asset folders next to `index.html` as the default; Draco and KTX2 in the export; 4K inside the single file.

**Open.** The lazy 4K upgrade is untested; Firefox and Safari decoding of AVIF data URIs is untested (Edge verified).
