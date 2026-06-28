---
name: director-spec-producer-governance
description: "Internal governance (not user-invokable): the Director bar for react-component, spec-producer face. Scope / kill-or-ship self-align, by discipline. Loaded while scoping the spec."
user-invocable: false
metadata:
  artifact-type: react-component
  actor: director
  gate: spec
  face: producer
  compose: union
---

# director · spec · producer — scope the component, by discipline

The **Director** bar (spec gate only — director has no impl face), **forward**: self-align on scope
and kill-or-ship while writing the spec. Generic core: one coherent unit, bounded surface, explicit
non-goals, value clears cost.

## product

- The library actually needs this component (a real gap, not a re-skin of an existing primitive);
  state the kill/revert condition.

## api-design

- Minimal, coherent prop surface; explicit non-goals (what variants/behaviors are out); no prop that
  exists "just in case."

## dx

- Composes with the existing components and matches the library's mental model; no new pattern a
  consumer must learn without justification.
