---
name: architect-impl-judge-governance
description: "Internal governance (not user-invocable): the Architect bar for react-component, impl-judge face. Grading the CODE's structural fit, by discipline. Loaded at the impl gate."
user-invocable: false
metadata:
  artifact-type: react-component
  actor: architect
  gate: impl
  face: judge
  compose: union
---

# architect · impl · judge — grade the code's structural fit

The **Architect** bar at the **impl gate**, **backward**: grade the code's structure. Same sections,
as checks.

## module-structure

- Code duplication present? File layout / export convention followed? Circular imports?

## dependency-hygiene

- Undeclared imports or deep-imports into another component's internals?

## bundle

- Top-level side effects that defeat tree-shaking? `sideEffects` correct?
