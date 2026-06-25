---
status: implemented
type: feature
domain-type: subagent
blocked-by:
  - sdd-operator
  - sdd-operator-dispatch
aligned: true
approval:
  spec:
    verdict: approve
    by: unional
  impl:
    verdict: approve
    by: unional
produced-by:
  spec-producer: sdd:sdd-operator
  spec-judge: sdd:sdd-spec-judge
  impl-producer: sdd:sdd-operator
  impl-judge: sdd:sdd-implementer
---

# SDD Operator — Explore Phase

> **Feature child of [`sdd-operator`](../sdd-operator/spec.md).** This spec owns one behavior of the Operator (the SDD lead delegate, `sdd-operator`). The parent holds the human-readable overview and the model invariants; this child holds the normative scenarios for its slice.

## What

The **Explore phase**: produce **and** judge the contract. The Operator shapes the `.feature` (spec-producer ⇄ spec-judge) and probes it by running forward producers in `explore` mode against the *draft*; discoveries route back as content-gaps and re-run the spec-producer. The contract bar — boolean Gherkin, step-down ordering, `spec.md` enrichment, domain criteria — is enforced by the spec-judge / `validate-spec`. The phase ends at the **spec gate** (Draft → Approved), where **spec-layer `aligned`** means `spec.md` ↔ `.feature` are in sync.

**Where each role runs** follows the approved parent model — *"conductor writes, cold judges grade."*

- **spec-producer, unnamed** (no plugin agent and no model-tuned producer named for the slot) → the Operator **loads the spec-producer governance and authors the `spec.md` body + the `.feature` inline** in its own warm context, recorded `produced-by.spec-producer: sdd:sdd-operator`. There is no spawned default producer agent and no "generic Builder".
- **spec-producer, named** (a plugin delegate covers the domain, **or** the slot names a model-tuned producer — the model-tuning escape valve) → the Operator **spawns that named agent** so it runs at its own model and effort.
- **spec-judge, always** → the Operator **spawns a cold agent** in a fresh context — the covering plugin's judge, else the `sdd:sdd-spec-judge` default — never run inline, regardless of naming, because the grader must not share the author's context.

**Explore output is not throwaway.** The distinction between Explore and Deliver is *contract-not-yet-frozen vs building-against-the-frozen-contract* — not discarded-vs-kept. Building done to settle the contract can carry forward (co-delivery).

## Use Cases

Entry points into the Explore phase, at the altitude of *how the Operator is set in motion* — coarse-grained, one per distinct way the behavior is invoked. Each is verified by one or more scenarios in the `.feature` (one-to-many).

| Trigger | Inputs | Outcome |
|---|---|---|
| **The Operator is about to dispatch a forward producer** and must choose its mode | the `.feature`'s frozen-state | `explore` mode while the `.feature` is still a draft; `deliver` mode once it is frozen |
| **The Operator enters the exploratory loop** for a domain whose `.feature` is still a draft | the domain, the draft spec.md and `.feature` | the spec-producer (authored inline when unnamed, else a spawned named agent) ⇄ the cold spec-judge iterate while forward producers run in `explore` mode, shaping the `.feature` until the spec gate freezes it |
| **An explore-mode producer probes the draft** by building against it (impl-producer or plan-producer run in `explore`) | the draft `.feature`, the producer role | scaffolding that may carry forward or be reshaped at the freeze; the ship-quality impl-judge does not run, and the planner co-delivers plan.md / tasks.md with no plan gate |
| **A discovery routes back** when an explore-mode producer finds the `.feature` omits a behavior | the discovery (a content-gap + OBSERVATIONS entry) | the Operator writes an open marker in spec.md, re-runs the spec-producer, and the proposed change is judged by the cold spec-judge — never absorbed into the contract unjudged; the human at the gate decides whether the behavior is wanted |
| **The contract bar enforces format** when a `.feature` is written or validated, regardless of which delegate wrote it | the spec.md and `.feature`, the domain criteria | validate-spec checks valid boolean Gherkin, step-down ordering, enrichment, and domain criteria; producers writing control frontmatter (`status` / `aligned` / `produced-by`) are rejected; it falls back to an agent-level check when npx is unavailable |
| **The spec gate judges the contract** to advance Draft → Approved | the frozen-candidate `.feature`, the resolved spec-judge | the spec-judge is always **spawned cold** — the plugin's own judge when the domain declares one, else the `sdd:sdd-spec-judge` default spawned with clean context, applying the `validate-spec` static criteria as its bar — never run inline; `aligned` at this gate considers only spec.md ↔ `.feature`, so spike code does not block Approved |

## References

`sdd:spec-governance` (format bar, ordering, enrichment, granularity); `sdd:gate-validation-governance` (spec-layer `aligned`, spec gate); `sdd:lifecycle-governance` (Draft → Approved).

## Artifacts

| Label | Path |
|---|---|
| Spec | `artifacts/specs/sdd-operator-explore/spec.md` |
| Scenarios | `artifacts/specs/sdd-operator-explore/sdd-operator-explore.feature` |
| Implementation | `plugins/sdd/agents/sdd-operator.md` |
| Verification | `plugins/sdd/agents/sdd-operator.test.mts` |
