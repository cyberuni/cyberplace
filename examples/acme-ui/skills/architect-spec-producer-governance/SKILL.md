---
name: architect-spec-producer-governance
description: "Internal governance (not user-invokable): the Architect bar for react-component, spec-producer face (the solution-producer). Structural decisions in the solution, by discipline. Loaded while writing the solution."
user-invocable: false
metadata:
  artifact-type: react-component
  actor: architect
  gate: spec
  face: producer
  compose: union
---

# architect · spec · producer — structural decisions in the solution

The **Architect** bar at the **spec phase**, **forward** face — loaded by the **solution-producer**
(architecture self-aligns on the ungated `*.solution.md`, not the spec-producer). Generic core: no
duplication, orthogonal to siblings, contained complexity; record rejected alternatives.

## module-structure

- Where the component lives, how it is exported (re-export from the package root), naming consistent
  with the library.

## dependency-hygiene

- React is a `peerDependency`; no heavy runtime dep added for a small gain; justify any new dep.

## bundle

- Tree-shakeable (no top-level side effects); the component does not pull the whole library.
