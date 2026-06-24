---
status: draft
type: feature
blocked-by:
  - sdd-operator
  - sdd-operator-dispatch
  - sdd-operator-freeze
aligned: false
---

# SDD Operator — Deliver Phase

> **Feature child of [`sdd-operator`](../sdd-operator/spec.md).** This spec owns one behavior of the Operator (the SDD lead delegate, `sdd-orchestrator`). The parent holds the human-readable overview and the model invariants; this child holds the normative scenarios for its slice.

## What

The **Deliver phase**: build **and** judge against the *frozen* contract — symmetric to Explore. In `deliver` mode the plan-producer and impl-producer build against the frozen `.feature`; the impl-producer co-authors one verification per frozen scenario; the impl-judge **runs** that verification (never authors it) and adds an orthogonal structural/scope reading. The rubric is a validation detail kept out of the `.feature`; a graded subject still collapses to a boolean per scenario. The phase ends at the **impl gate** (Approved → Implemented), where **impl-layer `aligned`** means the implementation conforms to the frozen contract — true only when every impl-judge passes.

## Use Cases

Every scenario in this child traces to its behavior, step-down ordered in the `.feature`:

| Scenario | Covered in |
|---|---|
| The implementation loop plans, builds, and judges against the frozen contract | sdd-operator-deliver.feature |
| The impl-judge runs the test result the producer authored | sdd-operator-deliver.feature |
| The .feature carries no rubric | sdd-operator-deliver.feature |
| A graded subject still yields a boolean per scenario | sdd-operator-deliver.feature |
| aligned at the impl gate checks the impl layer | sdd-operator-deliver.feature |
| aligned is true only when every impl-judge passes | sdd-operator-deliver.feature |
| aligned stays false when any impl-judge fails | sdd-operator-deliver.feature |

## References

`sdd:gate-validation-governance` (impl-layer `aligned`, impl gate); `sdd:builder-governance` (the verification bar); `sdd:lifecycle-governance` (Approved → Implemented).

## Artifacts

| Label | Path |
|---|---|
| Spec | `artifacts/specs/sdd-operator-deliver/spec.md` |
| Scenarios | `artifacts/specs/sdd-operator-deliver/sdd-operator-deliver.feature` |
