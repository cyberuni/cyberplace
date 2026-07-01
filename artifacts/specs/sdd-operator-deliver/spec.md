---
status: implemented
type: feature
domain-type: subagent
blocked-by:
  - sdd-operator
  - sdd-operator-dispatch
  - sdd-operator-freeze
aligned: true
produced-by:
  spec-producer: sdd:sdd-operator
  spec-judge: sdd:sdd-spec-judge
  impl-producer: sdd:sdd-operator
  impl-judge: sdd:sdd-implementer
approval:
  spec:
    verdict: approve
    by: unional
  impl:
    verdict: approve
    by: unional
---

# SDD Operator — Deliver Phase

> **Feature child of [`sdd-operator`](../sdd-operator/spec.md).** This spec owns one behavior of the Operator (the SDD lead delegate, `sdd-operator`). The parent holds the human-readable overview and the model invariants; this child holds the normative scenarios for its slice.

## What

The **Deliver phase**: build **and** judge against the *frozen* contract — symmetric to Explore, and following the same warm-producer / cold-judge dispatch as the sibling `sdd-operator-dispatch`. In `deliver` mode the Operator **runs** the forward roles against the frozen `.feature`:

- **plan-producer / impl-producer, unnamed** (no plugin agent, no model-tuned producer named for the slot) → the Operator **loads the SDD-default producer governance and builds the artifact inline in its own warm context**, recorded `produced-by.<role>: sdd:sdd-operator`. The impl-producer co-authors the implementation **and** one verification per frozen scenario inline. There is no spawned default producer agent and no "generic Builder".
- **plan-producer / impl-producer, named** (a plugin delegate covers the domain, **or** the slot names a model-tuned producer agent — the model-tuning escape valve) → the Operator **spawns that named agent** at its own model and effort.
- **impl-judge, always cold** → the Operator **spawns a cold agent in a fresh context** (the SDD default `sdd:sdd-implementer`, or the covering plugin's impl-judge). The impl-judge **runs** the impl-producer's verification (never authors it) and adds an orthogonal structural/scope reading. A judge is never run inline, because the grader must not share the author's context (`producer ≠ judge`). Tagline: **"conductor writes, cold judges grade."**

The rubric is a validation detail kept out of the `.feature`; a graded subject still collapses to a boolean per scenario. The phase ends at the **impl gate** (Approved → Implemented), where **impl-layer `aligned`** means the implementation conforms to the frozen contract — true only when every impl-judge passes.

## Use Cases

The Deliver phase has two entry-points: the Operator enters `deliver` mode to build *and* judge against the frozen contract, and the impl gate evaluates impl-layer alignment to advance status. Each is verified by one or more `.feature` scenarios (one-to-many).

| Use case | Trigger | Inputs | Outcome |
|---|---|---|---|
| **Run the deliver loop against the frozen contract** | The Operator enters `deliver` mode for a domain whose `.feature` is frozen (Approved) | The frozen `.feature`; resolved plan-producer, impl-producer, and impl-judge delegates | When the producer slots are **unnamed**, the Operator loads the producer governance and builds inline (warm, recorded `sdd:sdd-operator`) — `plan.md` / `tasks.md` plus the implementation **and** one verification per frozen scenario; when a slot **names** an agent (plugin or model-tuned), the Operator spawns it at its own model. The impl-judge is **always spawned cold**; it *runs* the impl-producer's verification (never authors it) and adds an orthogonal structural/scope read, collapsing any graded subject to a boolean per scenario. The rubric stays out of the `.feature`. |
| **Evaluate impl-layer alignment at the impl gate** | An Approved domain reaches the impl gate after the deliver loop runs | Every declared impl-judge's `IMPLEMENTATION_PASS` result for the domain and its sub-domains | The Operator sets impl-layer `aligned` true in `spec.md` frontmatter only when **every** impl-judge passes (Approved → Implemented); if any returns false, `aligned` stays false and the Operator surfaces the `BLOCKER`. A frozen scenario with no verification is reported failing by the cold impl-judge and blocks `aligned`. |

**Scenario trace** — each scenario in `sdd-operator-deliver.feature` verifies one use case:

| Scenario | Use case |
|---|---|
| An unnamed impl-producer is built inline against the frozen contract | Run the deliver loop against the frozen contract |
| A named impl-producer agent is spawned at its own model | Run the deliver loop against the frozen contract |
| The deliver loop blocks when the impl-producer returns no artifacts | Run the deliver loop against the frozen contract |
| The impl-judge is spawned cold and runs the producer's verification | Run the deliver loop against the frozen contract |
| The .feature carries no rubric | Run the deliver loop against the frozen contract |
| A graded subject at or above threshold yields a passing scenario | Run the deliver loop against the frozen contract |
| A graded subject below threshold yields a failing scenario | Run the deliver loop against the frozen contract |
| A frozen scenario with no verification is reported failing | Evaluate impl-layer alignment at the impl gate |
| aligned at the impl gate checks the impl layer | Evaluate impl-layer alignment at the impl gate |
| aligned is true only when every impl-judge passes | Evaluate impl-layer alignment at the impl gate |
| aligned stays false when any impl-judge fails | Evaluate impl-layer alignment at the impl gate |

## References

`sdd:gate-validation-governance` (impl-layer `aligned`, impl gate); `sdd:builder-governance` (the verification bar); `sdd:lifecycle-governance` (Approved → Implemented). The sibling `sdd-operator-dispatch` owns the warm-producer / cold-judge dispatch mechanism this phase follows; the parent `sdd-operator` holds the model invariants.

## Artifacts

| Label | Path |
|---|---|
| Spec | `artifacts/specs/sdd-operator-deliver/spec.md` |
| Scenarios | `artifacts/specs/sdd-operator-deliver/sdd-operator-deliver.feature` |
| Implementation | `plugins/sdd/agents/sdd-operator.md` |
| Verification | `plugins/sdd/agents/sdd-operator.test.mts` |
