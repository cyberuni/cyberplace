---
status: approved
type: feature
blocked-by:
  - sdd-operator
  - sdd-operator-dispatch
  - sdd-operator-freeze
aligned: true
approval:
  spec:
    verdict: approve
    by: unional
---

# SDD Operator — Deliver Phase

> **Feature child of [`sdd-operator`](../sdd-operator/spec.md).** This spec owns one behavior of the Operator (the SDD lead delegate, `sdd-orchestrator`). The parent holds the human-readable overview and the model invariants; this child holds the normative scenarios for its slice.

## What

The **Deliver phase**: build **and** judge against the *frozen* contract — symmetric to Explore. In `deliver` mode the plan-producer and impl-producer build against the frozen `.feature`; the impl-producer co-authors one verification per frozen scenario; the impl-judge **runs** that verification (never authors it) and adds an orthogonal structural/scope reading. The rubric is a validation detail kept out of the `.feature`; a graded subject still collapses to a boolean per scenario. The phase ends at the **impl gate** (Approved → Implemented), where **impl-layer `aligned`** means the implementation conforms to the frozen contract — true only when every impl-judge passes.

## Use Cases

The Deliver phase has two entry-points: the Operator enters `deliver` mode to build *and* judge against the frozen contract, and the impl gate evaluates impl-layer alignment to advance status. Each is verified by one or more `.feature` scenarios (one-to-many).

| Use case | Trigger | Inputs | Outcome |
|---|---|---|---|
| **Run the deliver loop against the frozen contract** | The Operator enters `deliver` mode for a domain whose `.feature` is frozen (Approved) | The frozen `.feature`; resolved plan-producer, impl-producer, and impl-judge delegates | The plan-producer writes `plan.md` / `tasks.md` in deliver mode; the impl-producer builds the artifact **and** co-authors one verification per frozen scenario; the impl-judge *runs* that verification (never authors it) and adds an orthogonal structural/scope read, collapsing any graded subject to a boolean per scenario. The rubric stays out of the `.feature`. |
| **Evaluate impl-layer alignment at the impl gate** | An Approved domain reaches the impl gate after the deliver loop runs | Every declared impl-judge's `IMPLEMENTATION_PASS` result for the domain and its sub-domains | The Operator sets impl-layer `aligned` true in `spec.md` frontmatter only when **every** impl-judge passes (Approved → Implemented); if any returns false, `aligned` stays false and the Operator surfaces the `BLOCKER` to the user. |

**Scenario trace** — each scenario in `sdd-operator-deliver.feature` verifies one use case:

| Scenario | Use case |
|---|---|
| The implementation loop plans, builds, and judges against the frozen contract | Run the deliver loop against the frozen contract |
| The impl-judge runs the test result the producer authored | Run the deliver loop against the frozen contract |
| The .feature carries no rubric | Run the deliver loop against the frozen contract |
| A graded subject still yields a boolean per scenario | Run the deliver loop against the frozen contract |
| aligned at the impl gate checks the impl layer | Evaluate impl-layer alignment at the impl gate |
| aligned is true only when every impl-judge passes | Evaluate impl-layer alignment at the impl gate |
| aligned stays false when any impl-judge fails | Evaluate impl-layer alignment at the impl gate |

## References

`sdd:gate-validation-governance` (impl-layer `aligned`, impl gate); `sdd:builder-governance` (the verification bar); `sdd:lifecycle-governance` (Approved → Implemented).

## Artifacts

| Label | Path |
|---|---|
| Spec | `artifacts/specs/sdd-operator-deliver/spec.md` |
| Scenarios | `artifacts/specs/sdd-operator-deliver/sdd-operator-deliver.feature` |
