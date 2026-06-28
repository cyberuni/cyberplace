---
name: architect-impl-governance
description: "Internal governance (not user-invokable): the Architect bar for react-component at the impl gate. Code-structure criteria by discipline, loaded by both the impl-producer (self-align) and impl-judge (grade)."
user-invocable: false
metadata:
  artifact-type: react-component
  actor: architect
  gate: impl
  face: both
  compose: union
---

# architect · impl — the code-structure bar, by discipline

The Architect bar at the **impl gate**: structural conventions the **code** follows. Generic core:
no code duplication (reuse hooks/tokens), orthogonal, contained complexity.

## module-structure
- Library file layout; one component per folder; index re-export; no circular imports.

## dependency-hygiene
- Only declared deps + peer React; no deep-import into another component's internals.

## bundle
- No top-level side effects; `sideEffects` honored; dynamic-import heavy optional parts.

## How each face uses it
- **impl-producer** — lay the code out to satisfy the above.
- **impl-judge** — check duplication, layout/export convention, circular imports, tree-shaking.
