---
name: builder-spec-producer-governance
description: "Internal governance (not user-invocable): the Builder bar for react-component, spec-producer face. Ensuring the .feature COVERS each discipline's concern. Loaded while writing the spec + suite."
user-invocable: false
metadata:
  artifact-type: react-component
  actor: builder
  gate: spec
  face: producer
  compose: union
---

# builder · spec · producer — cover each discipline in the suite

The **Builder** bar at the **spec gate**, **forward** face: while writing the `.feature`, ensure each
discipline's concern is **covered by a boolean scenario** (the spec-side bar is about *coverage*, not
the code's *conformance* — that is the impl face). Generic core: every behavior observable, happy +
negative, no untestable scenario.

## engineer

- Scenarios assert observable, typed outcomes (ref reaches the DOM node; `aria-*`/`data-*` pass
  through) — not internal implementation.

## designer

- One scenario per visual state (default/hover/focus/active/disabled/loading).

## a11y

- Scenarios for role, keyboard interaction, accessible name, and an `axe`-clean assertion per state.

## security

- A scenario for each untrusted-input path (e.g. a URL/HTML prop is rendered inert/sanitized).

## qa

- Scenarios for empty / error / boundary inputs, not only the happy path.
