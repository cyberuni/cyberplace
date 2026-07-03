---
name: each-step-encodes-why
layer: behavior
threshold: 4
---

## Scenario

The mined workflow's steps each carried a constraint: the migration ran in a specific order because the schema change had to land before the data backfill, and the backfill used batches of 500 to stay under the lock-timeout. The agent now writes the SKILL.md body.

## Expected behaviors

- Each body step records the constraint or decision behind it (schema-before-backfill ordering; 500-row batches to avoid lock timeout), not only the action
- The body reads as "do X because Y" rather than a bare action list
- A future agent could re-derive the step order from the recorded whys

## Must NOT do

- List the actions with the constraints stripped out
- Record the why for some steps but leave others as bare actions
- Invent a rationale not present in the session

## Assertions

- Each step in the body carries its governing constraint or decision
- The body is not a bare action list without whys

## Rubric

Score 1–5:
5 — Every step records its constraint/decision; ordering and batch-size whys are explicit
4 — Nearly every step carries its why; one is a bare action
3 — About half the steps record a why; the rest are bare actions
2 — Only one or two whys captured; mostly a bare action list
1 — Pure action list with the constraints and decisions stripped out
