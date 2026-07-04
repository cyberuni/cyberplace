# decisions — cyberplace ADR log

Append-only, descriptive, ungated project-scope decisions. The project sibling of a unit's
`<unit>.solution.md`. Organize no node as an ADR body — this folder only logs decisions.

Decisions (marketplace / Tavern grill):

- **crew facet shape** — DECIDED: a reserved `crew` tag in an entry's `tags[]`; **no** catalog
  schema change. Chosen over a `highlights.type: crew` because only `RepoEntry` carries `highlights`
  — a `tags[]` marker is the only one that lets a *skill* entry also be a crew.
- **Tavern interface** — DECIDED: a dedicated top-level `cyberplace tavern` command (not an
  `awesome find --crew` flag), plus a Starlight storefront page shipped in the same CR.
- **crew qualification** — DECIDED: an entry is a crew iff it ships an installable persona gateway
  skill (`metadata.persona`); the `crew` tag is author-asserted (no deep validation this CR).
- **Tavern surface** — the storefront as a Starlight docs projection of the crew-tagged catalog,
  not a second governed source.
