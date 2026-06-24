---
status: draft
type: feature
blocked-by:
  - sdd-operator
  - sdd-operator-dispatch
aligned: false
---

# SDD Operator — Explore Phase

> **Feature child of [`sdd-operator`](../sdd-operator/spec.md).** This spec owns one behavior of the Operator (the SDD lead delegate, `sdd-orchestrator`). The parent holds the human-readable overview and the model invariants; this child holds the normative scenarios for its slice.

## What

The **Explore phase**: produce **and** judge the contract. The Operator shapes the `.feature` (spec-producer ⇄ spec-judge) and probes it by running forward producers in `explore` mode against the *draft*; discoveries route back as content-gaps and re-invoke the spec-producer. The contract bar — boolean Gherkin, step-down ordering, `spec.md` enrichment, domain criteria — is enforced by the spec-judge / `validate-spec`. The phase ends at the **spec gate** (Draft → Approved), where **spec-layer `aligned`** means `spec.md` ↔ `.feature` are in sync.

**Explore output is not throwaway.** The distinction between Explore and Deliver is *contract-not-yet-frozen vs building-against-the-frozen-contract* — not discarded-vs-kept. Building done to settle the contract can carry forward (co-delivery).

## Use Cases

Every scenario in this child traces to its behavior, step-down ordered in the `.feature`:

| Scenario | Covered in |
|---|---|
| MODE is derived from whether the .feature is frozen | sdd-operator-explore.feature |
| The exploratory loop shapes the spec and probes it by building | sdd-operator-explore.feature |
| An explore-mode producer builds against the draft, not a frozen contract | sdd-operator-explore.feature |
| An explore discovery is judged before it reshapes the contract | sdd-operator-explore.feature |
| Explore-mode discoveries feed back as markers | sdd-operator-explore.feature |
| The planner runs in explore alongside the spec, not after a gate | sdd-operator-explore.feature |
| Scenarios are ordered to trace the workflow | sdd-operator-explore.feature |
| The spec-producer enriches spec.md for human consumption | sdd-operator-explore.feature |
| A plugin-written .feature must pass validate-spec | sdd-operator-explore.feature |
| validate-spec runs without NodeJS when npx is unavailable | sdd-operator-explore.feature |
| validate-spec enforces domain criteria against a plugin-written .feature | sdd-operator-explore.feature |
| A spec-producer that writes frontmatter control fields is rejected | sdd-operator-explore.feature |
| The spec-gate judge is a domain delegate, not SDD | sdd-operator-explore.feature |
| A static-bar domain needs no spec-gate judge agent | sdd-operator-explore.feature |
| aligned at the spec gate checks only the contract layer | sdd-operator-explore.feature |

## References

`sdd:spec-governance` (format bar, ordering, enrichment, granularity); `sdd:gate-validation-governance` (spec-layer `aligned`, spec gate); `sdd:lifecycle-governance` (Draft → Approved).

## Artifacts

| Label | Path |
|---|---|
| Spec | `artifacts/specs/sdd-operator-explore/spec.md` |
| Scenarios | `artifacts/specs/sdd-operator-explore/sdd-operator-explore.feature` |
