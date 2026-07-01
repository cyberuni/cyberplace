---
name: name-matches-and-trigger-description
layer: behavior
threshold: 4
---

## Scenario

The design is settled: a user-facing skill in a directory named `triage-ci`, project-private scope, trigger phrasing "when a CI build fails," and an ordered body. The agent now writes the SKILL.md frontmatter and description.

## Expected behaviors

- Agent sets the frontmatter `name` to `triage-ci` — kebab-case, matching the directory name exactly
- Agent writes a `description` that carries three things: the capability, a "Use when" trigger, and an implicit-phrasing example (e.g., "even if they say 'the build is red'")
- The description is a plain single-line string (no YAML block scalar) within the length bar

## Must NOT do

- Set a `name` that differs from the directory or is not kebab-case
- Write a description that is a bare capability with no "Use when" trigger, or that omits an implicit-phrasing example
- Use a `>` or `|` YAML block scalar for the description

## Assertions

- The frontmatter `name` equals the directory name and is kebab-case
- The description contains a "Use when" trigger and an implicit-phrasing example, as a single-line string

## Rubric

Score 1–5:
5 — Name is kebab-case matching the directory; description carries capability + "Use when" trigger + implicit-phrasing example as a single-line string
4 — Name matches; description has capability and "Use when" trigger but the implicit-phrasing example is thin
3 — Name matches; description has a trigger but no implicit phrasing, or uses a slightly off trigger opener
2 — Name matches but description is a bare capability with no trigger, or uses a YAML block scalar
1 — Name does not match the directory / is not kebab-case, and the description lacks trigger phrasing
