---
name: architect-spec-judge-governance
description: "Internal governance (not user-invokable): the Architect bar for react-component, spec-judge face. Grading structural fit from spec + suite, by discipline. Loaded at the spec gate."
user-invocable: false
metadata:
  artifact-type: react-component
  actor: architect
  gate: spec
  face: judge
  compose: union
---

# architect · spec · judge — grade structural fit (from spec + suite)

The **Architect** bar at the **spec gate**, **backward** face: the cold spec-judge reads `spec.md` +
`.feature` **only** (the solution is out of view) and grades structural fit. Same sections, as checks.

## module-structure

- Does the contract duplicate an existing component or overlap a sibling's responsibility?

## dependency-hygiene

- Does the spec imply a dependency the library shouldn't take (e.g. a date lib for a Button)?

## bundle

- Does the contract force a non-tree-shakeable shape (a barrel that drags unrelated code)?
