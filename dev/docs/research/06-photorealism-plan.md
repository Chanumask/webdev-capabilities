# Photorealism: plan (phase 1, nothing implemented)

← [CLAUDE.md](../../../CLAUDE.md) · [research index](README.md) · [04 problem](04-photorealism-problem.md) · [05 candidates](05-photorealism-candidates.md)

Status: **approved 2026-10-08, decisions 0014 to 0017 logged**; originally proposed (2026-10-08, revised after the maintainer's answers: new example, Blender 5.2 and blender-mcp already available, single-file export with 25 MB cap, paid generation to the backlog). Decisions below are drafts; they are logged with the `decision-log` skill only when approved.

## Summary

Lighting alone closes about a fifth of the gap ([04](04-photorealism-problem.md)). The cartoon look comes mostly from generic geometry, flat materials and no surrounding world, which no lighting pass fixes. So "photoreal" is a **ladder of tiers**, each with its own cost, and the subject decides the default. The recommended default for buildings and places is **pre-rendered frames scrubbed by scroll (Tier 3)**: the realism comes from an offline renderer, the page stays light to run, it works without WebGL, and it fits the existing sticky-stage and chapter layout. Real-time realism (Tier 2) is for products where a real model exists.

The biggest risk is not code: it is whether an agent can produce **geometry good enough** in Blender. Buildings are the hardest case; furniture and products built from CC0 scanned assets are the easiest. Phase 2 therefore starts with one hero still and a stop gate (milestone M1). Blender 5.2 and a pinned blender-mcp are already set up on this machine, and the maintainer's `custom_tabletop` repo has a proven Blender to glTF pipeline that this plan reuses instead of reinventing ([05](05-photorealism-candidates.md)).

## 1. The tiers

| Tier | Name | What it is | Inline export budget | Needs | Phones | No WebGL | Reduced motion |
|---|---|---|---|---|---|---|---|
| T0 | Stylised | today: procedural primitives, canvas textures | under 1.5 MB | nothing | pixel ratio 1.5 | flat fills | pose per chapter |
| T1 | Lit | T0 or simple geometry plus HDRI sky, scanned PBR textures, GTAO, contact shadows, restrained grade | 3 to 6 MB | nothing paid, no install | GTAO half resolution, no transmission | flat fills | pose per chapter |
| T2 | Real-time models | glTF models (meshopt, WebP textures), lighting and AO baked or from an HDRI, grade | 6 to 14 MB (a 230k-triangle furnished room exported at 9.3 MB in `custom_tabletop`) | Blender (existing install) or supplied GLB/CAD, Poly Haven models | lower-poly set, no transmission | poster image | pose per chapter |
| T3 | Rendered sequence | Cycles (or client footage) frames on a 2D canvas driven by ScrollTrigger | 8 to 15 MB desktop set, about 3 to 4 MB phone set | Blender (existing install) or client video | smaller set (960 px, about 60 frames) | **works** (2D canvas) | one still per chapter |
| T4 | Splat (backlog) | Gaussian splat of a real place via Spark | tens of MB | capture, GPU | no | no | poster |

A tier is a property of the **site**, chosen in the intake. The chapter layout, anchors `A`, Lenis and reduced-motion code are shared. A hybrid (a T3 hero plus T1 elsewhere) is allowed because T3 only owns the stage canvas.

### Default by subject

| Subject | Default | Why | Fallback if the input is missing |
|---|---|---|---|
| Building, interior, development | **T3** from Blender | eye-level cameras, soft sky light and vegetation need an offline renderer; real-time would exceed budgets | client renders or CAD/SketchUp/IFC import into Blender |
| Product (one object) | **T2** if a GLB/CAD file exists, else T3 turntable from a Blender model | a product tour wants free orbit; models are small | T1 with simple forms |
| Real place or venue | **T3 from client video or photos** (frames extracted) | only real footage is photoreal and legally clear | ask for more footage; paid AI interpolation is backlog |
| Abstract, brand, data | **T1** | realism is not the point; material and light quality is | T0 |

## 2. Constraint conflicts and recommendations

| # | Conflict | Recommendation | Decision needed |
|---|---|---|---|
| 1 | One offline file vs heavy assets (+33% base64) | Keep inline as the default with a **hard cap of 25 MB** (mail limit) and a warning at 15 MB. Add `--light`: poster plus a reduced set, under 6 MB. Frames and HDRI as WebP/JPEG data URIs work on `file://` (spiked in Edge). Decoders: only meshopt (29 KB). **No Draco, no KTX2** (about 1.2 MB of base64 WASM and untested blob workers). Fix the exporter first: it does not inline assets referenced from scripts at all today. | Amend [0007](../decisions/0007-localhost-and-single-file-export.md): budgets, `--light`, script-referenced assets, WebGL 2 assumed |
| 2 | Free by default vs paid generation | **Paid generation (fal and similar) goes to the backlog** (maintainer's answer). This programme stays free: Blender, client material, CC0 assets. If it is built later, the rules are: price shown first (fal has a `get_pricing` tool), approval before every spend, key only in `.env` through an env-referenced header (never a key on a command line), per-model licence and watermark check. | none now |
| 3 | Non-technical user vs Blender | **Blender 5.2 is installed** at `C:Program FilesBlender FoundationBlender 5.2` (not on PATH; `uv`/`uvx` and the "MCP for Blender" add-on are installed and enabled too, found via `custom_tabletop`). Nothing is downloaded or installed. The tools locate `blender.exe` (setting or default path) and pin 5.2. **Two drivers:** headless `blender -b -P script.py` for repeatable renders, bakes and exports (what the user runs from `npm run render`); **blender-mcp** (`mcp-for-blender@2.0.4`, `DISABLE_TELEMETRY=true`, as in `custom_tabletop`) only for interactive modelling. Known hazards from the maintainer's notes: the socket is a single shared live Blender with no isolation or locking (concurrent sessions or subagents corrupt each other's scene), the telemetry flag must be re-sent each Blender start, MCP servers load only at session start. So: MCP is opt-in per session through a `.mcp.json` the maintainer approves, workers never use it in parallel, and the website-mode user never needs it. | Decision: Blender as an asset-stage tool (existing install, pinned, two drivers) |
| 4 | Licences | Every third-party asset enters `ASSETS.md` in the site (source URL, licence, date, credit needed). Allowed: CC0 (Poly Haven models and textures, already used for `custom_tabletop`'s room), CC-BY with a visible credit, per-asset-checked BlenderKit. Not allowed: Sketchfab standard licence, Hunyuan3D, Fab/Megascans until terms are read. Poly Haven and ambientCG files are picked by hand, downloaded once (the MCP Poly Haven integration does exactly that) and committed; no API call at build or runtime. | Decision: asset licensing and ledger |
| 5 | WebGPU, three TSL, splats | Out. WebGL 2 only; `file://` WebGPU is unproven. Both go to the backlog. | none |
| 6 | Quality is restrained | One authored motion moment stays. Grade, grain and bloom are off by default and need a reason. Text contrast over frames is checked per chapter (scrim, quiet frame regions). | none |
| 7 | Capabilities come from shipped work | Build the example first, extract after each milestone. | none |
| 8 | `playwright-cli` blocks `file:` URLs | Ship a CLI config with `allowUnrestrictedFileAccess` and Edge; update `export-site` skill and smoke. | none (bug fix) |

## 3. The reference example

**The maintainer chose a completely new example** (not `lindenhof` v3). `lindenhof` stays untouched as the "current bar" and as the problem screenshots. **Proposed subject (working name `oakline`):** a fictional furniture maker whose page is built around one hero armchair. It proves both routes in one site with the lowest geometry risk, because wood and fabric come from scanned materials and the chair from a CC0 or lightly modified Poly Haven model (the armchair and sofa assets already worked in `custom_tabletop`): a **T3 hero** (a Cycles room reveal, camera dollying toward the chair) and a **T2 product tour** (free orbit and detail zoom of the GLB with an HDRI and baked AO). The same chair is also built as a quick **T0 version with the existing Kit** so the before/after is the same subject and shot at T0 and T2/T3. The honest gap: it does not prove buildings, the hardest case; a building example (or `lindenhof` v3) follows only if M1 and the milestones pass. Any other subject is fine if the maintainer prefers; it is the one open question below.


**Milestone M1 (stop gate):** one Cycles still of the armchair in a room (HDRI plus window light, scanned wood and fabric, contact shadows) and the same chair exported as GLB and screenshotted in three.js at T2, shown to the maintainer before any sequence or site work. If a layperson does not call the Cycles still photographic, stop and bring alternatives (more careful asset selection, client-supplied renders) before building further.

## 4. Framework changes

| Area | Change |
|---|---|
| Capabilities | New `framework/capabilities/scroll-image-sequence/` (T3: canvas scrubber, preloader with bitmap decode, phone set selection, poster and reduced-motion, text-over-frame rules). New `framework/capabilities/realism/` (T1/T2: IBL loader, PBR material pack, GTAO, contact shadow, glTF/meshopt loader with inline decoders, bake pipeline, `REALISM.md` reference). `3d-scroll-story` README points at both and drops the "realism ceiling" note. |
| Tools | `npm run render -- <slug>` (headless Blender job from a scene script), `npm run frames -- <slug>` (encode with sharp), `npm run weight -- <slug>` (dev and export weight per asset against the tier budget), exporter: script-referenced assets, `.hdr .exr .webp .avif` MIME, `--light`, budget warn/fail. Setup check reports Blender as optional. |
| Intake | Q3.6 splits "Realistic renders" into stylised-3D and **photographic**. New Q3.9 realism level with tier cost shown. **Q4.3 reordered by tier and subject**, recommendation computed from subject and supply. New round-2 question: what can you supply (photos, video, CAD, GLB, brand renders). Round 5E storyboard gets per-shot camera, frame count and tier; 5H gets the weight budget from the tier table. |
| Brief | Fields `motion3d.tier`, `assets.supplied[]`, `performance.weightBudget`, and an `ASSETS.md` ledger template. |
| Skills and process | `build-site`: tier branch, M1-style stop gate before any long render. `new-site` and `status.mjs`: tier-aware next steps. `framework/WORKFLOW.md`, `CONVENTIONS.md`, capability README. Realism knowledge goes into **one reference file** (`REALISM.md`: colour management, light units, IBL, contact shadows, material response, grading, lens choice), written from what the example needed, not a new skill; revisit if agents ignore it. |
| Agent tooling | Trial `chrome-devtools-mcp` (pinned, opt-outs) for traces and CPU throttling, only after confirming it runs on Windows with the installed browser. Trial three `gsap-skills` only if the example hits a gap. `llms.txt` is a reference note, no install. |
| Tests | Exporter inlines script-referenced assets and fails over the cap; frame encoder; intake has the new questions and brief fields; skills test; smoke:examples checks `file://` console and reports weight. |
| Docs | Capability READMEs, `framework/examples/README.md`, research index, decisions, changelog. |

## 5. Acceptance

For every tier and the example:

- **Before and after:** the same subject and framing at T0 (Kit primitives, the current method) and at T2/T3, at 390, 820 and 1440 px, committed under the example's `brief/` folder; screenshots and stills only, no description in their place. The existing `lindenhof` screenshots in [assets/](assets/) document the current bar.
- **Weight (proposed, to confirm):** T3 dev build hero set at most 12 MB desktop and 4 MB phone set; poster under 150 KB; inline export warn at 15 MB, fail at 25 MB; `--light` under 6 MB. T1 under 6 MB, T2 under 14 MB.
- **Frame time (proposed):** scroll draw at most 4 ms per frame for T3 on desktop; no long task over 50 ms while scrolling after load with a 4x CPU throttle plus mobile emulation as the phone proxy; T2 at least 50 fps on that proxy. Measured with a trace, not by eye. A real phone is not available here, so this is a proxy and the report says so.
- **Export:** opened from `file://` in Edge with a clean console, and checked in Firefox and Safari where available (not tested so far).
- **Fallbacks:** reduced motion shows one still per chapter; no WebGL works for T3 and shows flat fills plus poster for T1/T2; phones get the small set.
- **Text:** body text over frames meets contrast with the scrim, at every anchor.
- **Gates:** `npm run check`, `npm run smoke`, `npm run smoke:examples` green; changelog and decisions written.
- **Honest limits note** in the final report: what stays impossible (live product photography quality from one phone photo, true-to-life faces, logos from AI video).

## 6. Branches in dependency order

| # | Branch | Size | Depends on | Content |
|---|---|---|---|---|
| B0 | `docs/photoreal-plan` | S | - | this research and the approved decisions |
| B1 | `feat/export-heavy-assets` | M | B0 | exporter fixes, MIME, budgets, `--light`, `weight`, `file://` playwright config, tests |
| B2 | `feat/blender-pipeline` | L | B0 (parallel to B1, different files; `package.json` owned by B2) | locate the existing Blender 5.2, `render` and `frames` tools, scene-script conventions (adapted from `custom_tabletop/docs/engineering/blender-workflow.md`: WebP q80, meshopt, `export_lights=False`, no transmission, Poly Haven bloat checks), optional pinned `.mcp.json` for interactive modelling after approval |
| B3 | `feat/example-oakline` | XL | B1, B2 | new example with a T0 baseline, M1 stop gate, T3 hero and T2 product tour, screenshots |
| B4 | `feat/capability-scroll-image-sequence` | M | B3 | extract the T3 capability |
| B5 | `feat/capability-realism-t1-t2` | L | B3 (T2 part of the example) | IBL/PBR/GTAO/glTF loader with inline meshopt, `REALISM.md`, extract |
| B6 | `feat/intake-photoreal` | M | B3, B5 | questions, brief fields, `build-site`, WORKFLOW, status, tests |
| B7 | `chore/agent-tooling-trials` | S | B3 | chrome-devtools-mcp and gsap-skills trials, `llms.txt` note |

Parallel-planning verdict: B1 and B2 are independent enough for workers, but **no worker may drive blender-mcp** (one shared live Blender). B3 onward is sequential because it needs serialized browser verification of the example. B4 and B5 can run as workers once M1 passed, with browser checks serialized in the main session.

## 7. Out of scope (goes to the backlog)

Paid generation (fal, Replicate, Meshy; maintainer's answer: backlog); WebGPU/TSL track; Gaussian splats (Spark, gsplat); `three-gpu-pathtracer` as a Blender-free renderer; image-to-3D (TRELLIS.2, Stable Fast 3D); AVIF tier until a Safari check; video-scrub variant; Sketchfab and Fab ingestion; Draco/KTX2 inline decoders; `lindenhof` v3 or any building example until the furniture example passes; animated vehicles and crane in photoreal.

## 8. Proposed decisions (log on approval)

1. **0014 Export budgets and variants** (amends 0007): caps, `--light`, script-referenced assets, WebGL 2, no Draco/KTX2.
2. **0015 Realism tiers**: T0 to T3 (T4 backlog), defaults by subject, intake chooses.
3. **0016 Blender as local asset tool**: existing Blender 5.2 install (path configurable), headless scripts for batch work, blender-mcp (`mcp-for-blender@2.0.4`, telemetry off) only for interactive modelling in the main session, never in parallel workers.
4. **0017 Asset licensing and ledger**: allowed and forbidden sources, vendored files, `ASSETS.md`.
