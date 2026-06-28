---
name: designer-coherence-rubric-governance
description: "Internal governance (not user-invokable): the designer discipline's SUBJECTIVE visual-coherence rubric for react-component. Judge-only — the one slice a producer must not self-grade. Loaded by the impl-judge / acceptance review."
user-invocable: false
metadata:
  artifact-type: react-component
  actor: builder
  gate: impl
  face: judge
  compose: union
---

# designer · coherence — judge-only visual-coherence rubric

The **one** part of the designer discipline that does **not** merge across faces: visual coherence
can't be reduced to a boolean, so it is a **judge-only** `@rubric` the producer must not self-grade
against verbatim (the objective designer criteria — tokens, all states, RTL — stay in the merged
`builder-impl-governance` / `builder-spec-governance`).

## The rubric (scored over the rendered states, threshold by hand)

- **hierarchy** — visual weight matches importance; the primary action reads first.
- **consistency** — density, rhythm, and motion match the nearest existing components.
- **polish** — spacing/alignment/optical balance hold across states.

Score each 0–2 over the component's rendered states; the gate passes at the project threshold. This
is the `@rubric` suite form (`authoring/suite-format`), judged at the impl gate or in `acceptance/`.
