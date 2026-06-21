# Plan: Spec Graph Renderer

## Approach

A single self-contained `.mts` module that is both an importable library (pure functions) and a CLI (when run directly). No build step, no third-party runtime — plain `node` strips the types. Tests import the pure functions via `node:test`.

The module separates concerns so each is testable in isolation:

1. **Parse** — `parseFrontmatter(text)` extracts `status` and `blockedBy[]` from a spec's YAML frontmatter, tolerating inline, block-list, and empty forms. No YAML dependency; a small hand-rolled reader scoped to the two fields.
2. **Collect** — `collectSpecs(root)` walks `<root>/**/spec.md`, parses each, returns `{ slug, status, blockedBy }[]` sorted by root-relative slug. Folders without `spec.md` are skipped.
3. **Validate** — `detectCycle(nodes)` runs a DFS coloring; returns the cycle path or `null`.
4. **Render** — `renderGraph(nodes)` emits the deterministic `graph.md`: intro, Mermaid block (bare nodes sorted, then edges sorted), node table sorted by slug.
5. **Drive** — `main(argv)` parses flags, wires the above, handles `--check` vs write, sets exit codes.

## Determinism strategy

- `collectSpecs` sorts by slug.
- Mermaid: emit isolated nodes (no in/out edge) first, alphabetically; then all `parent --> child` edges, alphabetically.
- Node table: rows sorted by slug.

This makes `renderGraph` a pure function of the edge set, which is what makes `--check` a reliable gate.

## Failure handling

| Condition | Behavior |
|---|---|
| cycle in `blocked-by` | print the cycle path, exit 1, write nothing |
| unreadable / malformed spec | print path + reason, exit 1 |
| `--check` and stale/missing | print which file is stale, exit 1, write nothing |
| `node` unavailable | out of scope for the script — the skill's agent fallback renders the format |

## Agent fallback

The SKILL.md documents the deterministic invocation first and, below it, the fallback: if `node` cannot run, the agent reads every `<root>/**/spec.md`, parses `blocked-by`, and writes `graph.md` in the exact documented format. Dual-mode, mirroring `sdd-spec-judge`.

## Test strategy

`node:test` over the pure functions, fed inline fixtures (no disk where avoidable; a `tmp` dir for `collectSpecs`):

- `parseFrontmatter`: inline `[a,b]`, block list, empty `[]`, missing field, status read.
- `detectCycle`: acyclic → null; 2-node cycle; self-loop; longer cycle.
- `renderGraph`: edge emitted; bare node emitted; multiple blockers; table rows; idempotent (same input → same output).
- `collectSpecs`: skips folders without `spec.md`; sorts flat and nested root-relative slugs.

## Out of scope

- Watching/auto-regeneration (a trigger concern, not the engine).
- Wiring into `create-spec` / orchestrator / CI — separate tasks once the engine is proven.
- A generic DAG package in `universal-plugin` — only when a non-SDD caller exists.
