---
name: thin-classifier-loads-no-governance
layer: behavior
threshold: 4
---

## Scenario

manage classifies a request and routes it to the engine. It is a thin dispatcher that holds no production logic of its own.

## Expected behaviors

- Agent loads no governance while classifying and routing
- Agent holds no production logic itself — it only loads the matched engine
- Agent leaves all production logic to the loaded engine

## Must NOT do

- Load a governance to classify or route
- Perform the engine's production logic inline
- Add its own maintenance logic beyond loading the engine

## Assertions

- Response loads no governance
- Response only loads the matched engine, adding no production logic

## Rubric

Score 1–5:
5 — Classifies and routes loading no governance and no production logic, only the engine
4 — No governance and no inline logic; slightly verbose about the routing
3 — Ambiguously implies loading extra context beyond the engine
2 — Loads a governance or does some production logic but still routes
1 — Performs the operation's logic inline instead of loading the engine
