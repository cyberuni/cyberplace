---
status: implemented
type: feature
blocked-by:
  - sdd-operator
  - sdd-operator-resolution
aligned: true
approval:
  spec:
    verdict: approve
    by: unional
  impl:
    verdict: approve
    by: unional
produced-by:
  spec-producer: sdd:sdd-scenario-writer
  spec-judge: sdd:sdd-spec-judge
  impl-producer: sdd:builder
  impl-judge: sdd:sdd-implementer
---

# SDD Operator — Production-Chain Dispatch

> **Feature child of [`sdd-operator`](../sdd-operator/spec.md).** This spec owns one behavior of the Operator (the SDD lead delegate, `sdd-operator`). The parent holds the human-readable overview and the model invariants; this child holds the normative scenarios for its slice.

## What

Once roles are resolved, **who does what**. The Operator dispatches each production-chain role through one uniform I/O surface: the spec-producer writes the `spec.md` body + the `.feature`; the plan-producer writes `plan.md` + `tasks.md`; the impl-producer co-produces the implementation **and** its verification; the spec-judge and impl-judge run the bars (`producer ≠ judge`). Forward producers load the actor governances they embody. The write-boundary travels with the roles: impl-side roles never touch `spec.md` or the `.feature`. Governances load as harness skills — no `governance show` CLI call.

## Use Cases

Three entry-points invoke this dispatch behavior. Each is verified by one-or-more boolean scenarios in `sdd-operator-dispatch.feature` (one-to-many) — the **Scenarios** column lists every scenario that traces to that use case, and the union covers all 16.

| Trigger | Inputs | Outcome | Scenarios |
|---|---|---|---|
| `sdd-operator` runs the **design phase** for a domain | the domain name, the plugin registry, the resolved spec-producer role | the covering plugin's spec-producer (else the `sdd-scenario-writer` default) is dispatched; it loads `sdd:spec-governance` as a harness skill with no `governance show` call, writes only the `spec.md` body + `.feature`, and the impl side is barred from those artifacts | Spec-producers load the SDD governance skill for format rules; The loop runs without a governance-show call; Operator dispatches to the plugin that covers the domain; Operator falls back to the default spec-producer when no plugin covers the domain; A participating plugin always provides its own spec-producer; The spec-producer writes the spec.md body and the impl side cannot |
| `sdd-operator` runs the **implementation phase** for a domain | the domain name, the plugin registry, the frozen `.feature`, the resolved impl-producer + impl-judge roles | the impl-producer co-produces the implementation **and** its verification anchored to the frozen scenarios, loading the actor governances it embodies; the covering plugin's impl-judge (else the `sdd-implementer` default) runs that verification rather than authoring it (`producer ≠ judge`); product/test splits stay inside the impl-producer; every production-chain role resolves | Forward producers load the actor governances they embody; The impl-producer co-produces the verification with the implementation; The impl-judge runs the producer's verification rather than authoring it; Operator dispatches to the plugin impl-judge that covers the domain; Operator falls back to the default impl-judge when no plugin covers the domain; Product and test separation stays inside the impl-producer; The operator resolves every production-chain role; ACES evals are authored by the impl-producer and run by the impl-judge; Degenerate impl roles fall back without a plugin agent |
| A **plugin author** reads the dispatch interface | the `sdd-operator` definition and the SDD default delegates | the input/output contract for each production-chain role is fully specified from the operator and defaults alone, with no separate governance file to author against | A plugin author reads the interface from the operator and default delegates |

## References

`sdd:plugin-contract-governance` (the five roles, governances each loads); `sdd:ownership-governance` (write boundary); `sdd:builder-governance` / `sdd:architect-governance` / `sdd:director-governance` (the actor bars).

## Artifacts

| Label | Path |
|---|---|
| Spec | `artifacts/specs/sdd-operator-dispatch/spec.md` |
| Scenarios | `artifacts/specs/sdd-operator-dispatch/sdd-operator-dispatch.feature` |
| Implementation | `plugins/sdd/agents/sdd-operator.md` |
| Verification | `plugins/sdd/agents/sdd-operator.test.mts` |
