---
name: architect-spec-governance
description: "Internal governance (not user-invokable): the Architect bar for react-component at the spec gate. Structural-fit criteria by discipline, loaded by the solution-producer (self-align) and spec-judge (grade)."
user-invocable: false
metadata:
  artifact-type: react-component
  actor: architect
  gate: spec
  face: both
  compose: union
---

# architect · spec — the structural-fit bar, by discipline

The Architect bar at the **spec gate**: structural fit. Generic core: no duplication, orthogonal,
contained complexity; record rejected alternatives.

> **Asymmetric inputs (the one wrinkle for merging here).** The two faces read *different artifacts*:
> the producer is the **solution-producer**, self-aligning in the ungated `*.solution.md`; the cold
> **spec-judge** reads `spec.md` + `.feature` **only** (the solution is out of view). Same bar,
> different surface — stated once, with the per-face note below.

## module-structure
- Where it lives; re-export from the package root; naming consistent with the library.

## dependency-hygiene
- React is a `peerDependency`; no heavy runtime dep for a small gain.

## bundle
- Tree-shakeable; the component doesn't drag the whole library.

## How each face uses it
- **solution-producer** — record the structural decisions + rejected alternatives in the solution.
- **spec-judge** — infer structural fit from the spec + suite (duplication? a dep the lib shouldn't
  take? a non-tree-shakeable shape?) without the solution.
