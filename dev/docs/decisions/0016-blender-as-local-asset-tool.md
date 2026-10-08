# 0016: Blender as a local asset tool

Date: 2026-10-08 · Status: active

**Context.** Tiers T2 and T3 need Blender. Blender 5.2.1 LTS is already installed on the maintainer's machine (`C:\Program Files\Blender Foundation\Blender 5.2\`, not on PATH) together with `uv` and the "MCP for Blender" add-on; `custom_tabletop` has a working glTF pipeline. Cycles renders through OptiX on the RTX 3090 Ti (a 1920 x 1080 frame takes 10 to 26 s).

**Decision.**
- Nothing is installed; the tools locate `blender.exe` from a setting or the default path and pin major version 5.2. `npm run setup` reports Blender as optional.
- **Headless `blender -b -P script.py`** is the driver for repeatable work: renders, sequences, bakes, GLB export. Scripts live in the framework and are deterministic.
- **blender-mcp** (`mcp-for-blender@2.0.4`, `DISABLE_TELEMETRY=true`) is allowed for interactive modelling in the main session only: its socket is unauthenticated, runs arbitrary Python and is one shared live Blender, so no parallel workers and never in website mode. The `.mcp.json` is added only with the maintainer's approval.
- **GLB rules** (from `custom_tabletop` and the spikes): WebP textures at 1k, meshopt compression, no lights in the file, no `KHR_materials_transmission` for real-time, check Poly Haven bloat (EXR maps, Subdivision modifiers). The exporter **validates every GLB**: Blender writes a GLB referencing a missing image when WebP meets a 1-channel map, and `GLTFLoader` then throws.
- Fog is a bounded volume box, never a world volume (it renders the sky black).

**Why.** Reuses an existing local install, keeps renders reproducible, and limits the riskiest tool to where a human is present.

**Rules out.** Downloading or installing Blender in this repo; blender-mcp in workers or website mode; unvalidated GLB output.
