# glossary — cyberplace terms

## Subject

Shared vocabulary for the cyberplace spec. Backfilled narrow — marketplace terms only.

- **catalog** — the curated `awesome-skills.json`: `repos{}` + `skills{}`, each entry carrying
  `kind`, `trust`, `summary`, `tags[]`, and typed `highlights[]`.
- **awesome-list** — the rendered markdown projection of the catalog (`render:awesome-list`,
  marker-delimited block).
- **crew** — a plugin in the cyberplace marketplace manifest (`.claude-plugin/marketplace.json`)
  that ships an installable persona gateway skill (a recruitable spaceship crew). Surfaced by the
  crew facet, recruited via `cyberplace add <name>`.
- **crew facet** — the reserved `crew` tag in a marketplace-manifest entry's `tags[]` that marks it
  a crew so it can be filtered — no marketplace-manifest schema change.
- **Tavern** — the storefront surface (the `cyberplace tavern` command + a docs section) where a
  user browses and recruits crews.
