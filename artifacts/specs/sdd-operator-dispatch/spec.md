---
status: implemented
type: feature
domain-type: subagent
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
  spec-producer: sdd:sdd-operator
  spec-judge: sdd:sdd-spec-judge
  impl-producer: sdd:sdd-operator
  impl-judge: sdd:sdd-implementer
---

# SDD Operator — Production-Chain Dispatch

> **Feature child of [`sdd-operator`](../sdd-operator/spec.md).** This spec owns one behavior of the Operator (the SDD lead delegate, `sdd-operator`). The parent holds the human-readable overview and the model invariants; this child holds the normative scenarios for its slice.

## What

Once roles are resolved, **who does what** — and, just as important, **where each role runs**. The Operator dispatches each production-chain role through one uniform I/O surface, but the dispatch *mechanism* depends on the role's kind and on whether an agent is named:

- **Producer, unnamed** (no plugin agent, no model-tuned producer agent named for the slot) → the Operator **loads the SDD-default producer governance and authors the artifact inline in its own warm context**, recorded `produced-by.<role>: sdd:sdd-operator`. There is no spawned default producer agent and no "generic Builder".
- **Producer, named** (a plugin delegate covers the domain, **or** the slot names a model-tuned producer agent — the model-tuning escape valve) → the Operator **spawns that named agent** so it runs at its **own model and effort**. The spawn is keyed on the slot *naming* an agent, not merely on full domain coverage.
- **Judge, always** (`spec-judge`, `impl-judge`) → the Operator **spawns a cold agent in a fresh context** — the SDD default (`sdd:sdd-spec-judge`, `sdd:sdd-implementer`) or the covering plugin's judge. A judge is never run inline, regardless of naming, because the grader must not share the author's context (`producer ≠ judge` enforced by context separation). Tagline: **"conductor writes, cold judges grade."**

Through that mechanism the roles co-deliver: the spec-producer writes the `spec.md` body + the `.feature`; the plan-producer writes `plan.md` + `tasks.md`; the impl-producer co-produces the implementation **and** its verification (one test/eval per frozen scenario); the spec-judge and impl-judge run the bars. Forward producers load the actor governances they embody to self-align. The write-boundary travels with the roles: impl-side roles never touch `spec.md` or the `.feature`. Governances load as harness skills — no `governance show` CLI call.

## Use Cases

Three entry-points invoke this dispatch behavior. Each is verified by one-or-more boolean scenarios in `sdd-operator-dispatch.feature` (one-to-many) — the **Scenarios** column lists every scenario that traces to that use case, and the union covers all 16.

| Trigger | Inputs | Outcome | Scenarios |
|---|---|---|---|
| `sdd-operator` runs the **design phase** for a domain | the domain name, the plugin registry, the resolved spec-producer role | an **unnamed** spec-producer slot is authored inline by the Operator (loaded governance, warm, recorded `sdd:sdd-operator`); a **named** spec-producer (plugin delegate **or** model-tuned producer agent) is **spawned** at its own model; the spec-producer loads `sdd:spec-governance` as a harness skill with no `governance show` call, writes only the `spec.md` body + `.feature`, and the impl side is barred from those artifacts; a producer that writes a control frontmatter field is caught as a write-boundary violation | Spec-producers load the SDD governance skill for format rules; The loop runs without a governance-show call; An unnamed spec-producer is authored inline in the operator warm context; A named spec-producer agent is spawned at its own model; The spec-producer writes the spec.md body and the impl side cannot; A spec-producer that writes a control frontmatter field violates the write boundary |
| `sdd-operator` runs the **implementation phase** for a domain | the domain name, the plugin registry, the frozen `.feature`, the resolved impl-producer + impl-judge roles | an **unnamed** impl-producer is authored inline by the Operator (warm, recorded `sdd:sdd-operator`); a **named** impl-producer is spawned at its own model; either way it co-produces the implementation **and** its verification anchored to the frozen scenarios, loading the actor governances it embodies; the impl-judge is **always spawned cold** (the covering plugin's, else the `sdd-implementer` default) and runs that verification rather than authoring it (`producer ≠ judge`); a frozen scenario with no verification is reported failing and blocks `aligned`; product/test splits stay inside the impl-producer; every production-chain role resolves | Forward producers load the actor governances they embody; An unnamed impl-producer is authored inline in the operator warm context; The impl-producer co-produces the verification with the implementation; The impl-judge is spawned as a cold agent and runs the producer's verification rather than authoring it; Operator spawns the plugin impl-judge cold when one covers the domain; A missing verification for a frozen scenario is reported failing by the cold impl-judge; The operator receives one impl-producer result regardless of any product-test split; The operator resolves every production-chain role; ACED evals are authored by the impl-producer and run by the cold impl-judge |
| A **plugin author** reads the dispatch interface | the `sdd-operator` definition and the SDD default delegates | the input/output contract for each production-chain role is fully specified from the operator and defaults alone, with no separate governance file to author against | A plugin author reads the interface from the operator and default delegates |

## References

`sdd:plugin-contract-governance` (the five roles, governances each loads); `sdd:ownership-governance` (write boundary); `sdd:builder-governance` / `sdd:architect-governance` / `sdd:oracle-governance` (the actor bars). The parent `sdd-operator` holds the warm-producer / cold-judge model invariants; the sibling `sdd-operator-resolution` owns the resolution (who) side — this spec owns the dispatch (how / I-O) side.

## Artifacts

| Label | Path |
|---|---|
| Spec | `artifacts/specs/sdd-operator-dispatch/spec.md` |
| Scenarios | `artifacts/specs/sdd-operator-dispatch/sdd-operator-dispatch.feature` |
| Implementation | `plugins/sdd/agents/sdd-operator.md` |
| Verification | `plugins/sdd/agents/sdd-operator.test.mts` |
