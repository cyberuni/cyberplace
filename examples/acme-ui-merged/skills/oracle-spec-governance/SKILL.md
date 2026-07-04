---
name: oracle-spec-governance
description: "Internal governance (not user-invocable): the Oracle bar for react-component at the spec gate. Scope / kill-or-ship criteria by discipline, loaded by both the spec-producer (self-align) and spec-judge (grade)."
user-invocable: false
metadata:
  artifact-type: react-component
  actor: oracle
  gate: spec
  face: both
  compose: union
---

# oracle · spec — the scope / kill-or-ship bar, by discipline

The Oracle bar (spec gate only — no impl face). Stated once; the spec-producer self-aligns scope,
the spec-judge grades it. Generic core: one coherent unit, bounded surface, explicit non-goals, value
clears cost.

## product
- A real gap, not a re-skin of an existing primitive; a kill/revert condition is stated.

## api-design
- Minimal, coherent prop surface; explicit non-goals; no speculative "just in case" prop.

## dx
- Composes with existing components and the library's mental model; no unjustified new pattern.

## How each face uses it
- **spec-producer** — bound the scope to satisfy the above before writing.
- **spec-judge** — flag scope creep, missing non-goals, or an unjustified new pattern.
