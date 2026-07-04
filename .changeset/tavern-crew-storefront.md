---
"cyberplace": minor
---

Add the **Tavern** — a crew storefront for browsing and installing recruitable crews (catalog entries tagged `crew` that ship a persona gateway skill). New `cyberplace tavern [query]` command lists and filters crew entries with their install commands (`--format text|json`), and a `cyberplace tavern render` subcommand regenerates the Starlight storefront page from the catalog at website build time. Crews are marked by a reserved `crew` tag in an entry's `tags[]` — no catalog schema change.
