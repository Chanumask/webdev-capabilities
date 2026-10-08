# 0019: Delivery routes by weight and type

Date: 2026-10-08 · Status: active

**Context.** [0007](0007-localhost-and-single-file-export.md) and principle 5 promise that every site exports to one offline HTML file. With photoreal frames, models and larger scenes ([0014](0014-export-budgets-and-variants.md)) that holds only up to about 25 MB, and a virtual meeting room like `custom_tabletop` (client plus Node WebSocket server, multiplayer, models around 10 MB, Docker) cannot be a file at all. The maintainer asked whether a folder export would be the better route for complex sites.

**Decision.**
- **Three routes, chosen by weight and type, asked in the intake (Q4.12):**
  1. **One file** (`npm run export`): static sites up to 25 MB (warning at 15 MB). For mailing, offline demos and reviews. This stays the default and the only no-hosting route.
  2. **Hosted preview link:** for static sites that are heavier, or when the recipient needs a link. Uses the free hosting of [0010](0010-launch-and-handover.md) (for example Cloudflare Pages on the owner's account), never created or deployed without an explicit yes. The launch tooling does the work.
  3. **Server apps** (virtual rooms, multiplayer, logins, checkout, anything with a live backend): not exportable. They run on localhost with their server during development and are delivered by hosting that can run a server. A static export may cover a lobby or a preview of the visuals, and says so.
- **No folder or zip export of a bigger site.** From `file://` browsers block `fetch`, workers, WASM and module scripts, so models, textures and decoders fail; a folder needs a local web server, which a non-technical recipient does not have. It would be worse than the file for the same recipient and no better than a link for everyone else.
- Virtual rooms are a **new site type outside the current catalog**: the agent says so honestly (Q1.3 follow-up), records it as a framework gap, and the capability (from `custom_tabletop`: Blender room to GLB, three.js client, WebSocket server) is built when the first real project needs it.

**Why.** The single file is a sharing convenience, not the delivery format; keeping it honest about its limits avoids a half-working folder route and keeps every promise to the user true.

**Rules out.** A folder export as a fallback for heavy sites; promising an offline file for sites with a live server; deploying a preview without the owner's explicit yes.

**Open.** A screen-recorded preview video for scroll stories (backlog); hosted preview automation (backlog, deploy workflow).
