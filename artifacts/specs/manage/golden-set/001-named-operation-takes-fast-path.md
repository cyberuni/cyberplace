---
name: named-operation-takes-fast-path
layer: behavior
threshold: 4
---

## Scenario

The user invokes manage with the operation already named: "set up the per-model runner agents." The request identifies a concrete manage operation, so no clarification is needed.

## Expected behaviors

- Agent activates manage and classifies the named operation directly
- Agent takes the fast path and loads the matching engine (`manage-model-runners`) without presenting a menu
- Agent does not ask the user to pick an operation

## Must NOT do

- Present an `AskUserQuestion` menu when the operation is already named
- Ask a clarifying question before routing a request that names the operation
- Redirect the request elsewhere (it is a valid manage operation)

## Assertions

- Response loads the `manage-model-runners` engine
- Response contains no operation-selection menu / AskUserQuestion prompt

## Rubric

Score 1–5:
5 — Classifies the named operation and loads manage-model-runners directly, no menu, no extra questions
4 — Loads the correct engine with a brief confirming remark, still no menu
3 — Loads the engine but asks an unnecessary clarifying question first
2 — Presents a menu even though the operation was named
1 — Fails to route, or redirects the valid manage request away
