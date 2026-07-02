---
name: optional-effort-stamp
layer: behavior
threshold: 4
---

## Scenario

The user asks to stamp an effort on a specific model's runner def. manage-model-runners updates that def.

## Expected behaviors

- Agent writes an `effort: <low|medium|high|xhigh|max>` field on the named model's def
- Agent keeps exactly one def per model — the stamp updates the existing def, it does not fan out
- Agent applies the effort stamp only on request (it is optional)

## Must NOT do

- Create a separate model×effort def to hold the effort
- Add more than one def for the model when stamping
- Apply an effort stamp when none was requested

## Assertions

- Response writes an `effort:` field on the named model's def
- Response keeps exactly one def per model after stamping

## Rubric

Score 1–5:
5 — Writes the effort field on the named model's existing def, still one def per model
4 — Applies the effort stamp on the right def; wording slightly loose
3 — Applies the stamp but is ambiguous about keeping one def per model
2 — Creates a model×effort variant def to hold the effort
1 — Fans out over effort or stamps unrequested defs
