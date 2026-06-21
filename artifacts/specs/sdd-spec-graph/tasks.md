# Tasks: Spec Graph Renderer

Each task is an executable unit; dependencies are noted. Order is emergent from the deps, not authored priority.

## Phase 1 — Engine (the deterministic script)

- [x] `parseFrontmatter(text)` — read `status` + `blockedBy[]`; tolerate inline / block / empty `blocked-by` — serves: *frontmatter parsed in every form* — file: `scripts/render-spec-graph.mts`
- [x] `collectSpecs(root)` — list `<root>/*/spec.md`, parse each, sort by slug, skip folders without `spec.md` — deps: parseFrontmatter — serves: *folder without spec.md is ignored*
- [x] `detectCycle(nodes)` — DFS coloring, return cycle path or null — serves: *a cycle is rejected*
- [x] `renderGraph(nodes)` — deterministic Mermaid (bare nodes then edges, sorted) + node table — deps: collectSpecs — serves: *edge*, *bare node*, *multiple blockers*, *node table*, *deterministic*
- [x] `main(argv)` — flags `--root` / `--out` / `--check`; write vs compare; exit codes — deps: all above — serves: *check passes/fails/missing*, *cycle exits 1*

## Phase 2 — Tests (node:test)

- [x] `parseFrontmatter` cases — deps: parseFrontmatter — file: `scripts/render-spec-graph.test.mts`
- [x] `detectCycle` cases (acyclic, 2-cycle, self-loop, long cycle) — deps: detectCycle
- [x] `renderGraph` cases (edge, bare, multiple blockers, table, idempotent) — deps: renderGraph
- [x] `collectSpecs` cases (skip non-spec folders, sort) — deps: collectSpecs

## Phase 3 — Skill packaging

- [x] `SKILL.md` — non-user-invocable; documents `node scripts/render-spec-graph.mts` + flags + agent fallback — deps: main
- [x] `README.md` — what it does, how to run, how to regenerate `graph.md`

## Phase 4 — Dogfood

- [x] Regenerate `artifacts/specs/graph.md` with the script (replaces the hand-written one); confirm `--check` is clean — deps: main
- [x] Run `node --test` — all green

## Phase 5 — Triggers (deferred, separate spec/tasks)

- [ ] create-spec / orchestrator regenerate `graph.md` after writing `blocked-by`
- [ ] CI `--check` step guarding staleness
