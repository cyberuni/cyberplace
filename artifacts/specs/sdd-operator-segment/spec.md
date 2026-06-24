---
status: implemented
type: feature
blocked-by:
  - sdd-operator
aligned: true
produced-by:
  impl-producer: sdd:builder
  impl-judge: sdd:sdd-implementer
approval:
  spec:
    verdict: approve
    by: unional
  impl:
    verdict: approve
    by: unional
---

# SDD Operator — The Segment

> **Feature child of [`sdd-operator`](../sdd-operator/spec.md).** This spec owns one behavior of the Operator (the SDD lead delegate, `sdd-orchestrator`). The parent holds the human-readable overview and the model invariants; this child holds the normative scenarios for its slice.

## What

How **one autonomous run** behaves and reports. The Operator has no user channel: it runs one **segment** as far as it can, then returns `complete` / `blocked` / `needs-input` with questions **batched**; the relay owns the user loop and re-invokes to resume. State is reconstructed from artifacts — the workflow cursor is derived, never stored. Questions split two ways: **content gaps** become inline `<!-- open: -->` markers (durable, block Draft→Approved); workflow-procedural questions are transient. The iteration cap blocks-and-asks rather than auto-accepting. **OBSERVATIONS** are non-blocking, typed by owning actor, and bubble up — only the skill surfaces them and spawns any resulting spec.

## Use Cases

The Operator segment is invoked three distinct ways. Each is an entry-point — a trigger, the inputs it receives, and the outcome it returns — and each is verified by one or more scenarios in the `.feature` (one-to-many).

| # | Use case | Trigger | Inputs | Outcome |
|---|---|---|---|---|
| UC1 | **Operator invoked cold for a segment** | A relay skill (e.g. `create-spec`, `validate-spec`) dispatches one autonomous run; no prior segment state is in memory. | Domain + spec path; the on-disk `spec.md` and `.feature` (status, `aligned`, open markers). | Reconstructs the workflow cursor from the artifacts, runs to the next checkpoint, and returns `complete` / `blocked` / `needs-input` with questions **batched** — never asking the user directly. Content gaps persist as inline `<!-- open: -->` markers; procedural questions stay transient; the iteration cap blocks-and-asks. |
| UC2 | **Skill re-invokes to resume after answers** | The relay collected user answers to a prior `needs-input` return and calls the Operator again. | The same domain + artifacts, plus `USER_ANSWERS` for the batched questions. | Re-reads `spec.md` and the `.feature` to rebuild state (cursor is derived, never stored), folds the answers in, and continues the run from where it suspended. |
| UC3 | **A delegate emits an observation** | A production-chain delegate (producer, judge, or Strategist) returns a non-blocking `OBSERVATIONS` entry while doing its primary work. | The delegate's typed observation (owner `architect` \| `strategist`); for Strategist, the existing candidate-spec set. | The Operator forwards the observation to the skill without acting on it; only the skill surfaces it and, on acceptance, spawns the resulting spec (possibly under a sibling monorepo project) or dedupes it by recurrence at a boundary. `STATUS` is never blocked by an observation. |

**Scenario coverage** — every scenario in the `.feature` traces to exactly one use case:

| Use case | Scenarios (step-down order in `sdd-operator-segment.feature`) |
|---|---|
| **UC1** — invoked cold | Orchestrator suspends at a user-input checkpoint instead of asking · Questions are batched within a segment · The workflow cursor is derived from artifact state across sessions · A content gap persists as an inline marker, not a separate file · A workflow-procedural question is not persisted · The iteration cap blocks and asks rather than auto-accepting |
| **UC2** — resume after answers | The skill resumes the orchestrator after collecting answers |
| **UC3** — delegate observation | A structural concern is emitted as a non-blocking observation · Observations bubble up and only the skill surfaces them · Strategist observations surface only at boundaries and dedupe by recurrence · A strategist lesson spawns a spec that may target another monorepo project · An accepted structural observation spawns a new spec |

## References

`sdd:lifecycle-governance` (open-marker gating, cursor derivation); `combat-log-governance` (the report shape); `sdd:gate-validation-governance` (escalate at gate/scrub).

## Artifacts

| Label | Path |
|---|---|
| Spec | `artifacts/specs/sdd-operator-segment/spec.md` |
| Scenarios | `artifacts/specs/sdd-operator-segment/sdd-operator-segment.feature` |
| Implementation | `plugins/sdd/agents/sdd-operator.md` |
| Verification | `plugins/sdd/agents/sdd-operator.test.mts` |
