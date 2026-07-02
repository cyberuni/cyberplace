---
name: bare-invocation-gathers-via-menu
layer: behavior
threshold: 4
---

## Scenario

The user invokes manage with no operation named — just "manage" or "do some ACED manage work" — giving no indication of which operation is wanted.

## Expected behaviors

- Agent conducts intake rather than guessing an operation
- Agent asks the user to pick the operation (via `AskUserQuestion`)
- Agent waits for the user's choice before loading any engine

## Must NOT do

- Guess an operation and load an engine without asking
- Load `manage-model-runners` (or any engine) before the user picks
- Proceed as if an operation had been named

## Assertions

- Response asks the user to choose the operation
- Response does not load an engine before the user picks

## Rubric

Score 1–5:
5 — Presents an operation-selection menu and waits for the user to pick, guessing nothing
4 — Asks the user to pick the operation clearly, minor phrasing noise
3 — Asks but also hints strongly at a pre-picked default
2 — Guesses an operation but confirms before running
1 — Loads an engine without asking on a bare invocation
