---
name: director-spec-judge-governance
description: "Internal governance (not user-invokable): the Director bar for react-component, spec-judge face. Grading scope / kill-or-ship, by discipline. Loaded at the spec gate."
user-invocable: false
metadata:
  artifact-type: react-component
  actor: director
  gate: spec
  face: judge
  compose: union
---

# director · spec · judge — grade scope, by discipline

The **Director** bar (spec gate only), **backward**: grade the spec's scope and kill-or-ship. Same
sections as the producer, read as **checks**.

## product

- Is the component's reason-to-exist stated and real (not a duplicate)? Is a kill/revert condition
  reachable?

## api-design

- Is the prop surface bounded with explicit non-goals? Any speculative prop → flag.

## dx

- Does it cohere with the library's existing patterns, or introduce an unjustified new one?
