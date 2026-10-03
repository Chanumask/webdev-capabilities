---
name: Lindenhof Hausverwaltung
description: A property manager's site as a restrained architectural visualisation at dusk, graphite and stone with one brass accent.
colors:
  ink: "#0d1014"
  graphite: "#15181d"
  graphite-2: "#1d2127"
  stone: "#ecece9"
  stone-2: "#e1e1dd"
  chalk: "#f3f3f1"
  brass: "#b79a68"
  brass-deep: "#7d6636"
  muted: "#a3a9b0"
  muted-ink: "#4d535b"
  field-border: "#7e848c"
  error: "#a43a25"
  error-wash: "#fdf1ee"
typography:
  display:
    fontFamily: "Hanken Grotesk Variable, Hanken Grotesk, system-ui, sans-serif"
    fontSize: "clamp(2.8rem, 6.2vw, 5.6rem)"
    fontWeight: 300
    lineHeight: 1
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Hanken Grotesk Variable, Hanken Grotesk, system-ui, sans-serif"
    fontSize: "clamp(2.4rem, 5vw, 4.6rem)"
    fontWeight: 300
    lineHeight: 1
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Hanken Grotesk Variable, Hanken Grotesk, system-ui, sans-serif"
    fontSize: "1.8rem"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Hanken Grotesk Variable, Hanken Grotesk, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Hanken Grotesk Variable, Hanken Grotesk, system-ui, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 500
    lineHeight: 1.55
    letterSpacing: "0.01em"
  wordmark:
    fontFamily: "Hanken Grotesk Variable, Hanken Grotesk, system-ui, sans-serif"
    fontSize: "clamp(3.5rem, 12vw, 9rem)"
    fontWeight: 300
    lineHeight: 0.9
    letterSpacing: "-0.04em"
rounded:
  sharp: "2px"
  plate: "3px"
spacing:
  gutter: "clamp(1rem, 4vw, 4rem)"
  section: "clamp(4rem, 9vw, 8rem)"
  gap-sm: "0.5rem"
  gap-md: "1rem"
  gap-lg: "1.5rem"
components:
  button:
    backgroundColor: "{colors.chalk}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sharp}"
    padding: "0.85rem 1.3rem"
    height: "3rem"
  button-dark:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.sharp}"
    padding: "0.85rem 1.3rem"
    height: "3rem"
  button-hover:
    backgroundColor: "{colors.brass}"
    textColor: "{colors.ink}"
  plate:
    backgroundColor: "{colors.chalk}"
    textColor: "{colors.ink}"
    rounded: "{rounded.plate}"
  input:
    backgroundColor: "#ffffff"
    textColor: "{colors.ink}"
    rounded: "{rounded.sharp}"
    padding: "0.6rem 0.85rem"
    height: "3rem"
  segment-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.sharp}"
  house-number:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.sharp}"
    size: "3.4rem"
---

# Design System: Lindenhof Hausverwaltung

## Overview

**Creative North Star: "The Dusk Model"**

The page is a restrained architectural visualisation seen at dusk. A pinned WebGL scene builds a Mehrfamilienhaus as the visitor scrolls (site, structure, envelope, fit-out, lit and finished), lit by a warm low sun against a cool blue-grey sky. Around the scene the page stays in graphite and stone, with a single brass accent borrowed from the model's own brass fittings. Nothing is decorated; every surface is either a dark ground, a light ground, or an engraved plate.

Interface chrome is borrowed from the building: name plates (Klingelschilder) carry the brand, the menu, the search, both forms and the emergency number. Each is a chalk face with one hairline border and an engraved inset line, no colour. Type is one family, Hanken Grotesk, set light and tightly tracked at large sizes and medium weight for anything you act on. Density is calm: large headlines, wide gutters, ruled lists instead of cards.

Imagery is rendered, not photographed. The listing and section stills in `public/thumbs` are JPGs generated from the same 3D kit by `tools-dev/thumbs.ts`; they are alt-texted as "gerenderte Ansicht" and must stay labelled as renders. Listing data is visibly placeholder.

**Key Characteristics:**
- Graphite and stone grounds, chalk plates, one brass accent used only as hover, selection and a hairline.
- One typeface (Hanken Grotesk Variable); weight 300 for display, 500 for controls.
- 2px corners on controls, 3px on plates and stills; no pill shapes.
- Flat surfaces except plates, which carry one soft ambient shadow.
- Scene materials share the CSS palette: plaster, graphite membrane and brass match the page tokens.

## Colors

A cool, desaturated palette of near-black graphite and warm grey stone, with brass as the only chroma.

### Primary
- **Dusk Brass** (`{colors.brass}`): the sole accent. Button hover fill, text selection, scrollbar thumb track colour, the inset hairline on house-number tiles, and the scene's brass fittings. Never a large fill at rest.
- **Deep Brass** (`{colors.brass-deep}`): the same hue made legible on light grounds: keyboard focus on chips and segments, text caret.

### Neutral
- **Ink** (`{colors.ink}`): page backdrop, hero stage ground, footer, primary text on stone, dark buttons, selected chips.
- **Graphite** (`{colors.graphite}`): owners and contact sections. **Graphite Lift** (`{colors.graphite-2}`) is the row hover on graphite.
- **Stone** (`{colors.stone}`): body background and listings ground. **Stone Shade** (`{colors.stone-2}`) is the tenants section, one step down.
- **Chalk** (`{colors.chalk}`): plate faces, text on dark grounds, light buttons.
- **Muted** (`{colors.muted}`): secondary text on ink (footer note). **Muted Ink** (`{colors.muted-ink}`): secondary text on stone and chalk (sub-brand, notes, required markers).
- **Field Border** (`{colors.field-border}`): input and chip outlines on light grounds.
- **Error** (`{colors.error}`) on **Error Wash** (`{colors.error-wash}`): touched-and-invalid fields only.
- Hairlines: `rgb(13 16 20 / 0.18)` on light, `rgb(243 243 241 / 0.16)` on dark.

### Named Rules
**The One Brass Rule.** Brass is the only chroma on the page and appears as hover, selection or a hairline. If a screen shows a brass block at rest, it is wrong.

**The Dusk Ground Rule.** Dark sections use graphite or ink, light sections use stone; chalk is reserved for plates and for text on dark. Do not introduce a third hue family.

## Typography

**Display, Body and Label Font:** Hanken Grotesk Variable (with Hanken Grotesk, system-ui, sans-serif). Self-hosted via fontsource.

**Character:** A neutral, slightly humanist grotesque. Light weight and negative tracking make headlines feel drawn; medium weight makes controls feel stamped.

### Hierarchy
- **Display** (300, clamp(2.8rem, 6.2vw, 5.6rem), 1.0, -0.03em): the hero h1 only.
- **Headline** (300, clamp(2.4rem, 5vw, 4.6rem), 1.0, -0.03em): chapter and section h2s.
- **Title** (400, 1.8rem, 1.1, -0.02em): listing addresses; 500 at h3 default for other titles; services use 300 at clamp(1.7rem, 3vw, 2.4rem).
- **Body** (400, 1.125rem, 1.55): running German copy, capped at 62ch.
- **Label** (500, 0.9rem to 1.05rem, +0.01em): field labels, buttons, menu links, chips.
- **Wordmark** (300, clamp(3.5rem, 12vw, 9rem), 0.9, -0.04em): footer name only.
- Prices and facts use tabular numerals (`font-variant-numeric: tabular-nums`); price at 400, 2rem.

### Named Rules
**The Light Heading Rule.** Headings are weight 300 and tightly tracked; weight 500 is for things you click or fill in.

## Layout

Content sits in a `.wrap` of `min(100% - 2 * gutter, 78rem)`, gutter `clamp(1rem, 4vw, 4rem)`. Sections pad `clamp(4rem, 9vw, 8rem)` top and bottom. The hero is a pinned 100svh scene with chapters scrolling over it (hero chapter 170svh, others min 100svh), text held in a 31 to 36rem column on the left over a left-to-right ink gradient scrim (bottom-up under 1000px). Below it the page alternates stone (listings), graphite (owners), stone-2 (tenants), graphite (contact), ink (footer). Owners, tenants and contact use a 5fr/6fr two-column grid that collapses at 860px.

Listing rows are a four-column grid (11rem still, address, facts, price) that falls to two columns at 980px and one at 560px. Other breakpoints: 1000px (chapters anchor to the bottom, scrim flips), 760px (menu collapses to a toggle plate). Targets are 3rem high (2.5rem for small buttons, 2.75rem minimum for chips and segments). Without WebGL the chapters fall back to flat graphite.

## Elevation & Depth

Flat by default with tonal layering between grounds. The only shadow is on plates: `0 22px 44px -24px rgb(0 0 0 / 0.7)`, a soft ambient drop that seats them over the scene, plus an engraved inset line (`inset 0 0 0 4px` chalk then `inset 0 0 0 5px rgb(13 16 20 / 0.12)`). Rows, buttons and sections cast nothing; hover is an ink fill on rows and a brass fill on buttons. Depth in the hero comes from the 3D scene itself (hemisphere sky light, warm directional sun, soft ground alpha).

### Named Rules
**The Plate Only Rule.** Only name plates cast a shadow, and it is always diffuse. No offset or hard-edged shadows.

## Shapes

Drafted and square. Controls, segments, chips, tiles and listing stills use a 2px radius; plates and section stills use 3px. The scrollbar thumb is the one rounded element (6px). Borders are 1px: ink for structure (segment frames, list top rule), a hairline at 18% ink for dividers, `{colors.field-border}` for field outlines. No pills, no circles, no gradients except the stage scrims.

## Components

### Buttons
- **Shape:** 2px corners, 1px border matching fill, min-height 3rem, padding 0.85rem 1.3rem, trailing square-capped arrow icon (inline SVG).
- **Light (default):** chalk fill, ink text, on dark grounds (hero, owners).
- **Dark:** ink fill, chalk text, on stone and inside plates.
- **Hover:** fill and border switch to brass, text stays ink, arrow slides 4px right (0.35s, cubic-bezier(0.16, 1, 0.3, 1)). Active nudges down 1px.
- **Small:** 2.5rem high, in listing rows; inverts to chalk when the row is hovered.

### Name Plates
The signature container. Chalk face, ink text, 1px ink hairline at 28%, 3px radius, engraved inset line, ambient shadow. Used for brand, menu, hero search, both forms and the emergency number. Focus rings inside plates are ink.

### Inputs and Chips
- **Fields:** white, 1px `{colors.field-border}`, 2px radius, 3rem high; label above at weight 500 with a muted-ink "Pflichtfeld" marker. Focus: 2px ink outline with 1px offset and an ink border.
- **Invalid:** after touch only, error border on error wash.
- **Chips and segments:** 2.75rem high, outlined; selected state is ink fill with chalk text. Keyboard focus is a 2px deep-brass outline.

### Navigation
A plate holding inline links separated by hairlines; hover inverts to ink with chalk text. Under 760px it becomes a "Menü" toggle that opens a stacked plate.

### Listing Row
Ruled rows under a 1px ink top rule. Still (rendered, 3:2), house-number tile, address, facts as small dt/dd pairs, price, enquiry button. Hover or focus-within floods the row ink with chalk text. The house-number tile is an ink square, chalk numerals, with a brass hairline inset by 5px.

### Service List
Hairline-ruled rows on graphite; hover lifts to graphite-2 and slides content 0.8rem right.

## Do's and Don'ts

### Do:
- **Do** keep grounds to ink, graphite, stone and stone-2, with chalk plates over them.
- **Do** use brass only for hover fills, selection, scrollbar and hairline details.
- **Do** build new containers as name plates (chalk face, 1px hairline, engraved inset, soft ambient shadow).
- **Do** keep headings at weight 300 and -0.03em; controls at weight 500.
- **Do** keep radii at 2px (controls) and 3px (plates, stills); targets at least 2.75rem.
- **Do** use the 0.16, 1, 0.3, 1 ease at 0.25 to 0.4s for movement, and let reduced motion collapse durations.
- **Do** label stills as rendered views and keep sample listings visibly marked as placeholder.
- **Do** keep a flat graphite fallback for the no-WebGL path.

### Don't:
- **Don't** add photographs; imagery comes from the 3D kit.
- **Don't** fill large areas with brass or add a second accent hue.
- **Don't** add card grids, pill shapes, glass blur or hard offset shadows.
- **Don't** set body copy in weight 300 or headings in weight 500.
- **Don't** fabricate testimonials, counts, awards or prices as fact.
