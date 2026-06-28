---
name: builder-spec-judge-governance
description: "Internal governance (not user-invokable): the Builder bar for react-component, spec-judge face. Grading whether the .feature COVERS each discipline's concern. Loaded at the spec gate."
user-invocable: false
metadata:
  artifact-type: react-component
  actor: builder
  gate: spec
  face: judge
  compose: union
---

# builder · spec · judge — grade the suite's coverage, by discipline

The **Builder** bar at the **spec gate**, **backward** face: grade the `.feature` for *coverage* of
each discipline and boolean testability. A concern with no scenario is a gap → fail. Same sections as
the spec-producer, read as **checks**.

## engineer

- Each scenario asserts an observable outcome (no "renders correctly"); typed surface is exercised.

## designer

- Every visual state has a scenario; none unspecced.

## a11y

- Role, keyboard, accessible name, and `axe` each have a scenario; no a11y concern unscenarioed.

## security

- Each untrusted-input path has a sanitization/inert scenario.

## qa

- Empty/error/boundary scenarios present; happy-path-only is a coverage gap.
