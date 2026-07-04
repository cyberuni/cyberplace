---
name: architect-impl-producer-governance
description: "Internal governance (not user-invocable): the Architect bar for react-component, impl-producer face. Structural conventions the CODE must follow, by discipline. Loaded while building."
user-invocable: false
metadata:
  artifact-type: react-component
  actor: architect
  gate: impl
  face: producer
  compose: union
---

# architect · impl · producer — structure the code, by discipline

The **Architect** bar at the **impl gate**, **forward**: structural conventions the **code** follows.
Generic core: no code duplication (reuse hooks/tokens), orthogonal, contained complexity.

## module-structure

- File layout matches the library convention; one component per folder; index re-export; no circular
  imports.

## dependency-hygiene

- Imports only declared deps + peer React; no deep-import into another component's internals.

## bundle

- No top-level side effects; `sideEffects` honored; dynamic-import the heavy optional parts.
