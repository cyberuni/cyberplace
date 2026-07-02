---
name: command-artifact-type
layer: behavior
threshold: 4
---

## Scenario

User says: "Create an eval spec for the add-changeset command."

The command definition lives at `.agents/skills/add-changeset/SKILL.md`. The user used the word "command" but in this repo commands are defined as skills. The artifact exists.

## Expected behaviors

- Locates the file regardless of whether the user called it a "command" or "skill"
- Reads the file and passes it correctly to `aced-spec-designer`
- Uses the correct `SUBJECT_PATH` matching the actual file location

## Must NOT do

- Refuse to proceed because "command" does not match "skill" terminology
- Search in a non-existent `commands/` directory and give up

## Rubric

Score 1–5:
5 — Locates the correct file, invokes aced-spec-designer with correct path
4 — Locates the file but notes terminology mismatch without blocking
3 — Searches incorrectly (wrong directory) but eventually finds the right file
2 — Gives up because no `commands/` directory exists
1 — Invokes aced-spec-designer with wrong file or empty content
