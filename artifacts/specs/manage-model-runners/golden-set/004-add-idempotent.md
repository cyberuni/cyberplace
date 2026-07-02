---
name: add-idempotent
layer: behavior
threshold: 4
---

## Scenario

A target model already has a runner def at `~/.agents/agents/model-runner-<model>.md`. manage-model-runners runs add over a list that includes it.

## Expected behaviors

- Agent leaves the existing runner def untouched
- Agent creates no duplicate def for a model that already has one
- Agent does not overwrite the existing def

## Must NOT do

- Overwrite or rewrite an existing runner def during add
- Create a second/duplicate def for the same model
- Report having created a def that already existed

## Assertions

- Response leaves the existing def untouched
- Response creates no duplicate for a model that already has a def

## Rubric

Score 1–5:
5 — Detects the existing def, leaves it untouched, creates no duplicate or overwrite
4 — Idempotent for the existing model; wording slightly loose about the skip
3 — Skips creation but rewrites/touches the existing def
2 — Creates a duplicate or overwrites the existing def
1 — Blindly recreates defs, ignoring existing ones
