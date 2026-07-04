---
spec-type: behavioral
concept: [discovery]
---

# awesome-list — curated skill/plugin discovery

**Backfill stub** — reverse-engineered from `packages/cyberplace/src/awesome/`
(`lib.ts`, `cli.ts`, `render.ts`, `sources.ts`, `inspect.ts`) + `awesome-skills.json`. The
`.feature` is authored later in the per-unit explore grill (read source/tests/history; do not
re-grill for intent). No `.feature` yet.

## Use Cases

The `cyberplace awesome` command group over the curated catalog:

- **find** — free-text search across repos/skills with scoring (name exact/contains, summary, tags,
  highlights) plus corroboration and source-class bonuses; output text / json / agent
  (`findAwesomeSkills` in `lib.ts`).
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
