# Spec DAG

The dependency graph across all specs in `artifacts/specs/`. Each node is a spec folder (the slug is its ID); each edge `A --> B` means **A blocks B** (B declares `blocked-by: [A]`).

This is a **derived view** — `blocked-by` in each `spec.md` is the source of truth. Regenerate this diagram when edges change; do not hand-edit edges here. Order of execution is the topological sort of this graph; there is no authored `priority`.

```mermaid
graph TD
  aces-plugin
  aces-skill-spec-schema --> aces-spec-designer-composition
  governance-composition --> aces-spec-designer-composition
  define-skill
  motive-model
  sdd-orchestrator
  sdd-plugin --> universal-plugin
```

## Nodes

| Spec | blocked-by | status |
|---|---|---|
| `aces-plugin` | — | draft |
| `aces-skill-spec-schema` | — | draft |
| `aces-spec-designer-composition` | `governance-composition`, `aces-skill-spec-schema` | draft |
| `define-skill` | — | draft |
| `governance-composition` | — | draft |
| `motive-model` | — | draft |
| `sdd-orchestrator` | — | draft |
| `sdd-plugin` | — | draft |
| `universal-plugin` | `sdd-plugin` | draft |
