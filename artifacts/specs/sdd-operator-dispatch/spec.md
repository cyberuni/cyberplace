---
status: draft
type: feature
blocked-by:
  - sdd-operator
  - sdd-operator-resolution
aligned: false
---

# SDD Operator — Production-Chain Dispatch

> **Feature child of [`sdd-operator`](../sdd-operator/spec.md).** This spec owns one behavior of the Operator (the SDD lead delegate, `sdd-orchestrator`). The parent holds the human-readable overview and the model invariants; this child holds the normative scenarios for its slice.

## What

Once roles are resolved, **who does what**. The Operator dispatches each production-chain role through one uniform I/O surface: the spec-producer writes the `spec.md` body + the `.feature`; the plan-producer writes `plan.md` + `tasks.md`; the impl-producer co-produces the implementation **and** its verification; the spec-judge and impl-judge run the bars (`producer ≠ judge`). Forward producers load the actor governances they embody. The write-boundary travels with the roles: impl-side roles never touch `spec.md` or the `.feature`. Governances load as harness skills — no `governance show` CLI call.

## Use Cases

Every scenario in this child traces to its behavior, step-down ordered in the `.feature`:

| Scenario | Covered in |
|---|---|
| Spec-producers load the SDD governance skill for format rules | sdd-operator-dispatch.feature |
| The loop runs without a governance-show call | sdd-operator-dispatch.feature |
| Orchestrator dispatches to the plugin that covers the domain | sdd-operator-dispatch.feature |
| Orchestrator falls back to the default spec-producer when no plugin covers the domain | sdd-operator-dispatch.feature |
| A participating plugin always provides its own spec-producer | sdd-operator-dispatch.feature |
| The spec-producer writes the spec.md body and the impl side cannot | sdd-operator-dispatch.feature |
| Forward producers load the actor governances they embody | sdd-operator-dispatch.feature |
| The impl-producer co-produces the verification with the implementation | sdd-operator-dispatch.feature |
| The impl-judge runs the producer's verification rather than authoring it | sdd-operator-dispatch.feature |
| Orchestrator dispatches to the plugin impl-judge that covers the domain | sdd-operator-dispatch.feature |
| Orchestrator falls back to the default impl-judge when no plugin covers the domain | sdd-operator-dispatch.feature |
| Product and test separation stays inside the impl-producer | sdd-operator-dispatch.feature |
| The orchestrator resolves every production-chain role | sdd-operator-dispatch.feature |
| ACES evals are authored by the impl-producer and run by the impl-judge | sdd-operator-dispatch.feature |
| Degenerate roles fall back without a plugin agent | sdd-operator-dispatch.feature |
| A plugin author reads the interface from the orchestrator and default delegates | sdd-operator-dispatch.feature |

## References

`sdd:plugin-contract-governance` (the five roles, governances each loads); `sdd:ownership-governance` (write boundary); `sdd:builder-governance` / `sdd:architect-governance` / `sdd:director-governance` (the actor bars).

## Artifacts

| Label | Path |
|---|---|
| Spec | `artifacts/specs/sdd-operator-dispatch/spec.md` |
| Scenarios | `artifacts/specs/sdd-operator-dispatch/sdd-operator-dispatch.feature` |
