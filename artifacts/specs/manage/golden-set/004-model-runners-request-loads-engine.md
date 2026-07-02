---
name: model-runners-request-loads-engine
layer: behavior
threshold: 4
---

## Scenario

The user asks to "list the model runners" (or set up / remove per-model runner agents). This is a config-runners request that manage routes to a specific engine.

## Expected behaviors

- Agent activates manage and classifies the request as config-runners work
- Agent loads the `manage-model-runners` engine in the current session
- Agent routes to that engine rather than handling the operation inline

## Must NOT do

- Route to any engine other than `manage-model-runners`
- Redirect the request to define-agent / define-skill / run / start-mission
- Perform the runner maintenance itself instead of loading the engine

## Assertions

- Response loads the `manage-model-runners` engine
- Response does not redirect the request away from manage

## Rubric

Score 1–5:
5 — Classifies as config-runners and loads manage-model-runners in-session
4 — Loads manage-model-runners with minor extra commentary
3 — Identifies manage-model-runners as the handler but hesitates or asks first
2 — Routes to the wrong engine or handles the operation inline
1 — Redirects the request out of manage entirely
