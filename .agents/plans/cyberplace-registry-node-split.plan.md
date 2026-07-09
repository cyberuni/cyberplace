---
name: cyberplace-registry-node-split
status: active
todos:
  - content: "confirm the finding: check-spec-structure --spec-dir .agents/specs/cyberplace flags marketplace/registry/ oversized (52 scenarios > 40); cluster the scenarios by theme (done below) — note most of the excess is cross-cutting (output format, aggregates, definitive-empty-state, CLI ergonomics) rather than verb-specific, which makes this a harder boundary call than a typical split"
    status: completed
  - content: "decide the split boundary — the two clean, verb-specific extractions are config-provider (config provider add/list/remove, ~6 scenarios) and migrate (legacy skills-lock.json migration, ~4 scenarios); together they only bring registry.feature to ~42, still borderline, so the Council/Architect should also decide whether the cross-cutting clusters (output-format ~9, aggregates ~6, definitive-empty-state ~4, CLI-ergonomics ~13) get a shared acceptance-style node, get duplicated per verb-group, or stay put and the 40-scenario heuristic is treated as soft here"
    status: pending
  - content: "author the new node(s)' README.md (spec-type: behavioral, concept tag) with the moved Use Cases; trim marketplace/registry/README.md accordingly"
    status: pending
  - content: "update cross-references (root spec.md capability map, any sibling marketplace/ node non-goals) to point at the new node(s)"
    status: pending
  - content: "spec gate: freeze-preserving split — every moved scenario is verbatim, narrows nothing, self-clears the frozen-contract guard once the Council ratifies the shape; still run the gate to re-freeze both .feature files under their new paths"
    status: pending
  - content: "root pnpm verify; commit by unit of work; handoff"
    status: pending
---

# CR cyberplace-registry-node-split — split the oversized marketplace/registry/ node

Target spec: `.agents/specs/cyberplace` (node `marketplace/registry/` NARROWED, new node(s) —
name(s) TBD, candidates `marketplace/registry-config/` and `marketplace/registry-migrate/`).

## Origin

Filed by the sdd-warden formation pass following `cyberlegion-plugin-init-skill` (post-mission,
corpus-wide structure audit — unrelated to that CR's content, surfaced by the routine corpus-wide
sweep). `check-spec-structure --spec-dir .agents/specs/cyberplace` flags `marketplace/registry/`
**oversized: 52 scenarios > 40**.

Unlike a typical oversized node, the scenarios here do not cluster cleanly by subject. Reading the
titles:

- **acquisition verbs** (add/remove/update, ~13 scenarios) — the core "acquire a skill" surface.
- **discovery verbs** (list/find, ~5).
- **config provider** (add/list/remove a marketplace provider, ~6) — cleanly separable; a distinct
  noun (provider registration vs. skill acquisition).
- **migrate** (legacy `skills-lock.json` conversion, ~4) — cleanly separable; a one-time concern.
- **output format** (TOON/JSON, truncation, `--full`, ~9) — cross-cutting: applies uniformly across
  add/list/find/config/migrate, not a verb of its own.
- **aggregates** (installed/skipped/results/providers/migrated counts, ~6) — cross-cutting, same
  problem.
- **definitive-empty-state** (~4) — cross-cutting, overlaps the two clusters above.
- **CLI ergonomics** (non-interactive, idempotent re-run, unknown-flag, next-step suggestion,
  `--help`, ~13) — cross-cutting across every verb.

Only `config-provider` and `migrate` (~10 scenarios combined) extract cleanly without duplicating a
cross-cutting concern; that alone does not bring the node under the 40-scenario heuristic. This is
a genuinely harder split than the sibling `cyberlegion-identity-presence-split` /
`sdd-conductor-node-split` cases and needs a design call on how (or whether) to carve the
cross-cutting clusters, not just a mechanical move.

## Why this escalates rather than self-clears

First split of this node; the cross-cutting scenario clusters mean the boundary is not
mechanically derivable (novelty is not low), and getting it wrong either duplicates scenarios across
nodes or misrepresents which verb a behavior belongs to (blast is not low). Every candidate move
remains verbatim/coverage-preserving, so once a shape is ratified the split clears the
frozen-contract guard with no re-open needed — it is the shape decision, not the freeze, that
pushes this to a CR.

## NEXT

Not yet started. Run `start-mission` against `.agents/specs/cyberplace` for this CR. The first real
decision is whether the cross-cutting clusters (output-format / aggregates / empty-state /
ergonomics) are worth a shared `marketplace/cli-conventions/`-style node (documenting the pattern
once, cross-referenced from every verb node) rather than trying to force them into `config-provider`/
`migrate`/`registry` — that decision, not the mechanical scenario move, is what the Council/Architect
should rule on first.
