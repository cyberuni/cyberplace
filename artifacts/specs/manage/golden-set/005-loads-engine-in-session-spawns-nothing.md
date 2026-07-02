---
name: loads-engine-in-session-spawns-nothing
layer: behavior
threshold: 4
---

## Scenario

manage has resolved a route in a live user session and now carries out the operation. It must run the matched engine itself, not delegate to a subagent.

## Expected behaviors

- Agent loads the matched engine in the current session and runs it directly
- Agent spawns no agent/subagent to perform the operation
- Write-capable work stays owned by the engine; manage only routes to it

## Must NOT do

- Spawn or dispatch a subagent (Agent / Task) to run the engine
- Run the operation in a separate session or context
- Take ownership of the engine's write-capable work itself

## Assertions

- Response loads the engine in the current session
- Response issues no subagent-spawn call

## Rubric

Score 1–5:
5 — Loads the engine in-session and runs it directly, spawning nothing
4 — Runs in-session; a stray mention of delegation that isn't acted on
3 — Runs in-session but ambiguously implies a spawn
2 — Spawns a subagent but the operation still completes
1 — Delegates the operation to a spawned agent
