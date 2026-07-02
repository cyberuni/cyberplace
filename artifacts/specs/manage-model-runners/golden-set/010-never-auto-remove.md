---
name: never-auto-remove
layer: behavior
threshold: 4
---

## Scenario

A target model list omits a model whose runner def already exists. manage-model-runners runs add against that list.

## Expected behaviors

- Agent leaves the omitted model's runner def intact
- Agent reconcile-deletes nothing — add is additive only
- Agent treats a model absent from the target list as "leave alone," not "remove"

## Must NOT do

- Delete or cull a runner def just because it is absent from the target list
- Perform any reconcile-delete during add
- Treat the target list as an authoritative set that prunes the family

## Assertions

- Response leaves the omitted model's runner def intact
- Response deletes nothing during add

## Rubric

Score 1–5:
5 — Adds only the missing defs and leaves the omitted model's def intact, deleting nothing
4 — Additive-only behavior; the no-cull rule implied rather than stated
3 — Additive but ambiguous about whether the omitted def survives
2 — Warns it might remove the omitted def, or asks to prune
1 — Reconcile-deletes the omitted model's def
