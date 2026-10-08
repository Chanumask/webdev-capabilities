# 0017: Asset licensing and the assets ledger

Date: 2026-10-08 · Status: active

**Context.** Photoreal sites ship third-party models, textures and HDRIs inside client work. Poly Haven and ambientCG are CC0 but their sites forbid scraping (Poly Haven) or call their API unstable (ambientCG). Sketchfab's standard licence forbids extractable distribution, which a single HTML file is. Hunyuan3D's licence excludes the EU.

**Decision.**
- **Allowed:** CC0 (Poly Haven, ambientCG), CC-BY with a visible credit, BlenderKit per asset after reading its licence, assets the client supplies with their consent, assets the agent generates.
- **Not allowed:** Sketchfab standard licence, Hunyuan3D, Fab/Megascans until their web terms are read, anything without a licence.
- Files are chosen by hand, downloaded once by id, and committed in the site. No API call at build time or runtime.
- Every site keeps `ASSETS.md`: asset, source URL, licence, date, author, credit needed, where it is used. `build-site` fills it; handover includes it.
- Size matters as much as licence: several scanned Poly Haven models are 0.5 to 1 GB (trees); the ledger records the size and the optimised result.

**Why.** Owners must be able to prove what they may use, and the agent must not drift into assets that cannot legally ship.

**Rules out.** Runtime fetches from Poly Haven or ambientCG; unlicensed assets; AI-generated 3D from services with EU exclusions.
