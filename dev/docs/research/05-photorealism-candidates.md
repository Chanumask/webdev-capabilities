# Photorealism: verified building blocks

← [CLAUDE.md](../../../CLAUDE.md) · [research index](README.md) · [04 problem](04-photorealism-problem.md) · [06 plan](06-photorealism-plan.md)

Checked 2026-10-08 by three read-only research passes plus local checks. Repository metadata came from `api.github.com` (the `gh` CLI was not allowed in the research sandbox), licences and prices from the vendors' pages. **UNVERIFIED** means no primary source was read or the claim was not tested. Versions and prices change monthly; re-check before relying on them. Builds on [01 tool evaluation](01-tool-evaluation.md), which is not repeated.

## Corrections to the maintainer's notes

| Note | Finding |
|---|---|
| fal MCP at `mcp-relay` | Documented endpoint is `https://mcp.fal.ai/mcp`, 9 tools including `get_pricing`. Auth is a `Bearer <FAL_KEY>` header, not OAuth. The documented `claude mcp add --header "Authorization: Bearer KEY"` puts the key on a command line; use an env-referenced header fed from `.env` instead. |
| `RGBELoader` | Now a deprecated alias; use `HDRLoader`. |
| postprocessing "fits r186" | True, but its peer range is `>=0.168 <0.187`: pin three until a bump, r187 breaks it. |
| scroll-cinematic-claude "paid Higgsfield" | Confirmed (Higgsfield MCP, Nano Banana Pro then Seedance 2.0, ffmpeg slicing). No licence, `ensure-ffmpeg.sh` auto-installs ffmpeg. Reference only. |
| Poly Haven "download at build time" | CC0 assets are free to redistribute commercially, no credit needed. The site ToS forbids scraping or data mining without permission and the API asks for a "Powered by Poly Haven" credit when you build on the live API. Safe: download a few chosen files once, commit them, never call the API at build or runtime, keep an assets ledger. |
| ambientCG | CC0, but its docs say the API is not reliable enough for enterprise use. Same rule: vendor the files. |
| blender-mcp | Now 30k stars, PyPI name `mcp-for-blender`. `DISABLE_TELEMETRY` and `BLENDER_MCP_SAFE_MODE` are in the README; safe mode was not found in the add-on source that was read (incomplete). **Already installed here** (add-on enabled, `uvx mcp-for-blender@2.0.4` pinned with telemetry off in the maintainer's `custom_tabletop/.mcp.json`; Poly Haven integration is a per-scene toggle). |
| Hunyuan3D 2.1 | Licence text excludes the EU, UK and South Korea outright ("DOES NOT APPLY IN THE EUROPEAN UNION"); unusable here. |
| TRELLIS.2 | MIT, but needs 24 GB VRAM and is tested on Linux only. The RTX 3090 Ti has 24 GB; native Windows is unsupported, WSL2 UNVERIFIED. |
| Sketchfab | Standard licence forbids extractable standalone distribution of the model, which a self-contained HTML would be. CC-BY needs a visible credit. |
| gsap-skills | Nudges toward ScrollSmoother, never mentions Lenis or reduced motion. |

## Route 1: real-time

| Block | Version, licence | Fit and cost |
|---|---|---|
| `HDRLoader`, `UltraHDRLoader`, PMREM | in three r186 | Use. Poly Haven 2k: `.hdr` 5.45 MB, `.exr` 20 MB; 1k `.hdr` 1.44 MB. `@monogrid/gainmap-js` 3.4.0 (MIT) gain-map JPEG sizes were **not measured** (expect a few hundred KB for 2k, opinion). Measure in phase 2. |
| Scanned PBR textures (Poly Haven, ambientCG, CC0) | | 1k JPG set is about 0.7 to 0.9 MB per map; PNG is 3 to 7 times larger. Pack ORM, convert to WebP, budget about 1.5 MB per material set. |
| `MeshPhysicalMaterial` | in three | Transmission adds a scene render pass; reported failures on some Android devices (forum anecdotes). Fake glass on phones. |
| `GTAOPass` + `OutputPass` | in three r186 | Zero new bytes. Used in the spike. Cost on phones UNVERIFIED. |
| `postprocessing` 6.39.5 (Zlib), `n8ao` 2.0.1 (ISC on npm, CC0 on repo, check) | peer `<0.187` | n8ao has halfRes and a Performance preset (8 samples) for phones. WebGL only. Adopt only if GTAOPass is not enough. |
| glTF-Transform CLI 4.5.1 (MIT), gltfpack 1.3.0 (MIT) | | `optimize` does meshopt, WebP and KTX2. KTX2 needs the `toktx` binary at build time. |
| Decoders for inline export | | **meshopt 29 KB, inline-ready. Draco about 460 KB base64. Basis about 780 KB base64.** KTX2Loader and DRACOLoader build blob workers and read decoder files through `FileLoader`; a `LoadingManager.setURLModifier` mapping is the known workaround, not tested from `file://`. Upstream `setTranscoderUrls` was closed unmerged (2026-05-20); `DRACOLoader.setDecoderConfig` is deprecated (removal r194). **Choose meshopt and WebP; skip Draco and KTX2.** |
| `three-gpu-pathtracer` 0.0.26 (MIT) | peer three `>=0.185` | Works at build time in headless Chromium for stills. 0.0.x API. Not a runtime option. Cycles is the stronger offline renderer; keep this as a backlog alternative that needs no Blender install. |
| `WebGPURenderer` | | Stay on `WebGLRenderer`. `file://` behaviour UNVERIFIED and WebGPU needs a secure context. |
| Spark 2.3.1 (MIT) | three `>=0.180` | Splat formats are tens of MB; WASM and workers under `file://` UNVERIFIED. Backlog. |
| Do not adopt | | `realism-effects` (last push 2024-02), `GaussianSplats3D` (quiet since 2025-10), `luma-web-examples` (not checked, archived per the notes). |

## Route 2: pre-rendered frames

Byte figures are engineering estimates for photoreal 1280 x 720 frames, **not measured**:

| Format | KB per frame | 120 frames | Inline base64 (+33%) |
|---|---|---|---|
| JPEG q80 | 100 to 180 | about 15 MB | about 20 MB |
| WebP q72 | 60 to 110 | about 9 MB | about 12 MB |
| AVIF | 35 to 70 | about 5 MB | about 6.7 MB |

1600 px costs about 1.5 times as much. Browser support: AVIF Chrome 85, Firefox 93, Safari 16.4; WebP everywhere current. Spike: all three decode from data URIs on `file://` in Edge.

- **Default:** WebP frame sequence decoded once into `ImageBitmap`s and drawn to a 2D canvas on scroll. 2D canvas means it works **without WebGL**. Cap the inline hero sequence at about 15 MB. Encode with `sharp` (no ffmpeg needed for frames from Blender; ffmpeg only to slice video from a client or an AI model).
- Video scrub by `currentTime`: async seeking, keyframe stutter, thin Safari evidence. Fallback at most. `scrolly-video` (MIT, last push 2026-02) is Chrome-first via WebCodecs: reference, not dependency.
- **Blender: 5.2 is already installed** at `C:Program FilesBlender FoundationBlender 5.2lender.exe` (not on PATH; the research pass that said "not installed" only looked at PATH). Upstream stable is 5.2.2 LTS (2026-09-15), GPL, output is the user's. Headless `blender -b -P` rendering, baking and glTF export are standard; the exact flags were not re-read today (UNVERIFIED). Cycles speed on this GPU not measured; plausible seconds per frame with OptiX, minutes on CPU.
- **fal (hosted, paid), prices seen 2026-10-08:** Kling v3 Pro image-to-video 0.14 USD per second; Kling O1 first and last frame 0.112 per second (6 s about 0.67); Wan 2.7 about 0.15 per second (third party); Veo 3.1 about 0.20 per second without audio (third party); Seedance 2.5 up to about 1.16 per second at 1080p (about 7 USD for 6 s). Stills: Nano Banana 0.04, Nano Banana 2 0.08, Nano Banana Pro 0.15 per image. One 5 s clip sliced into frames is the cheap path (0.56 to 3 USD); 120 separate stills would not be temporally consistent. Output licences are tagged "commercial use" on the model pages; the terms behind them and watermark rules are **UNVERIFIED**. Replicate prices only from trackers: UNVERIFIED.

## Route 3: obtaining 3D assets

| Block | Verdict |
|---|---|
| Blender 5.2, installed. Two drivers: headless `bpy` scripts for batch jobs, blender-mcp for interactive modelling | Core for T2 and T3. `custom_tabletop` proves the glTF side: WebP q80 plus meshopt gave a 9.3 MB GLB for a furnished 230k-triangle room; its notes also list the traps (lights out of the GLB, `KHR_materials_transmission` forcing an extra full-scene pass, Poly Haven EXR maps and Subdivision modifiers bloating files, AgX view transform darkening saved renders, one shared live Blender per MCP socket). |
| blender-mcp (MIT) | Available and approved by the maintainer for interactive modelling, with the pinned version and telemetry off. Its socket is unauthenticated and runs arbitrary Python, and it is a single shared live Blender; keep it in the main session, not in parallel workers, and never in website mode. |
| Meshy via its official MCP (`MESHY_API_KEY`) | Optional paid route for a prop from a photo. 20 to 30 credits per image-to-3D, price per credit and output licence not found. Single-view meshes have an invented back side: fine for a hero prop, not for a faithful product or building. |
| Stable Fast 3D | Free under 1 M USD revenue with registration and a "Powered by Stability AI" credit; outputs are the user's. Needs a GPU. Backlog. |
| Photo or video capture (gsplat, Luma, Polycam, KIRI) | Heavy, commercial terms for exports not found. Backlog. |
| Safe to ship inside a client site | CC0 (Poly Haven models are architecture, furniture, decor, no consumer products), CC-BY with visible credit, BlenderKit per asset after checking, models we generate. Not Sketchfab standard licence. Fab/Megascans free-tier web terms UNVERIFIED: not used. |

## Skills and tooling

| Candidate | Verdict | Reason |
|---|---|---|
| `greensock/gsap-skills` (MIT, 16k stars, pushed 2026-07) | Trial three skills: `gsap-scrolltrigger` (~4.6k tokens), `gsap-timeline`, `gsap-performance` | Skip `gsap-plugins` (ScrollSmoother), `utils`, `react`, `frameworks`. The text omits the scrub catch-up pitfall, sticky pinning and Lenis, so the repo's pitfall list stays authoritative. Net value is small; decide after the example shows a real need. |
| `threejs.org/llms.txt` and `docs/llms-full.txt` | Adopt as on-demand reference | Index is about 1k tokens, full file about 90k. Grep it, never load it whole. It pins `three@0.186.0` and is TSL-heavy. Light units and colour management were not found in the part read. |
| `chrome-devtools-mcp` 1.10.1 (Apache-2.0, 53k stars) | Trial, pinned | Only candidate with trace and CPU/network throttling. Flags `--no-usage-statistics --no-performance-crux` and the update-check env var exist. `--slim` has only 3 tools and **no tracing**, so slim is useless for frame times. Windows and Edge are not listed as supported (Chrome stable is); UNVERIFIED here. |
| `dgreenheck/webgpu-claude-skill`, `threejs-devtools-mcp` | Skip | No licence / arbitrary `run_js` and unpinned `npx -y`. |
| `cloudai-x/threejs-skills`, `emalorenzo/three-agent-skills` | Skip | No licence. The lighting skill has no tone mapping or colour management; materials use obsolete `uv2`; postprocessing adds a manual gamma pass on top of `OutputPass` (double encoding). |
| `vladmdgolam/agent-skills` (`threejs-perf-loading`) | Reference | Shader warm-up behind the loader, adaptive quality, on-demand shadow maps. |
| Blender skills built on blender-mcp | Skip | Wrap the unofficial server. |

**No coherent photorealism skill exists.** Primary sources for our own reference: three.js `PointLight` docs (intensity in candela, power in lumens), the three.js colour-management manual (clean URLs 404; the manual may use hash routing, find it before linking), Google Filament's PBR document (photometric units, IBL, exposure), Poly Haven HDRI pages, and the three migration wiki for r182 to r186 (for example `PCFSoftShadowMap` deprecated in r182, UNVERIFIED).
