---
status: draft
type: feature
blocked-by: []
aligned: false
---

# DAG Tooling

---

## What

A universal-plugin-owned **skill** that performs reusable directed-graph operations over a node-and-edge model, so plugins stop re-deriving graph logic in agent context. The skill runs a bundled `.mts` script for the deterministic work and falls back to documented agent-level procedures when Node is unavailable.

The primitives are domain-agnostic:

- **Cycle detection** — report a cycle (with the offending path) or confirm acyclicity.
- **Topological order** — return an execution order for an acyclic graph.
- **Single-parent tree validation** — given containment edges, confirm every child has at most one parent and report multi-parent or orphan violations.
- **Parent-from-children resolution** — derive each node's parent from the children lists declared on other nodes (one source of truth).
- **Mermaid rendering** — emit a `graph TD` view of a node-and-edge set.

The skill knows nothing about `spec.md`, `status`, or any SDD field; callers supply nodes and edges and interpret results. SDD's `render-spec-graph` and `validate-spec` are the first consumers: they parse spec frontmatter and delegate the graph computation here.

---

## Why

Cycle detection, topological ordering, and tree-invariant checks are deterministic computations that several plugins need (spec DAGs, task DAGs, dependency ordering, documentation graphs). Re-deriving them in agent context each time burns tokens and risks inconsistency. Codifying them once as a script the agent invokes makes the work cheap and uniform. A CLI subcommand would force the unsolved pinned-version resolution problem, so the logic ships inside a skill that runs a local script — and degrades to agent instructions where Node is absent, so the capability never hard-fails on environment.

---

## Design decisions

### Skill-run script, not a CLI subcommand

The tooling ships as a universal-plugin skill whose body invokes a bundled `.mts` script with `node`. It is not exposed as a `universal-plugin` CLI subcommand, because invoking a version-pinned CLI is an unresolved problem in this project; a skill-local script runs without pinning.

### Node-optional with an agent fallback

When Node is available the skill runs the script and returns its result. When Node is unavailable the skill carries the equivalent agent-level procedure for each operation, so callers still get an answer. The two paths must agree on inputs and outputs.

### Domain-agnostic node-and-edge contract

Operations take an explicit node list and typed edge lists (dependency edges, containment edges) and return structured results. No operation reads files or assumes SDD semantics; consumers own parsing and interpretation. This keeps the tooling reusable across plugins.

### Containment and dependency are separate edge sets

Tree validation and parent resolution operate on containment edges; cycle detection and topological order operate on dependency edges. A single call may be given both, and the two are never conflated.

---

## Surface

The skill exposes named operations; the bundled script is the reference implementation and the agent fallback mirrors it.

```text
detect-cycle      in: nodes, dependency-edges            out: acyclic | cycle-path
topological-order in: nodes, dependency-edges (acyclic)  out: ordered node list
validate-tree     in: nodes, containment-edges           out: ok | [multi-parent | orphan violations]
resolve-parents   in: nodes with children lists          out: child -> parent map
render-mermaid    in: nodes, edges                        out: graph TD text
```

Inputs and outputs are plain data (slugs and edge pairs); the skill does not read or write project files.

---

**Gherkin scenarios:** [dag-tooling.feature](./dag-tooling.feature)

---

## Related

- `artifacts/specs/universal-plugin/spec.md` — owning project
- `artifacts/specs/sdd-spec-graph/spec.md` — first SDD consumer (spec DAG rendering)

---

## Artifacts

| Label | Path |
|---|---|
| Spec | `artifacts/specs/dag-tooling/spec.md` |
| Scenarios | `artifacts/specs/dag-tooling/dag-tooling.feature` |
