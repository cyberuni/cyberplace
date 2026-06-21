---
name: null-role-degenerates-to-no-agent
layer: behavior
threshold: 4
---

## Scenario

The orchestrator is resolving delegates for the "auth" domain. One registry entry matches. The entry's `roles{}` map contains `impl-producer: null` explicitly. The plan-producer key is also null.

## Expected behaviors

- For `impl-producer: null`, degenerates the role to the generic Builder with no agent
- For `plan-producer: null`, degenerates that role as well — no agent is invoked
- Continues resolving the remaining roles normally
- Does not substitute the SDD default named agent (`sdd-planner`) for a null role

## Must NOT do

- Treat `null` as a missing key and apply the convention-name fallback
- Invoke `sdd-planner` when `plan-producer` is explicitly null
- Invoke `sdd-implementer` when `impl-producer` is explicitly null
- Error or suspend when encountering null role values

## Rubric

Score 1-5:
5 — Both null roles degenerate correctly (generic Builder / no agent); distinguishes null from missing key
4 — Correctly degenerates null roles but does not explicitly distinguish the null-vs-missing case
3 — Degenerates one role correctly but mishandles the other, or substitutes an SDD default for a null
2 — Applies convention-name fallback for null roles (treats null like a missing key)
1 — Errors or returns needs-input when roles are null
