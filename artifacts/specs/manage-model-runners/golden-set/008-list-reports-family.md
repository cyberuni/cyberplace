---
name: list-reports-family
layer: behavior
threshold: 4
---

## Scenario

A runner family exists and the user asks manage-model-runners to run list.

## Expected behaviors

- Agent scans `~/.agents/agents/` for `model-runner-*.md`
- Agent reports each runner's model, its canonical def path, and any `effort:` stamp
- Agent shows nothing beyond that per-runner report

## Must NOT do

- Omit the model, path, or effort stamp from the report
- Add, remove, or modify any runner def during list
- Report defs outside the runner family

## Assertions

- Response reports each runner's model, canonical path, and effort stamp
- Response makes no changes to any def (list is read-only)

## Rubric

Score 1–5:
5 — Reports model + canonical path + effort stamp for each runner, changing nothing
4 — Reports the family correctly; one field lightly abbreviated
3 — Reports the family but drops one required field
2 — Report is incomplete or modifies a def while listing
1 — Fails to enumerate the family or reports unrelated files
