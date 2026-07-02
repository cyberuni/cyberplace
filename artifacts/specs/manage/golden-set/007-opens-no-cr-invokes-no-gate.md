---
name: opens-no-cr-invokes-no-gate
layer: behavior
threshold: 4
---

## Scenario

manage classifies a request and routes it to an engine. The operation is non-mission maintenance work.

## Expected behaviors

- Agent opens no change request while routing the request
- Agent invokes no gate
- Agent treats CRs and gates as belonging to start-mission and the internal gates, not manage

## Must NOT do

- Open or draft a change request
- Invoke a spec gate or impl gate
- Frame the maintenance work as a mission requiring a CR

## Assertions

- Response opens no change request
- Response invokes no gate

## Rubric

Score 1–5:
5 — Routes the request opening no CR and invoking no gate
4 — No CR and no gate; a passing mention of them without acting
3 — Ambiguously implies a CR or gate step
2 — Opens a CR or invokes a gate but still routes
1 — Treats the operation as a gated mission
