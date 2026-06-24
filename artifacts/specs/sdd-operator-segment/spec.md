---
status: draft
type: feature
blocked-by:
  - sdd-operator
aligned: false
---

# SDD Operator — The Segment

> **Feature child of [`sdd-operator`](../sdd-operator/spec.md).** This spec owns one behavior of the Operator (the SDD lead delegate, `sdd-orchestrator`). The parent holds the human-readable overview and the model invariants; this child holds the normative scenarios for its slice.

## What

How **one autonomous run** behaves and reports. The Operator has no user channel: it runs one **segment** as far as it can, then returns `complete` / `blocked` / `needs-input` with questions **batched**; the relay owns the user loop and re-invokes to resume. State is reconstructed from artifacts — the workflow cursor is derived, never stored. Questions split two ways: **content gaps** become inline `<!-- open: -->` markers (durable, block Draft→Approved); workflow-procedural questions are transient. The iteration cap blocks-and-asks rather than auto-accepting. **OBSERVATIONS** are non-blocking, typed by owning actor, and bubble up — only the skill surfaces them and spawns any resulting spec.

## Use Cases

Every scenario in this child traces to its behavior, step-down ordered in the `.feature`:

| Scenario | Covered in |
|---|---|
| Orchestrator suspends at a user-input checkpoint instead of asking | sdd-operator-segment.feature |
| The skill resumes the orchestrator after collecting answers | sdd-operator-segment.feature |
| Questions are batched within a segment, not asked one at a time | sdd-operator-segment.feature |
| The workflow cursor is derived from artifact state across sessions | sdd-operator-segment.feature |
| A content gap persists as an inline marker, not a separate file | sdd-operator-segment.feature |
| A workflow-procedural question is not persisted | sdd-operator-segment.feature |
| The iteration cap blocks and asks rather than auto-accepting | sdd-operator-segment.feature |
| A structural concern is emitted as a non-blocking observation | sdd-operator-segment.feature |
| Observations bubble up and only the skill surfaces them | sdd-operator-segment.feature |
| Strategist observations surface only at boundaries and dedupe by recurrence | sdd-operator-segment.feature |
| A strategist lesson spawns a spec that may target another monorepo project | sdd-operator-segment.feature |
| An accepted structural observation spawns a new spec | sdd-operator-segment.feature |

## References

`sdd:lifecycle-governance` (open-marker gating, cursor derivation); `combat-log-governance` (the report shape); `sdd:gate-validation-governance` (escalate at gate/scrub).

## Artifacts

| Label | Path |
|---|---|
| Spec | `artifacts/specs/sdd-operator-segment/spec.md` |
| Scenarios | `artifacts/specs/sdd-operator-segment/sdd-operator-segment.feature` |
