---
status: draft
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
approval: {}
log:
  - seq: 1
    kind: correction
    correction-kind: council-kickback
    cause: design-overreach
    detail: "Council freeze-break — re-opened draft to retire the 'plan-producer and impl-producer build / spawn the impl-producer / generic Builder / sdd:builder null-degeneracy' framing in the Deliver phase and align it to the ratified parent model (producer unnamed → Operator loads the impl-producer governance and builds the implementation + verification inline warm, recorded sdd:sdd-operator; producer named plugin/model-tuned → spawn at its own model; impl-judge always spawned cold)"
  - seq: 2
    kind: report
    role: spec-producer
    agent: sdd:sdd-operator
    outcome: pass
    summary: "re-open revision — rewrote the Deliver phase to the approved warm/cold model: ## What now splits plan/impl-producer into unnamed→load-governance-build-inline (recorded sdd:sdd-operator) vs named→spawn-at-own-model, impl-judge always cold ('conductor writes, cold judges grade'); split the old 'plan-producer, impl-producer, and impl-judge run' scenario into unnamed-inline + named-spawn; reframed the judge scenario as spawned-cold; migrated produced-by.impl-producer sdd:builder→sdd:sdd-operator and added spec-producer/spec-judge entries; no stray combat-log.jsonl existed (ledger authored directly in frontmatter log)"
  - seq: 3
    kind: report
    role: spec-judge
    agent: sdd:sdd-spec-judge
    outcome: fail
    summary: "cold judge confirmed the warm/cold + escape-valve model clean, 1:1 trace, and full consistency with the dispatch sibling, but caught a non-boolean Then ('aligned requires the impl layer to conform' — rule statement not assertion), an internal-mechanism Given naming aces-implementer in the graded-subject scenario, and a missing error case for the deliver-loop operation (UC1)"
  - seq: 4
    kind: correction
    correction-kind: judge-iteration
    cause: coverage-gap
    detail: "rewrote the impl-gate Then to the observable 'sdd-operator sets aligned true only when the impl layer conforms ... and does not consider the spec/contract layer'; rewrote the graded-subject Given to the observable 'a graded subject is evaluated for a frozen scenario over N runs' (dropped the aces-implementer internal name); added a deliver-loop error case ('The deliver loop blocks when the impl-producer returns no artifacts' → no impl-judge run, aligned false, BLOCKER surfaced), updating the trace table to 10 scenarios"
  - seq: 5
    kind: report
    role: spec-judge
    agent: sdd:sdd-spec-judge
    outcome: fail
    summary: "fresh cold judge confirmed prior three fixes held, 10 scenarios trace 1:1, no residual retired framing, full consistency with the dispatch sibling — but caught two non-observable Then steps: the impl-judge 'runs ... rather than authoring it' mechanism step, and the impl-gate 'does not consider the spec or contract layer' internal-scope qualifier"
  - seq: 6
    kind: correction
    correction-kind: judge-iteration
    cause: coverage-gap
    detail: "aligned the impl-judge cold scenario to the dispatch sibling's observable form ('the cold impl-judge runs the producer's verification and reports pass or fail per scenario / does not author the functional tests or evals / adds its own orthogonal structural and scope reading'); dropped the non-observable 'does not consider the spec or contract layer at the impl gate' qualifier, leaving the sufficient observable 'sets aligned true only when the impl layer conforms to the frozen .feature'"
  - seq: 7
    kind: report
    role: spec-judge
    agent: sdd:sdd-spec-judge
    outcome: fail
    summary: "fresh cold judge confirmed all prior fixes held, 10 scenarios, full dispatch-sibling consistency, no residual retired framing — caught one residual defect: an inline conditional embedded in the graded-subject scenario's And step ('reports failing when the aggregate score is below the threshold' bundles two outcome branches into one Then)"
  - seq: 8
    kind: correction
    correction-kind: judge-iteration
    cause: coverage-gap
    detail: "split the graded-subject scenario into two clean boolean scenarios — 'A graded subject at or above threshold yields a passing scenario' and 'A graded subject below threshold yields a failing scenario' — each with its own Given/When/Then and no embedded conditional; trace table updated to 11 scenarios"
  - seq: 9
    kind: report
    role: spec-judge
    agent: sdd:sdd-spec-judge
    outcome: pass
    summary: "fresh cold judge confirmed all prior fixes held, 11 scenarios trace 1:1, full dispatch-sibling consistency, no residual retired framing — caught one residual embedded conditional: the impl-gate layer-scoping scenario's 'sets aligned true only when the impl layer conforms' Then bundled both branches into one assertion"
  - seq: 10
    kind: correction
    correction-kind: judge-iteration
    cause: coverage-gap
    detail: "committed the impl-gate layer-scoping scenario's Given to one branch ('the impl layer conforms to the frozen .feature while the spec layer has unrelated drift') so the Then is a single observable boolean ('sets aligned true'); this preserves the scenario's distinct layer-scoping value (impl-layer pass despite spec-layer drift, which S10/S11 do not cover) without the 'only when' policy conditional"
  - seq: 11
    kind: report
    role: spec-judge
    agent: sdd:sdd-spec-judge
    outcome: pass
    summary: "clean spec-gate pass with a fresh cold judge — 11 observable boolean Gherkin scenarios, every Then a single branch-committed assertion, 1:1 use-case-to-scenario union with an error case per operation, scenario ordering correct, no residual retired framing, full consistency with the approved parent model and the judge-clean dispatch sibling"
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
