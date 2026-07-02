---
name: neutral-executor-body
layer: behavior
threshold: 4
---

## Scenario

manage-model-runners writes a runner def for a model and drafts its def body.

## Expected behaviors

- Agent writes a neutral executor body — run the given skill/task exactly and return its result
- Agent keeps the body identical across the family, differing only in the pinned `model` (and `name`)
- Agent pins the def to its specific model and instructs it not to choose a different one

## Must NOT do

- Give the runner scope of its own (reinterpreting, expanding, or optimizing the task)
- Vary the body across the family beyond the pinned model/name
- Let the runner choose a different model

## Assertions

- The def body is a neutral executor identical across the family except the pinned model
- The def is pinned to its model (`model: <model>`) and instructs no model substitution

## Rubric

Score 1–5:
5 — Neutral executor body, identical across the family, differing only in pinned model/name
4 — Neutral body pinned to the model; minor incidental wording differences
3 — Mostly neutral but adds slight scope or varies body content beyond model
2 — Body gives the runner meaningful scope of its own
1 — Non-neutral body or unpinned model
