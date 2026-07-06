---
"cyberplace": minor
---

Add the **Tavern** — a crew storefront for browsing and installing recruitable crews (catalog entries tagged `crew` that ship a persona gateway skill). New `cyberplace tavern [query]` command lists and filters crew entries with their install commands (`--format text|json`). Crews are marked by a reserved `crew` tag in an entry's `tags[]` — no catalog schema change.

Also exposes the roster derivation as a library via the new `cyberplace/tavern` export (`readMarketplacePlugins`, `readCrewPlugins`) — a single source of truth for reading the marketplace manifest, crew-tag filtering, and per-plugin counts/version/source URL, consumed by both the CLI and the docs site so the two never drift.
