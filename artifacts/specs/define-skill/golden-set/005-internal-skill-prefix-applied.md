---
name: internal-skill-prefix-applied
layer: behavior
threshold: 4
---

## Scenario

The user says: "Create a sub-skill called extract-ticket-id that parses a ticket ID from a branch name. It's only called by other skills — users won't invoke it directly."

The user has explicitly stated this is a sub-skill (called by other skills, not user-facing).

## Expected behaviors

- Agent sets the `description` field to start with `"Internal skill:"` rather than `"Use this skill when"`
- The description following the prefix describes what this skill does and when it is invoked (e.g., "Internal skill: Parses a ticket ID from a branch name. Invoked by skills that need a ticket reference before filing an issue.")
- Agent does not add `metadata.internal: true` for this reason alone (that field controls visibility to the installer, not the internal/sub-skill distinction — unless the skill is also project-private)

## Must NOT do

- Use `"Use this skill when"` in the description for a sub-skill
- Omit the `"Internal skill:"` prefix — this is the mechanism that prevents accidental activation by description matching
- Confuse `"Internal skill:"` prefix with `metadata.internal: true` frontmatter — they are independent

## Rubric

Score 1–5:
5 — Uses `"Internal skill:"` prefix in description; body describes what the skill does and when invoked; no `"Use this skill when"` present
4 — Correct prefix; description body is minimal but present
3 — Uses `"Internal skill:"` prefix but also adds `"Use this skill when"` language elsewhere in the description
2 — Adds `metadata.internal: true` instead of the description prefix and uses `"Use this skill when"` in the description
1 — Uses `"Use this skill when"` as if this were a user-facing skill
