---
status: implemented
type: feature
blocked-by:
  - sdd-plugin
aligned: true
approval:
  spec:
    verdict: approve
    by: unional
  impl:
    verdict: approve
    by: unional
produced-by:
  spec-producer: sdd:sdd-scenario-writer
  spec-judge: sdd:sdd-spec-judge
---

# Spec Graph Renderer

---

## What

An SDD capability that renders the **spec DAG** to a derived `graph.md`. It reads every `spec.md` under a specs root, including nested spec folders, parses the `blocked-by` frontmatter edges, detects cycles, computes a topological order, and emits a Mermaid diagram plus a node table.

The source of truth is the `blocked-by` field in each spec (see the *spec DAG* in `sdd-plugin/spec.md`); `graph.md` is a **derived view** that must never be hand-edited.

It ships as a **non-user-invocable SDD skill** — `render-spec-graph` — with a self-contained `.mts` script in its `scripts/` folder. The script is deterministic and runs on plain `node` (≥ 23.6, native TypeScript type-stripping; v24+ has it on by default with no flag; no `tsx`, no `npx`, no dependencies). When `node` is unavailable, an agent fallback renders the same format by reading the specs directly — the same dual-mode pattern as `sdd-spec-judge`.

```mermaid
flowchart LR
  specs[specs/**/spec.md<br/>blocked-by edges] --> render[render-spec-graph.mts]
  render --> graph[graph.md<br/>Mermaid + node table]
  render -->|--check| ci{stale?}
  ci -->|yes| fail[exit 1]
  ci -->|no| ok[exit 0]
```

---

## Why

`graph.md` is a derived artifact. Hand-maintaining it guarantees drift: the moment a `blocked-by` edge changes, the rendered graph silently lies. Deriving it mechanically from the `blocked-by` fields keeps the picture honest and lets a `--check` mode fail CI when the committed `graph.md` no longer matches the specs.

The renderer also makes the DAG's invariants enforceable: a cycle in `blocked-by` is an authoring error the tool can catch, and the topological order it computes is the canonical "what can be worked next" view — replacing the hand-authored `priority` field that was removed.

---

## Use Cases

Four coarse-grained entry points invoke the renderer. Every `.feature` scenario verifies at least one of them.

| # | Use case | Trigger | Inputs | Outcome |
|---|---|---|---|---|
| **UC1** | CI staleness check | CI / pre-commit runs the renderer with `--check` | specs root + committed `graph.md` | exit 0 when fresh, exit 1 when stale or missing; writes nothing |
| **UC2** | Manual render | an author or operator runs the renderer in default write mode | specs root | `graph.md` written deterministically with a Mermaid diagram and a node table |
| **UC3** | Agent-fallback render | the renderer is needed but `node` is unavailable | the specs read directly by an agent | the same `graph.md` format produced without the script — the dual-mode floor |
| **UC4** | Exported-function reuse | `node:test` or a future caller imports the script's exported functions | per-function inputs — frontmatter text, root dir, node list | the documented return contracts of `parseFrontmatter` / `collectSpecs` / `detectCycle` / `renderGraph` |

### Scenario mapping

Each `.feature` scenario is mapped to the use case(s) it verifies; every scenario appears at least once.

| Use case | Verifying scenarios |
|---|---|
| **UC1 — CI staleness check** | *check mode passes when graph.md is current*; *check mode fails when graph.md is stale*; *check mode fails when graph.md is missing*; *a non-default specs root is rendered with --root* |
| **UC2 — Manual render** | *a blocked-by edge becomes a graph edge*; *a spec with no edges appears as a bare node*; *multiple blockers produce one edge each*; *the node table lists slug, blocked-by, and status*; *output is deterministic across runs*; *a cycle is rejected*; *a folder without spec.md is ignored*; *a nested spec uses its relative path as the node slug*; *a non-default specs root is rendered with --root* |
| **UC3 — Agent-fallback render** | *a blocked-by edge becomes a graph edge*; *the node table lists slug, blocked-by, and status*; *output is deterministic across runs*; *the agent fallback produces the same graph.md format* |
| **UC4 — Exported-function reuse** | *frontmatter blocked-by is parsed in every form*; *a cycle is rejected*; *a folder without spec.md is ignored*; *a nested spec uses its relative path as the node slug* |

---

## Design decisions

### Lives in SDD, not universal-plugin (for now)

The spec DAG is an SDD concept and SDD is the only consumer today. Placing the renderer in SDD keeps it where it is used; ACES reuses it through its existing dependency on SDD, with no dependency cycle. A generic DAG kernel is extracted to `universal-plugin` (the lowest, dependency-free layer) only when a genuinely non-SDD caller appears — extraction is cheap, premature generality is not.

### A skill with a script, not a CLI command

The capability is delivered as a non-user-invocable skill carrying its own `scripts/render-spec-graph.mts`, not as an `npx` CLI. This keeps the skill self-contained and avoids a NodeJS package-resolution call in the runtime loop. The script is the **deterministic accelerator**; the agent fallback is the floor.

### Native node, no tsx

Scripts are authored in `.mts` and run with plain `node` (≥ 23.6 strips TypeScript types natively; v24+ has it on by default, no flag). No `tsx`, no build step, no third-party runtime. Unit tests use the built-in `node:test` runner (`node --test`), so the skill carries zero test-framework dependency.

### Deterministic output

Given the same `blocked-by` edges the renderer always emits byte-identical `graph.md`: nodes and edges are emitted in a stable sort order. Determinism is what makes `--check` a reliable staleness gate.

### Nested specs are part of the graph

The renderer must discover `spec.md` files anywhere under `<root>/**/spec.md`, not only at the first folder level. Each node slug is the root-relative folder path that contains the spec, so a spec at `artifacts/specs/sdd/sdd-skill/spec.md` renders as `sdd/sdd-skill`.

### `--check` is the staleness gate

`--check` renders to memory and compares against the committed `graph.md`. It writes nothing and exits non-zero when they differ — the CI guarantee that the graph can never merge drifted. The default mode writes the file.

---

## Command surface / API

```
node <skill>/scripts/render-spec-graph.mts [--root <dir>] [--out <file>] [--check]
```

| Flag | Default | Meaning |
|---|---|---|
| `--root <dir>` | `artifacts/specs` | Directory whose descendants may contain spec folders |
| `--out <file>` | `<root>/graph.md` | Output path for the rendered graph |
| `--check` | off | Render and compare only; exit 1 if `--out` is stale or missing; write nothing |

**Exit codes:** `0` success (written, or fresh under `--check`); `1` stale/missing under `--check`, or a cycle detected, or an unreadable spec.

Exported functions (for `node:test` and future reuse):

| Function | Contract |
|---|---|
| `parseFrontmatter(text)` | `{ status, blockedBy[] }` from a `spec.md`'s YAML frontmatter; tolerates inline `[a, b]`, block `- a`, and empty |
| `collectSpecs(root)` | `[{ slug, status, blockedBy[] }]` for every `<root>/**/spec.md`, sorted by root-relative slug |
| `detectCycle(nodes)` | a cycle path `string[]` or `null` |
| `renderGraph(nodes)` | the full `graph.md` content string (deterministic) |

**Gherkin scenarios:** [sdd-spec-graph.feature](./sdd-spec-graph.feature)

---

## Related

- `artifacts/specs/sdd-plugin/spec.md` — defines the spec DAG and the `blocked-by` edges this renders
- `artifacts/specs/sdd-orchestrator/spec.md` — the dual-mode deterministic-step-plus-agent-fallback pattern (`sdd-spec-judge`)

---

## Artifacts

| Label | Path |
|---|---|
| Spec | `artifacts/specs/sdd-spec-graph/spec.md` |
| Scenarios | `artifacts/specs/sdd-spec-graph/sdd-spec-graph.feature` |
| Plan | `artifacts/specs/sdd-spec-graph/plan.md` |
| Tasks | `artifacts/specs/sdd-spec-graph/tasks.md` |
| Skill | `plugins/sdd/skills/render-spec-graph/` |
| Script | `plugins/sdd/skills/render-spec-graph/scripts/render-spec-graph.mts` |
| Tests | `plugins/sdd/skills/render-spec-graph/scripts/render-spec-graph.test.mts` |
| Rendered view | `artifacts/specs/graph.md` |
