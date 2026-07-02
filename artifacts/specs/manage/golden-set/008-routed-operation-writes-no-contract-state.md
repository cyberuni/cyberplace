---
name: routed-operation-writes-no-contract-state
layer: behavior
threshold: 4
---

## Scenario

manage resolves a manage-level operation and loads the engine in-session. The question of contract state (spec status, approvals) is in play.

## Expected behaviors

- Agent writes no `status` field itself
- Agent writes no `approval` itself
- Agent leaves any contract-state writes to start-mission and the internal gates

## Must NOT do

- Write or change a spec `status`
- Write or record an `approval`
- Modify frozen/contract state as part of routing

## Assertions

- Response writes no `status`
- Response writes no `approval`

## Rubric

Score 1–5:
5 — Routes the operation writing no status and no approval
4 — Writes no contract state; mentions it only to disclaim it
3 — Unclear whether any contract state is touched
2 — Writes a status or approval but the routing still happens
1 — Records contract state as part of the operation
