# marketplace — discover, acquire, source, and the crew storefront

The cyberplace capability that helps agents **discover, acquire, source, and share** skills, plugins,
and crews — the whole of cyberplace's charter. Source: `packages/cyberplace/src/{awesome,registry,
tavern}/` + the `awesome-skills.json` catalog for discovery, and the marketplace manifest
(`.claude-plugin/marketplace.json`) for the Tavern crew roster; projected to the docs site. Every unit
follows the shared [`axi/`](../axi/README.md) output contract.

Units (the three interaction surfaces — discover / acquire+source / crew):

- [`awesome-list/`](./awesome-list/README.md) — *behavioral* — **discover**: curated-list discovery,
  `cyberplace awesome find / inspect / render / sources` over the catalog. **Backfilled** from source.
- [`registry/`](./registry/README.md) — *behavioral* — **acquire + source**: install / remove / update
  / list installed skills, `cyberplace find` across marketplaces, `config provider` source management,
  and lock `migrate`. **Backfilled** from `src/registry/`.
- [`tavern/`](./tavern/README.md) — *behavioral* — the crew **storefront**: keyed on the reserved
  `crew` tag in the marketplace manifest (`.claude-plugin/marketplace.json`), the dedicated
  `cyberplace tavern` command, and a Starlight top-nav storefront that renders the crew roster.

Two-level cap holds: each is `marketplace/<unit>`; no third folder level.
