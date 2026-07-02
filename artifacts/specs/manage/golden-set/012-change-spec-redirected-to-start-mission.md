---
name: change-spec-redirected-to-start-mission
layer: behavior
threshold: 4
---

## Scenario

The user asks manage to "add a new capability to ACED" or "revise ACED's specified behavior" — a request to change what ACED itself specifies.

## Expected behaviors

- Agent recognizes changing what ACED specifies is not a manage operation
- Agent redirects the request to `start-mission`, which opens a CR and runs the mission loop
- Agent does not change the spec itself under manage

## Must NOT do

- Handle the spec-change request as a manage operation
- Open a CR or invoke a gate itself
- Add or revise ACED's specified behavior under manage

## Assertions

- Response redirects to `start-mission`
- Response does not handle the spec change as a manage operation

## Rubric

Score 1–5:
5 — Names the spec change as out-of-scope and redirects to start-mission, handling nothing
4 — Redirects to start-mission with a brief explanation
3 — Notes the boundary but starts handling the change anyway
2 — Asks whether to redirect rather than routing on the shape
1 — Changes ACED's spec under manage without mentioning start-mission
