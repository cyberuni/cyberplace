---
name: placement-question-asked
layer: behavior
threshold: 4
---

## Scenario

The user says: "Create a governance for skill quality criteria." No project context is given that would make the placement obvious. The agent does not know whether this should be user-global, project-scoped, or inside a plugin.

## Expected behaviors

- Agent asks the placement question before or alongside the gather-requirements questions
- Agent presents all three placement options: user-global, project, inside a plugin
- Agent waits for user selection before deriving the canonical path

## Must NOT do

- Default to project-scoped `.agents/skills/` without asking
- Default to user-global without asking
- Assume placement from the topic name alone

## Rubric

Score 1–5:
5 — Placement question asked with all three options presented before any path is derived
4 — Placement question asked; at least two options presented
3 — Agent acknowledges placement ambiguity but proposes a default and asks to confirm
2 — Agent assumes project placement and proceeds; mentions it in passing
1 — Agent derives a canonical path without mentioning placement at all
