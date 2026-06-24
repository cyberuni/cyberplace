---
status: draft
type: feature
blocked-by:
  - sdd-operator
  - sdd-operator-dispatch
aligned: false
---

# SDD Operator — Freeze: a Strength Gradient

> **Feature child of [`sdd-operator`](../sdd-operator/spec.md).** This spec owns one behavior of the Operator (the SDD lead delegate, `sdd-orchestrator`). The parent holds the human-readable overview and the model invariants; this child holds the normative scenarios for its slice.

## What

What **freezing** actually commits. The five artifacts **co-deliver** — never sequential gated phases (no plan gate). Approval co-freezes the whole chain at **descending strength**: `spec.md`/`.feature` firmest → `plan.md` firm → `tasks.md` live → implementation softest. Freeze is a *strength*, not an absolute lock: a deal-breaker can revert even an Approved spec to Draft. The chain co-evolves — a plan change re-expresses the `.feature` while its behavioral **essence** stays intact. `tasks.md` is a dependency DAG, regenerated as the plan changes. The `.feature` **pivots**: the object judged at the spec gate becomes the bar at the impl gate.

## Use Cases

Every scenario in this child traces to its behavior, step-down ordered in the `.feature`:

| Scenario | Covered in |
|---|---|
| A spec can be Approved with no implementation | sdd-operator-freeze.feature |
| Approval co-freezes the whole chain at descending strength | sdd-operator-freeze.feature |
| Freeze is reversible when a deal-breaker emerges | sdd-operator-freeze.feature |
| A plan change ripples to the .feature expression but not its essence | sdd-operator-freeze.feature |
| tasks.md is a dependency DAG, not a flat todo | sdd-operator-freeze.feature |
| The .feature is the object at the spec gate and the bar at the impl gate | sdd-operator-freeze.feature |

## References

`sdd:lifecycle-governance` (the freeze state-transition, co-delivery); `sdd:gate-validation-governance` (the two gates set the two ends).

## Artifacts

| Label | Path |
|---|---|
| Spec | `artifacts/specs/sdd-operator-freeze/spec.md` |
| Scenarios | `artifacts/specs/sdd-operator-freeze/sdd-operator-freeze.feature` |
