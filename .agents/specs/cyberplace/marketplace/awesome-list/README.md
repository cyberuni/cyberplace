---
spec-type: behavioral
concept: [discovery, axi]
---

# awesome-list — curated skill/plugin discovery

> Output follows the shared [AXI output contract](../../axi/README.md) (TOON default, aggregate,
> truncation + `--full`, definitive empty state, next-step on stderr, fail-loud). **Impl trails the
> contract** — the shipped `cyberplace awesome` commands still emit prose + `--format json`; the impl
> gate is withheld until a follow-up mission builds the AXI surface.

Reverse-engineered from `packages/cyberplace/src/awesome/` (`lib.ts`, `cli.ts`, `render.ts`,
`sources.ts`, `inspect.ts`) + `awesome-skills.json`. The behavior suite
[`awesome-list.feature`](./awesome-list.feature) now exists — it covers find / inspect / render /
sources and asserts conformance to the AXI output contract.

## Use Cases

The suite follows the AXI output contract (see [`../../axi/README.md`](../../axi/README.md)).

The `cyberplace awesome` command group over the curated catalog:

- **find** — free-text search across repos/skills with scoring (name exact/contains, summary, tags,
  highlights) plus corroboration and source-class bonuses; TOON by default (the AXI surface),
  `--format json` the structured escape hatch (`findAwesomeSkills` in `lib.ts`).
- **inspect `<repo>`** — read a local or remote repo's `skills/*/SKILL.md` frontmatter, optional
  `--query` substring filter (`inspect.ts`).
- **render** — render the catalog into the marker-delimited markdown block
  (`<!-- AWESOME-SKILLS:START/END -->`), grouped by `trust` (`render.ts`, `render:awesome-list`).
- **sources** — layered source config (local-private / repo-shared / global-user) list / add /
  remove / disable / enable (`sources.ts`).
- Catalog validation + multi-source merge/dedupe with corroboration counting; derives install
  commands (`npx skills add <repo>`).

**Non-goals / edges:** the reserved `crew` tag + the dedicated `cyberplace tavern` command belong to
[`../tavern/`](../tavern/README.md) (decided — see `design/decisions/`), not here; this unit stays
the general discovery surface.
