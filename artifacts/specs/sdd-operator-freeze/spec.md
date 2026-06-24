---
status: approved
type: feature
blocked-by:
  - sdd-operator
  - sdd-operator-dispatch
aligned: true
approval:
  spec:
    verdict: approve
    by: unional
---

# SDD Operator — Freeze: a Strength Gradient

> **Feature child of [`sdd-operator`](../sdd-operator/spec.md).** This spec owns one behavior of the Operator (the SDD lead delegate, `sdd-orchestrator`). The parent holds the human-readable overview and the model invariants; this child holds the normative scenarios for its slice.

## What

What **freezing** actually commits. The five artifacts **co-deliver** — never sequential gated phases (no plan gate). Approval co-freezes the whole chain at **descending strength**: `spec.md`/`.feature` firmest → `plan.md` firm → `tasks.md` live → implementation softest. Freeze is a *strength*, not an absolute lock: a deal-breaker can revert even an Approved spec to Draft. The chain co-evolves — a plan change re-expresses the `.feature` while its behavioral **essence** stays intact. `tasks.md` is a dependency DAG, regenerated as the plan changes. The `.feature` **pivots**: the object judged at the spec gate becomes the bar at the impl gate.

## Use Cases

Each entry point names what sets freeze off, what it receives, and what it produces. Every use case is verified one-to-many by the scenarios in `sdd-operator-freeze.feature`.

| # | Trigger | Inputs | Outcome | Verified by |
|---|---|---|---|---|
| UC1 | The spec gate passes and the spec is set Approved | The co-delivered chain (`spec.md`, `.feature`, `plan.md`, `tasks.md`) | The chain co-freezes at descending strength — `spec.md`/`.feature` firmest, `plan.md` firm, `tasks.md` live — with no separate plan gate, and no implementation required to reach Approved | A spec can be Approved with no implementation; Approval co-freezes the whole chain at descending strength |
| UC2 | A deal-breaker surfaces during implementation of an Approved spec | The Approved spec with its frozen `.feature` and the fatal scenario | The spec reverts to Draft — the freeze proves a strength, not an absolute lock | Freeze is reversible when a deal-breaker emerges |
| UC3 | The chosen solution in `plan.md` changes | The frozen `.feature` and the new `plan.md` solution | The `.feature` scenarios are re-expressed to test the new solution while their behavioral essence holds, and `tasks.md` is regenerated as the dependency DAG | A plan change ripples to the .feature expression but not its essence; tasks.md is a dependency DAG, not a flat todo |
| UC4 | The impl gate runs against an Approved spec | The frozen `.feature` and the implementation under judgment | The `.feature` pivots — the object judged at the spec gate becomes the bar the implementation is judged against | The .feature is the object at the spec gate and the bar at the impl gate |

## References

`sdd:lifecycle-governance` (the freeze state-transition, co-delivery); `sdd:gate-validation-governance` (the two gates set the two ends).

## Artifacts

| Label | Path |
|---|---|
| Spec | `artifacts/specs/sdd-operator-freeze/spec.md` |
| Scenarios | `artifacts/specs/sdd-operator-freeze/sdd-operator-freeze.feature` |
