# 0015: Realism tiers

Date: 2026-10-08 · Status: active

**Context.** `lindenhof` (procedural primitives) reads as cartoony ([research 04](../research/04-photorealism-problem.md)). HDRI and AO alone close about a fifth of the gap. Spikes ([07](../research/07-photorealism-quality-spikes.md)) show that scanned assets rendered offline reach photographic quality, real-time GLB scenes reach "good product viewer", and self-built building geometry does not yet reach a photo.

**Decision.** A site chooses one realism tier in the intake; the scene template, anchors, Lenis and reduced-motion code are shared.
- **T0 Stylised:** procedural primitives (today).
- **T1 Lit:** HDRI sky, scanned PBR textures, GTAO, contact shadows. 3 to 6 MB.
- **T2 Real-time models:** GLB (meshopt, WebP), HDRI, baked or HDRI light. Described honestly as a product viewer, not as photographic. 6 to 14 MB.
- **T3 Rendered sequence:** Cycles frames (or client footage) on a 2D canvas scrubbed by scroll. Works without WebGL. Desktop 1920 px set plus a portrait phone set rendered separately.
- **T4 Splats:** backlog.
- **Defaults by subject:** building or interior T3, product T2 (T3 turntable without a model), real place T3 from client footage, abstract T1.
- **Stop gate:** before any long render or site work the agent shows a hero still (and for T2 a real-time screenshot) and waits for approval.

**Why.** Each tier has a different cost, device behaviour and fallback; naming them lets the catalog recommend honestly. T3 is the route to photographic results and costs less in bytes and render time than feared.

**Rules out.** Promising "realistic" in the catalog without a tier; real-time photoreal buildings; AI-generated frames in this programme (backlog).
