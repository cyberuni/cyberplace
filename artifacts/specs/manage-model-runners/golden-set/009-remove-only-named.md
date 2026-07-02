---
name: remove-only-named
layer: behavior
threshold: 4
---

## Scenario

A remove request names a specific model. manage-model-runners runs remove.

## Expected behaviors

- Agent deletes only the named model's runner def
- Agent leaves the rest of the family intact
- Agent scopes the deletion to what the user explicitly named (by model or path)

## Must NOT do

- Delete any runner def the user did not name
- Reconcile-delete or cull the rest of the family
- Treat the named model as a target list that removes others by omission

## Assertions

- Response deletes only the named model's runner def
- Response leaves every other runner def intact

## Rubric

Score 1–5:
5 — Deletes exactly the named model's def, leaving the rest of the family intact
4 — Removes the named def correctly; wording slightly loose about scope
3 — Removes the named def but touches an unnamed one incidentally
2 — Removes more than the named def
1 — Deletes broadly or removes the wrong def
