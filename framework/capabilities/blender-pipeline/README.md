# Capability: Blender pipeline

Renders photographic frames and exports web models with headless Blender, driven by the agent. The user never opens Blender. Decisions: [0015 tiers](../../../dev/docs/decisions/0015-realism-tiers.md), [0016 Blender](../../../dev/docs/decisions/0016-blender-as-local-asset-tool.md), [0017 licensing](../../../dev/docs/decisions/0017-asset-licensing-and-ledger.md). Evidence: [quality spikes](../../../dev/docs/research/07-photorealism-quality-spikes.md).

## Use when
The brief picks realism tier **T3** (rendered frames scrubbed by scroll) or **T2** (real-time GLB models). Not for stylised T0 sites.

## Needs
- Blender 5.x on the machine (found automatically, or set `BLENDER`). `npm run blender -- check` shows version and render device. Nothing is installed by this repo.
- A site with `sharp` (Astro includes it) for `frames`.

## Commands
| Command | What it does |
|---|---|
| `npm run blender -- check` | finds Blender, prints version and GPU (OptiX, CUDA, CPU) |
| `npm run blender -- selftest` | renders a 64 px test image through the library |
| `npm run assets -- add <site> models/<id> [--res 2k]` | downloads a CC0 Poly Haven model, texture or HDRI once into `assets/polyhaven/` and adds a row to `ASSETS.md`. Over 50 MB needs `--allow-large` |
| `npm run blender -- render <site> scenes/<name>.py [--set desktop\|phone\|both] [--samples N] [--n N] [--only I]` | runs a scene script. Sets: desktop 1920 x 1080, phone **portrait** 810 x 1440. Output `renders/<name>/<set>/` |
| `npm run blender -- run <site> scenes/<script>.py [--out public/models]` | any script, for example GLB export; every GLB written is validated |
| `npm run blender -- frames <site> <name> [--fmt avif\|webp] [--quality Q]` | encodes renders into `public/frames/<name>/{desktop,phone}/NNN.avif`, posters and `manifest.json`, and prints the estimated size inside the single-file export |
| `npm run blender -- validate <file.glb ...>` | checks that every texture of a GLB has an image and every buffer view fits |

## Flow for a T3 scroll sequence
1. Pick assets (models, textures, an HDRI), `npm run assets -- add ...`. Check licence and size in `ASSETS.md`.
2. Copy `templates/scene-sequence.py` to `sites/<site>/scenes/<name>.py` and adapt it. The library is `lib/webdev_bpy.py` (`import webdev_bpy as wb`).
3. **Look before you render:** `render ... --only 0 --samples 32`, then show the still to the user and wait for approval (stop gate, decision 0015).
4. Render both sets (`--set both`; HD frames at 128 samples took 10 s per frame for a desk, 26 s for a forest on an RTX 3090 Ti), then `frames`.
5. In the page: a 2D canvas drawing `ImageBitmap`s decoded from `public/frames/<name>/` (the manifest lists frame counts), the phone set below 800 px. Text over frames needs a gradient scrim and is checked at every chapter anchor.
6. Export with `npm run export -- <site>`; frame URLs in script strings are inlined ([0014](../../../dev/docs/decisions/0014-export-budgets-and-variants.md)).

## Flow for T2 models
`templates/export-glb.py` exports models as web GLBs (1024 px WebP textures, meshopt, no lights). The tool validates the result. If WebP leaves a missing image (single-channel maps such as Poly Haven glass roughness) the library writes that GLB with JPEG textures and says so.

## Design rules that worked
- Scanned models and materials carry the realism; hand-built boxes read as CG. Use as little self-made geometry as possible, and say so when a building needs it.
- A real HDRI for ambient light, one key light, long lens (85 mm) and f/2.8 to f/5.6 for objects; a level camera for buildings.
- 128 samples with denoise at 1920 px; 48 samples was too soft at 1280 px.
- 60 frames per sequence are enough for a four-chapter page; 120 double size and render time.
- Phones get their own portrait render; a cropped 16:9 frame loses the subject.

## Pitfalls (all hit in the spikes)
- A **world volume** (fog) renders the sky black. Use `fog_box`.
- `KHR_materials_transmission` and Fresnel-glass: use `glass()` (no refraction, no caustic noise) for windows; transmission forces an extra pass in three.js.
- Scanned trees are 0.5 to 1 GB as glTF: fine for Cycles (import takes 25 s), unusable in real time.
- `String.replace` with minified code as replacement corrupts it (`$&`); use function replacers (the exporter does).
- Blender's Python ignores `PYTHONPATH`; the tool adds the library folder to `sys.path` itself.
- blender-mcp is a single shared live Blender: never in parallel workers ([0016](../../../dev/docs/decisions/0016-blender-as-local-asset-tool.md)).
- `playwright-cli` needs `.playwright/file.config.json` (written by `npm run setup`) to open exports from `file://`.

## Verification
`npm run blender -- selftest`; view one frame per scene at 390, 820 and 1440 px in the page; export and open from `file://` with a clean console; `npm run weight -- <site>`.
