---
name: builder-spec-governance
description: "Internal governance (not user-invocable): the Builder bar for react-component at the spec gate. Suite-coverage criteria by discipline, loaded by both the spec-producer (self-align) and spec-judge (grade)."
user-invocable: false
metadata:
  artifact-type: react-component
  actor: builder
  gate: spec
  face: both
  compose: union
---

# builder · spec — the suite-coverage bar, by discipline

The Builder bar at the **spec gate**: does the `.feature` **cover** each discipline's concern (the
spec side is *coverage*, the impl side is *conformance*)? Stated once; the spec-producer self-aligns,
the spec-judge grades. Generic core: every scenario observable + boolean; happy + negative.

## engineer
- Scenarios assert observable, typed outcomes (ref reaches the DOM node; `aria-*` pass through).

## designer
- One scenario per visual state.

## a11y
- Scenarios for role, keyboard, accessible name, and an `axe`-clean assertion per state.

## security
- A scenario per untrusted-input path (rendered inert / sanitized).

## qa
- Empty / error / boundary scenarios, not only the happy path.

## How each face uses it
- **spec-producer** — write the suite so each concern above has ≥1 boolean scenario.
- **spec-judge** — a concern with no scenario is a coverage gap → fail.
