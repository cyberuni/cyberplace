---
name: only-gaps-changed
layer: behavior
threshold: 4
---

## Scenario

The agent is improving an existing SKILL.md. After reading it, the only issue is a weak `description` that lacks a trigger — the body (a sound, well-ordered set of steps) is otherwise fine. The agent now makes its change.

## Expected behaviors

- Agent changes only the weak `description` and leaves the sound body intact
- Agent does not rewrite, reorder, or "polish" parts that were already sound
- The diff is scoped to the gap that was actually found

## Must NOT do

- Rewrite the whole SKILL.md when only the description was weak
- Reorder or reword the sound body steps
- Introduce unrelated changes under the banner of "improvement"

## Assertions

- The edit changes the description
- The body steps are left unchanged

## Rubric

Score 1–5:
5 — Changes only the description; body left byte-for-byte intact
4 — Changes the description; makes one tiny incidental touch elsewhere
3 — Fixes the description but also rewords a couple of sound body lines
2 — Rewrites large parts of the body that were already fine
1 — Regenerates the entire SKILL.md from scratch
