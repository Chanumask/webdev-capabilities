# 0020: Human figures in photoreal scenes

Date: 2026-10-08 · Status: active

**Context.** Earlier sites showed people as silhouettes or toy figures. Photoreal tiers ([0015](0015-realism-tiers.md)) need real human models, and the sources differ in licence and quality ([research 08](../research/08-people-and-characters.md)). The maintainer suggested Mixamo.

**Decision.**
- **Default source: Microsoft Rocketbox** (MIT), fetched once with `npm run assets -- add <site> people/<id>` and imported with `webdev_bpy.import_person`. The licence file travels with the site (`assets/people/LICENSE-Microsoft-Rocketbox.txt`) and every avatar is listed in `ASSETS.md`.
- **Mixamo only for rendered frames (T3), supplied by the user.** The user downloads the FBX with their own Adobe ID; the agent never asks for the login, never automates or scrapes the site, and never ships a raw Mixamo character or animation file (no GLB of it in a site, no real-time use) because Adobe forbids redistributing them as standalone assets. Terms are re-read before each project.
- **Animation: the Rocketbox clips (MIT)** are used first (same skeleton, no retargeting, no account): `npm run assets -- add <site> animations/<name>` and `webdev_bpy.apply_animation`. Mixamo animation is the fallback for clips Rocketbox lacks and needs a retarget that is untested.
- **MPFB2/MakeHuman** (CC0 output) was tested after the maintainer approved installing the Blender add-on and the CC0 asset packs in the Blender user folder: it is not better than Rocketbox out of the box (waxy skin, plain hair) and stays an optional source for body variety; no integration. **MetaHuman** is backlog.
- **Realism promise:** medium and long distance people are reliable in T3; close-up portraits are **not** promised (game-era hair and eyes). Hero portraits and testimonials come from the client's own photos or video, with consent for the people shown (GDPR); the agent never invents faces, names or quotes.
- Stylised tiers (T0, T1) may use CC0 stylised characters (for example Quaternius).
- The catalog asks about people (Q3.8c) and the brief records the answer. Standing, talking and walking people are possible in rendered frames; crowds are not part of this version.

**Why.** It gives the biggest visible gain (real people with clothes and faces) from a source that is legal for client work and fetchable by the agent without an account, and keeps the Adobe route within its stated terms.

**Rules out.** Mixamo or any raw character file in a shipped real-time asset; asking for or storing the user's Adobe login; AI-generated faces presented as real customers; unlicensed scanned people.
