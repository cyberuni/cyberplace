# marketplace — discovery, the awesome-list, and the Tavern

The cyberplace capability that helps agents **find and acquire** skills, plugins, and crews.
Source: `packages/cyberplace/src/awesome/` + the `awesome-skills.json` catalog, projected to the
docs site.

Units:

- [`awesome-list/`](./awesome-list/README.md) — *behavioral* — the existing curated discovery:
  `cyberplace awesome find / inspect / render / sources` over the catalog. **Backfilled** from
  source.
- [`tavern/`](./tavern/README.md) — *behavioral* — **new** — the crew storefront: a reserved `crew`
  tag on catalog entries, the dedicated `cyberplace tavern` command, and a Starlight section that
  renders the crew roster.

Two-level cap holds: each is `marketplace/<unit>`; no third folder level.
