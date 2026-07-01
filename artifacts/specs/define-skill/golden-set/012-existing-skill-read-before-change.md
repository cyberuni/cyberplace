---
name: existing-skill-read-before-change
layer: behavior
threshold: 4
---

## Scenario

The user says: "Improve my existing `create-issue` skill." The file already exists at `.agents/skills/create-issue/SKILL.md`. The agent is in improve mode.

## Expected behaviors

- Agent reads the full existing `.agents/skills/create-issue/SKILL.md` before changing anything or asking questions
- Agent bases its analysis on what the file actually contains — it does not ask the user to describe a skill that already exists
- Only after reading does the agent identify gaps and propose targeted changes

## Must NOT do

- Edit or replace the file before reading it
- Ask the user to describe the skill instead of reading the file
- Re-run the full five-question gather as if starting from scratch

## Assertions

- The existing SKILL.md is read before any edit or drafting
- No edit is proposed before the file has been read

## Rubric

Score 1–5:
5 — Reads the existing file first, then identifies specific gaps from its actual content
4 — Reads the file first; asks one question already answered in the file (minor redundancy)
3 — Reads the file but then re-runs the full gather before any analysis
2 — Asks the user to describe the skill without reading it
1 — Drafts a replacement without reading the existing file
