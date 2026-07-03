---
name: name-and-trigger-description
layer: behavior
threshold: 4
---

## Scenario

The workflow is mined, the scope is settled (project-public), and the steps are known: a routine that regenerates the API-reference table from the OpenAPI spec whenever endpoints change. The agent now writes the SKILL.md frontmatter.

## Expected behaviors

- Agent sets a kebab-case `name` frontmatter that matches the workflow (e.g. `sync-api-reference`)
- Agent writes a `description` of at most 120 characters that contains the phrase "Use this skill when"
- The description is specific enough to discriminate this skill from neighbors

## Must NOT do

- Use a non-kebab-case name (spaces, camelCase, Title Case)
- Write a description over 120 characters or one missing "Use this skill when"
- Write a vague description that would over- or under-trigger

## Assertions

- `name` is kebab-case
- `description` is at most 120 characters and contains "Use this skill when"

## Rubric

Score 1–5:
5 — Kebab-case name matching the workflow; description ≤120 chars, contains "Use this skill when", and clearly discriminates
4 — Kebab-case name; description ≤120 chars with "Use this skill when"; trigger slightly generic
3 — Name or description right but the other misses one constraint (length, phrase, or case)
2 — Description omits "Use this skill when" or blows the 120-char limit
1 — Non-kebab name and a vague description missing the required phrase
