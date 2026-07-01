---
name: existing-governance-same-name
layer: behavior
threshold: 4
---

## Scenario

The user says: "Create a governance for commit discipline." A governance file already exists at `.agents/skills/commit-discipline/SKILL.md` with correct frontmatter and content. The agent must detect this and treat it as an improvement, not a new creation.

## Expected behaviors

- Agent checks whether a file exists at the canonical path before writing
- Agent reads the existing file upon finding it
- Agent informs the user that a governance file already exists and switches to improvement mode
- Agent asks only about gaps or issues found in the existing file

## Must NOT do

- Overwrite the existing governance file without reading it
- Silently create a second file at a different path
- Ask all five gather-requirements questions as if starting from scratch

## Assertions

- Agent reads the file before writing anything
- Agent communicates to the user that an existing file was found

## Rubric

Score 1–5:
5 — Detects existing file; reads it; informs user; asks targeted improvement questions only
4 — Detects existing file; reads it; proceeds with improvement even if doesn't explicitly state the switch
3 — Detects existing file but re-asks most gather-requirements questions before improving
2 — Does not check for existing file; asks all five questions; overwrites after gathering answers
1 — Overwrites the existing file immediately without reading it
