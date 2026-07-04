---
spec-type: reference
concept: [discovery]
---

# glossary — cyberplace terms

## Subject

Shared vocabulary for the cyberplace spec. Backfilled narrow — marketplace terms only.

- **catalog** — the curated `awesome-skills.json`: `repos{}` + `skills{}`, each entry carrying
  `kind`, `trust`, `summary`, `tags[]`, and typed `highlights[]`.
- **awesome-list** — the rendered markdown projection of the catalog (`render:awesome-list`,
  marker-delimited block).
- **crew** — a marketplace entry that is an installable persona plugin/skill with a personated
  gateway skill (a recruitable spaceship crew). Surfaced by the crew facet.
- **crew facet** — the catalog metadata that marks an entry a crew (a reserved `crew` tag or a
  `highlights.type: crew`) so it can be filtered.
- **Tavern** — the storefront surface (docs section + `awesome find --crew` filter) where a user
  browses and installs crews.
