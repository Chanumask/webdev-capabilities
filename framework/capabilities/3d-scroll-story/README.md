# Capability: 3D scroll story

A full-screen 3D scene that plays while the visitor scrolls. One pinned canvas behind full-height text chapters. Reference implementation: `framework/examples/lindenhof` (a finished house, then the construction played from the building site to the neighbourhood, with excavator, tipper, mixer, tower crane and scaffolding).

## Use when
The brief asks for scroll storytelling or a 3D experience and the story carries meaning for the business (build-up, journey, reveal, product tour). Not for pages where 3D would only decorate.

## Ingredients
| File | Purpose |
|---|---|
| `core/scene.template.ts` | renderer, lights, ground, state, timeline, camera, Lenis, reduced-motion path. Copy to `src/scripts/scene/scene.ts` |
| `core/kit.ts` | bakes primitives authored in metres into one mesh per material (few draw calls), world-space UVs, `fade()` for layers |
| `core/materials.ts` | procedural textures (plaster, concrete, timber, parquet, roof tiles, asphalt, grass, soil) and PBR materials |
| `framework/examples/lindenhof/src/scripts/scene/building.ts` | detailed floors with a structure layer and a finishing layer |
| `framework/examples/lindenhof/src/scripts/scene/vehicles.ts` | excavator, tipper, mixer, tower crane, scaffold, site props with named parts to animate |
| `framework/examples/lindenhof/src/scripts/scene/props.ts` | garden, trees, street, cars |

Install in the site: `npm i three gsap lenis` and the font package from the brief. Copy `core/*` into `src/scripts/scene/`; import the scene from the page with `<script>import '../scripts/scene/scene';</script>`.

## Page structure and CSS
```html
<section class="stage">
  <div class="stage-sticky"><canvas id="scene"></canvas></div>
  <div class="stage-top"></div>                       <!-- optional scrim so copy never collides with the header -->
  <div class="chapters">
    <section class="chapter hero">...</section>        <!-- 170svh tall, copy at the top -->
    <section class="chapter">...</section>             <!-- 100svh each -->
  </div>
</section>
```
```css
.stage { position: relative; background: var(--bg, #0d1014); }
.stage-sticky { position: sticky; top: 0; height: 100svh; overflow: hidden; pointer-events: none; }
#scene { position: absolute; inset: 0; width: 100%; height: 100%; }
.chapters { position: relative; z-index: 1; margin-top: -100svh; }   /* NOT on the sticky element */
.chapter { min-height: 100svh; display: flex; align-items: center; padding: 6rem var(--gutter); }
.chapter.hero { min-height: 170svh; align-items: flex-start; padding-block: 0; }
.no-webgl .stage-sticky { display: none; }
```
Scroll anchors: the chapter k text is centred at scroll position = (sum of heights above it) in viewport heights. With a 170svh hero: c1 = 1.7, c2 = 2.7, ... The `A` constant in the scene must match. Total scrub range = `A.last * innerHeight`.

## Design rules that worked
- Author geometry in **metres** and scale the baked group once (`scale: 0.43` makes 1 unit about 2.3 m). Keep the base scale on every axis when animating a group (`scale.set(M, M * growth, M)`).
- **Layers**: structure (walls, slabs) and finishing (windows, interior, cladding) are separate meshes so "construction" can progress in stages; colour-lerp the structure from raw concrete to finished plaster.
- **Perspective with a slim field of view (about 22 degrees)** reads as architecture. Orthographic reads as a diagram.
- One light direction, soft shadows, ACES tone mapping, a little environment light for glass. Dark graphite ground that fades into the page colour.
- Keep text readable: shift the subject right (`sx`) on desktop, up on phones; add a left scrim; keep text areas quiet.
- Motion budget: one signature moment, continuous but small secondary motion (crane swing, drum rotation) tied to scroll position `p`, not to time.
- Background tones change in small steps between chapters (keep colourfulness low).
- Phones: lower pixel ratio (1.5), 1024 shadow map, scene above and text below, simplified camera moves.
- No-WebGL: add class `no-webgl`; chapters stay readable on flat fills. Reduced motion: one pose per chapter.

## Pitfalls (all hit during development)
- `ScrollTrigger` `onUpdate` does not fire for scrub-smoothed catch-up frames: set `dirty` from the **timeline** `onUpdate`.
- Negative margin on a sticky element extends its pinning by that amount (the canvas overlaps the next section). Put the negative margin on the next sibling instead.
- A helper that sets `visible` after your own visibility logic overrides it (scaffolds appeared before their floors). Combine conditions in one place.
- Toggling `material.transparent` at runtime recompiles the shader and causes hitches: create fading layers with `transparent: true` from the start.
- Widen the shadow camera only for far-out views (the neighbourhood), keep it tight otherwise.
- `OrthographicCamera` `setViewOffset` works the same on perspective cameras; use it for layout shifts instead of moving the scene.
- Tall hero sections never reach a high `IntersectionObserver` ratio; use a low threshold in the reduced-motion path.
- Processing every frame is wasteful: render only when state changed and the stage is visible.

## Stills from the same kit
For listing thumbnails or section images, render the same scene objects to still images (see `framework/examples/lindenhof/tools-dev/thumbs.ts`) so rendered images match the 3D world. Avoid mixing flat vector illustrations into a realistic render.

## Verification
Screenshots at 390, 820 and 1440 px for the hero and each chapter anchor; check console; test `prefers-reduced-motion`; export and open from `file://`.

## Realism ceiling
Everything here is procedural primitives (realism tier T0, decision 0015). Photographic results come from the [blender-pipeline](../blender-pipeline/README.md) (T3 rendered frames, T2 real-time models); HDRI and AO alone close only a fifth of the gap. For still more realism, replace the building/vehicle builders with Blender-modelled glTF files (Draco/meshopt, under about 2 MB) loaded with `GLTFLoader`; the state, timeline, camera and layout code stays the same.
