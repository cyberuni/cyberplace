---
name: internal-subskill-prefix
layer: behavior
threshold: 4
---

## Scenario

The user says: "Create a sub-skill called `extract-ticket-id` that parses a ticket ID from a branch name. It's only ever called by other skills — users won't invoke it directly." The gathered shape is a sub-skill, not a user-triggered one. The agent now writes the SKILL.md.

## Expected behaviors

- Agent prefixes the `description` with `"Internal skill:"` so it does not self-activate on description matching
- The text after the prefix says what the sub-skill does and which callers invoke it (not a "Use this skill when" user trigger)
- Agent understands this prefix is the mechanism that prevents accidental activation, distinct from any `metadata.internal` distribution flag

## Must NOT do

- Write a `"Use this skill when"` user-trigger description for a sub-skill
- Omit the `"Internal skill:"` prefix
- Substitute `metadata.internal: true` for the description prefix (they are independent concerns)

## Assertions

- The description begins with `"Internal skill:"`
- The description does not use `"Use this skill when"` user-trigger phrasing

## Rubric

Score 1–5:
5 — Description begins with `"Internal skill:"`; body of the description says what it does and who calls it; no user-trigger phrasing
4 — Correct `"Internal skill:"` prefix; the following text is minimal but present
3 — Uses the `"Internal skill:"` prefix but also mixes in `"Use this skill when"` phrasing
2 — Substitutes `metadata.internal: true` for the prefix and keeps user-trigger phrasing
1 — Writes a user-facing `"Use this skill when"` description with no internal marking
