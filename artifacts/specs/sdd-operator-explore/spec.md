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
log:
  - seq: 1
    kind: correction
    correction-kind: council-kickback
    cause: design-overreach
    detail: "Council freeze-break — project sdd:sdd-spec-judge as the default spec-judge delegate instead of injecting validate-spec static criteria inline; re-opened implemented→draft to rewrite the 'static-bar domain needs no spec-gate judge agent' scenario"
  - seq: 2
    kind: report
    role: spec-judge
    agent: sdd:sdd-spec-judge
    outcome: pass
    summary: "re-judged the rewritten .feature at the spec gate after the spec.md sync fix — valid boolean Gherkin, ordering intact, spec.md ↔ .feature in sync, no markers"
  - seq: 3
    kind: report
    role: spec-producer
    agent: sdd:sdd-operator
    outcome: pass
    summary: "re-open revision — rewrote the retired 'spawn/dispatch the spec-producer' and 'generic Builder / sdd:builder / null-degeneracy' framing to the approved parent model (spec-producer unnamed → Operator loads the spec-producer governance and authors spec.md + .feature inline warm, record sdd:sdd-operator; spec-producer named plugin/model-tuned → spawn at own model; spec-judge → always spawn cold sdd:sdd-spec-judge); split the spec-gate-judge scenarios into named-plugin-spawn + unnamed-default-cold; dropped the retired domain-plugin control-field reference; migrated produced-by.impl-producer→sdd:sdd-operator, added produced-by.spec-producer→sdd:sdd-operator; folded the stray combat-log.jsonl into frontmatter log to match the siblings"
  - seq: 4
    kind: report
    role: spec-judge
    agent: sdd:sdd-spec-judge
    outcome: fail
    summary: "cold judge confirmed the warm/cold model rewrite clean and no residual retired framing, but caught five format-bar defects carried by pre-existing scenarios — a compound when-conditional in the MODE And step, a temporal 'until ... freezes' Then in the exploratory-loop scenario, a 'may carry forward' probability step in the explore-spike scenario, a 'validated transitively by' internal-mechanism step in the planner scenario, and a missing error-case scenario for the spec-gate operation"
  - seq: 5
    kind: correction
    correction-kind: judge-iteration
    cause: coverage-gap
    detail: "split the MODE scenario into draft→explore and frozen→deliver (removing the compound when-conditional and giving deliver mode its own positive scenario); rewrote the exploratory-loop Then to observable per-iteration updates plus a gate-on-pass assertion; replaced 'may carry forward' with the observable 'operator does not discard the impl-producer output when the contract later freezes'; replaced 'validated transitively by the implementation test result' with the observable 'no plan-gate verdict is required before the domain advances past the spec gate'; added the spec-gate error case (cold spec-judge fails → aligned stays false, spec stays Draft, failing scenarios returned as a blocker)"
  - seq: 6
    kind: report
    role: spec-judge
    agent: sdd:sdd-spec-judge
    outcome: fail
    summary: "fresh cold judge confirmed all five prior defects resolved, ordering/mapping/consistency intact and no residual retired framing, but on a stricter observable-form pass caught three Then-class defects — an internal-mechanism step ('loads the spec-producer governance and authors ... inline'), and two compound when-conditionals embedded in Then/And steps ('even when no full domain plugin covers the domain', 'regardless of which delegate wrote it')"
  - seq: 7
    kind: correction
    correction-kind: judge-iteration
    cause: coverage-gap
    detail: "rewrote the unnamed-inline Then to the observable output 'the operator writes the spec.md body and the .feature' (mechanism evidence carried by the following And steps); moved the named-spawn keying condition into a Given ('no full domain plugin covers the domain') and reduced the Then to the observable 'spawns aces-scenario-writer' / 'does not write the spec.md body'; moved the plugin-delegate qualifier into the Given and reduced the validate-spec Then to 'the .feature is checked for valid boolean Gherkin'"
  - seq: 8
    kind: report
    role: spec-judge
    agent: sdd:sdd-spec-judge
    outcome: fail
    summary: "fresh cold judge confirmed all prior fixes hold, ordering/coverage/mapping/consistency intact and no residual retired framing, but on a stricter pass caught three remaining inline-conditional/modal Then steps — a 'when the cold spec-judge passes' conditional in the exploratory-loop And, a 'when the contract later freezes' temporal clause in the explore-spike And, and a 'may write only' modal in the frontmatter-rejection And"
  - seq: 9
    kind: correction
    correction-kind: judge-iteration
    cause: coverage-gap
    detail: "split the exploratory-loop scenario — kept the per-iteration-update Then, and extracted the gate-on-clean-pass into its own scenario with the pass/no-marker conditions as Givens (removing the inline when-conditional); replaced 'does not discard ... when the contract later freezes' with the clean observable 'carries the impl-producer output forward into the delivery phase'; rewrote 'may write only' to the boolean 'writes only the spec.md body and the .feature'"
  - seq: 10
    kind: report
    role: spec-judge
    agent: sdd:sdd-spec-judge
    outcome: pass
    summary: "clean spec-gate pass with a fresh cold judge — all 20 scenarios observable boolean Gherkin, step-down ordering across three sections, a happy-path and error-case per operation, 1:1 use-case-to-scenario union with no orphans, no residual retired framing, producer unnamed-inline / named-spawn and always-cold-judge model correct, fully consistent with the approved parent model and the two judge-clean siblings"
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
