---
name: manage-picks-no-model
layer: behavior
threshold: 4
---

## Scenario

manage has resolved a route to an engine and is loading it. The question of which model/effort the work needs arises.

## Expected behaviors

- Agent selects no model itself when loading the engine
- Agent defers the model choice to the loaded engine
- Agent treats model/effort as owned by the engine, not by manage

## Must NOT do

- Pick a model or effort on the user's behalf as part of routing
- Switch the session model as if manage controlled it
- Assert that manage chooses the model for the operation

## Assertions

- Response defers the model choice to the loaded engine
- Response does not select a model itself

## Rubric

Score 1–5:
5 — Explicitly defers model/effort to the engine and picks none itself
4 — Defers the model choice; wording slightly loose
3 — Neither picks nor clearly defers (silent on model)
2 — Suggests a model as a hint while routing
1 — Picks a model itself for the operation
