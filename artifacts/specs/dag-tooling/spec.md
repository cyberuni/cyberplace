---
status: draft
type: feature
domain-type: skill
blocked-by: []
aligned: true
approval:
  spec:
    verdict: pause
    why:
      reversibility: "safe — contract files only (spec.md + .feature), cheap git revert, no external effect"
      blast-radius:  "safe — at the spec gate the object is this spec's own contract; no consumer is built against it yet, so approving the Draft→Approved transition touches no other spec, frozen contract, or installed surface"
      novelty:       "risky — three contestable contract choices the human has not ratified: node-optional delivery, the domain-agnostic typed-edge model, and resolve-parents reporting a double-claim as a multi-parent violation. Council authorized the operator to PICK sensible defaults; picking is not the same as ratification"
      confidence:    "safe — spec-judge PASSES clean: all 14 scenarios green, ## Use Cases complete, 0 open markers, prior 5 blockers all resolved"
produced-by:
  spec-judge: sdd:sdd-spec-judge
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

### `topological-order` requires acyclic input — a cycle is caller error

`topological-order` is defined **only** for an acyclic dependency graph. Its contract is: the caller guarantees acyclicity (typically by running `detect-cycle` first). Given cyclic input it does not invent an order and does not silently drop edges — it reports the input as a caller error (a cycle violation, same shape `detect-cycle` returns). Ordering a cyclic graph is undefined, so the contract is explicit rather than best-effort.

### `resolve-parents` reports a multi-parent claim as a violation

Parent resolution derives each child's parent from the children lists other nodes declare. The happy path is one source of truth: exactly one node declares a given child. When **two parents claim the same child**, that is **not** out of scope and not silently last-writer-wins — `resolve-parents` reports a `multi-parent` violation for that child (the same notion `validate-tree` reports), naming the child and the contending parents. The single-parent invariant is the whole point of the operation, so a breach of it is a first-class result, not an edge swallowed.

---

## Use Cases

Each surface operation is one entry-point: a caller supplies plain node-and-edge data and interprets the structured result. No operation reads or writes files.

| Operation | Trigger | Inputs | Outcome |
|---|---|---|---|
| **detect-cycle** | a caller needs to know if a dependency graph is acyclic before ordering it | `nodes`, `dependency-edges` | `acyclic`, or a `cycle-path` naming the offending nodes |
| **topological-order** | a caller needs an execution order for a graph it has already confirmed acyclic | `nodes`, `dependency-edges` (caller-guaranteed acyclic) | an ordered node list where every node precedes its dependents; on cyclic input, a caller-error cycle violation |
| **validate-tree** | a caller needs to confirm containment edges form a single-parent tree | `nodes`, `containment-edges` | `ok` (no violations), or a list of `multi-parent` / `orphan` violations |
| **resolve-parents** | a caller needs each node's parent derived from declared children lists (one source of truth) | `nodes` with children lists | a `child → parent` map; a `multi-parent` violation for any child claimed by two parents |
| **render-mermaid** | a caller needs a human-readable view of a node-and-edge set | `nodes`, `edges` | a `graph TD` Mermaid block, one edge line per edge |

Two cross-cutting use cases govern *how* every operation runs, independent of which operation:

| Concern | Trigger | Inputs | Outcome |
|---|---|---|---|
| **Node-optional delivery** | any operation is invoked | the operation's inputs + the ambient environment | the bundled script's result when Node is available; the agent-level procedure's result when not — **the same result shape across both paths** |
| **Domain agnosticism** | any operation is invoked | caller-supplied nodes and edges only | a result computed purely from the supplied data — no spec/project files read, no SDD-specific field interpreted |

---

## Surface

The skill exposes named operations; the bundled script is the reference implementation and the agent fallback mirrors it.

```text
detect-cycle      in: nodes, dependency-edges            out: acyclic | cycle-path
topological-order in: nodes, dependency-edges (acyclic)  out: ordered node list | cycle-violation (caller error)
validate-tree     in: nodes, containment-edges           out: ok | [multi-parent | orphan violations]
resolve-parents   in: nodes with children lists          out: child -> parent map | multi-parent violation
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
