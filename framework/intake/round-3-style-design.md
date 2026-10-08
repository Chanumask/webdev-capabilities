# Round 3: Style and design

Goal: pin down the **look and feel** well enough that the first build matches. People rarely describe design in words, so use contrasts, references and concrete options. Ask for what they dislike as much as for what they like.

Important design facts learned from previous projects (use them to guide recommendations):
- Quiet, restrained palettes (neutrals plus one accent) read as higher quality than saturated colour fields. Offer bold colour as an explicit choice, not as the default.
- Realistic materials and light beat flat illustration when the goal is "high quality".
- One authored motion moment beats many small effects.
- Text must stay readable over any animated scene (plan a scrim or a quiet area).

## Q3.1 Mood
Ask: Pick up to three words for how the website should feel.
Why: the strongest single input to the design direction.
Type: multi (max 3). Offer 4 per call and a second call for more.
Options:
- Calm and refined: quiet, precise, expensive
- Cinematic and dramatic: depth, contrast, atmosphere
- Warm and human: approachable, friendly, tactile
- Bold and playful: colour, energy, personality
Second pass: technical and precise / minimal and airy / natural and organic / classic and trustworthy
Writes: BRIEF.style.mood[]

## Q3.2 Light or dark
Ask: Where and how will people use the site, and should it feel light or dark?
Why: picks the base scene (never choose light or dark by category habit).
Type: single
Options:
- Dark and atmospheric: evening mood, makes 3D and imagery glow (Recommended for cinematic 3D)
- Light and airy: bright, paper or stone feel, best for text-heavy content
- Mixed: dark hero and scenes, light content sections (Recommended for service sites with listings and forms)
- You decide
Writes: BRIEF.style.theme

## Q3.3 Colour
Ask: How colourful should it be?
Why: palette strategy.
Type: single, then ask for brand colours (hex or names) if the user has them.
Options:
- Restrained: neutrals plus one accent colour (Recommended for a premium look)
- Brand colours lead: use the supplied brand palette prominently
- Bold: large colour areas, high energy
- Monochrome: one hue in many tones
Writes: BRIEF.style.colour (+ brand hex values)

## Q3.4 Typography
Ask: What kind of lettering fits?
Why: font pairing, loaded locally (no third-party requests).
Type: single
Options:
- Modern geometric sans: clean, contemporary, light weights for headlines (Recommended for premium and architecture)
- Friendly humanist sans: warm, very readable
- Editorial serif: literary, classic (use carefully; it is a common default)
- Strong condensed display: poster-like headlines, high impact
Writes: BRIEF.style.type

## Q3.5 References
Ask: Which websites do you like, and which do you dislike? Add addresses if you have them and say what you like about them.
Why: nothing communicates taste faster. Fetch each URL and summarise: structure, palette, type, motion, tone.
Type: free text (Other). Offer options "I have examples" / "No examples, you propose".
Writes: BRIEF.style.references[], BRIEF.style.antiReferences[]

## Q3.6 Imagery style
Ask: What should the images look like?
Why: asset direction.
Type: single
Options:
- Photographic renders: rendered with real light and scanned materials so it looks like a photo (Recommended when quality is the goal; choose the level in Q3.8b)
- Stylised 3D: simple forms and calm colour, clearly not a photo
- Photography: real photos supplied by the client
- Illustration or graphic shapes: stylised, flat, graphic
- Mostly typography, almost no images
Writes: BRIEF.style.imagery

## Q3.7 Motion
Ask: How much should move?
Why: effort, performance, accessibility fallbacks.
Type: single
Options:
- Subtle: gentle fades and hover states, nothing flashy
- Scroll reveals: sections appear while scrolling
- Scroll storytelling: one animation scene is driven by scrolling
- Full 3D experience: a 3D world that plays while the user scrolls (highest impact; plan more effort)
Writes: BRIEF.style.motion
Follow-up: anything above "subtle" adds Q3.8. Always plan a calm fallback for people who prefer reduced motion and for devices without 3D.

## Q3.8 The 3D or animation idea (only if motion is storytelling or 3D)
Ask: What should the animation show, and what story does scrolling tell?
Why: it is the signature moment of the page. It must carry the meaning of the business, not decorate it.
Type: single + free text
Options (use `preview` to show a three-line sketch for each):
- Build-up: something is built or assembled step by step as you scroll (a house, a product, a team)
- Journey: the camera travels through connected scenes (a city, a landscape, a process)
- Reveal: layers peel away or a scene transforms (inside a building, before and after, day and night)
- Product tour: the camera moves around one object and highlights parts
Follow-up questions (ask as needed, one call):
- Subject and setting: what exactly is shown? (free text)
- Realism: ask Q3.8b
- Start and end: what does the first screen show, what is the last? (many sites work well when the finished result is shown first, then the story rewinds)
- Phones: same animation simplified, or a calm alternative
Writes: BRIEF.motion3d (subject, story archetype, realism, start/end state, mobile plan). The full storyboard is built in round 5.

## Q3.8b Realism level (only if the 3D or animation idea is realistic or photographic)
Ask: How real should it look? Each level costs more effort and download size.
Why: decides the whole production route, the file size and which tools run. Decision 0015 (tiers). Recommend by subject: buildings, interiors and places photographic frames; a single product real-time models; abstract or brand subjects lit stylised 3D.
Type: single
Options:
- Photographic frames (T3, Recommended for buildings, places, interiors and when the best quality matters): rendered with Blender and played by scrolling, looks like film or photos. About 8 to 15 MB for the whole page, works even without 3D support, no free rotation. Needs Blender on this computer and rendering time (about 10 to 30 minutes per sequence). Built from free scanned models and materials, or from your files
- Real-time 3D models (T2, Recommended for one product the visitor should turn and inspect): the visitor can rotate and zoom. Looks like a good product viewer, not like a photo. About 6 to 14 MB
- Lit stylised 3D (T1): simple forms with realistic light and materials. About 3 to 6 MB, no extra tools
- Stylised 3D in code (T0): the look of the reference example `lindenhof`. Under 2 MB
Follow-up: for T2 and T3 the agent shows one finished still first and waits for a yes before any long rendering (stop gate). Buildings need good models or CAD files to look photographic; say so honestly and ask Q2.6b. Phones get their own portrait render.
Writes: BRIEF.motion3d.tier

## Q3.8c People in the scene (only if the scene or imagery shows people)
Ask: Should people be visible, and how?
Why: people decide whether a scene feels alive or empty, and they are the hardest thing to make look real. Decision 0020: licensed human models are reliable at medium and long distance in rendered frames; portraits come from real photos or video.
Type: single
Options:
- Background and mid-distance people (Recommended for buildings, places and interiors): realistic figures with real clothes and faces that give scale and life; fetched from a licensed library
- No people: calm and empty, safest for products and abstract scenes
- Silhouettes or stylised figures: simple forms, clearly not photographic
- Close-ups of real people: the agent uses your photos or video and needs the consent of the people shown; it never invents faces, names or quotes
Follow-up: close-up portraits made from 3D models are not promised (hair and eyes look game-like). Standing, talking and walking people work in rendered frames (licensed animation clips); crowds are not part of this version. Ask Q2.6b about photos or video of people.
Writes: BRIEF.motion3d.people

## Q3.9 Layout character
Ask: How should the page be laid out?
Why: density and rhythm.
Type: single
Options:
- Spacious: big type, lots of air, one idea per screen (Recommended for premium)
- Balanced: clear sections with moderate density
- Dense and informative: lots of information at a glance, tables and lists
Writes: BRIEF.style.layout

## Q3.10 Accessibility and devices
Ask: Which devices and needs matter most?
Why: breakpoints, contrast, fallbacks.
Type: multi
Options:
- Phone first: most visitors are on phones
- Desktop first: most work happens on large screens
- Strong accessibility: high contrast, large text, full keyboard support
- Older or slower devices must work
Default for all projects: contrast AA, keyboard focus, reduced-motion respected, semantic HTML.
Writes: BRIEF.style.devices, BRIEF.style.a11y

## Q3.11 Things to avoid
Ask: Is there anything that must NOT appear?
Why: prevents the most frequent disappointments.
Type: multi
Options:
- Stock-photo look
- Gradients and glossy effects
- Pop-ups and cookie banners
- Heavy animation that slows the page
Free text via Other.
Writes: BRIEF.style.avoid[]

## Q3.12 Design directions (end of round 3)
When enough is known, **propose two or three distinct directions** as text, each with: name, one-sentence idea, palette (named colours), type feel, how the first screen looks (small ASCII sketch in the option `preview`), the motion idea, and an honest risk. Make them genuinely different, not three shades of the same. Use Impeccable's direction roll (`concept-seed`) to seed unusual options when the brief leaves the world open; pinned choices from the user always win. Ask the user to pick one, mix, or ask for new ones.
Writes: BRIEF.style.direction (name + description + pinned constraints)

## Round 3 output
Update INTAKE.md and BRIEF (style, motion3d). Recap. Then ask whether to continue to architecture (round 4) or let you propose defaults.
