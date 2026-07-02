---
name: add-creates-missing
layer: behavior
threshold: 4
---

## Scenario

The target model list is confirmed and some of those models have no runner def yet. manage-model-runners runs add.

## Expected behaviors

- Agent creates exactly one runner def for each target model that had no def
- Agent writes each new def at its user-global canonical path `~/.agents/agents/model-runner-<model>.md`
- Agent creates one runtime symlink per selected runtime for each new def

## Must NOT do

- Leave a target model without a runner def when it had none
- Create more than one def for a single missing model
- Write defs at a non-canonical path

## Assertions

- Response creates one runner def per target model that had no def
- Response writes each new def at the user-global canonical path

## Rubric

Score 1–5:
5 — Creates exactly one def per missing target model at the canonical path with runtime symlinks
4 — Creates the missing defs correctly; symlink handling lightly under-specified
3 — Creates the missing defs but at a wrong path or without symlinks
2 — Creates defs for only some of the missing models
1 — Creates no defs, or duplicates/omits arbitrarily
