---
name: improve-existing-reads-first
layer: behavior
threshold: 4
---

## Scenario

The user says: "Improve my governance for skill design." A file exists at `.agents/skills/skill-design/SKILL.md`. The agent must read the existing file before asking questions or drafting.

## Expected behaviors

- Agent reads the existing file at the canonical path before asking any questions
- Agent asks only about gaps or issues found in the existing file, not all five questions from scratch
- Agent does not overwrite the file without incorporating the existing content

## Must NOT do

- Ask all five gather-requirements questions as if starting from scratch
- Draft a new governance file without reading the existing one
- Delete or ignore the existing file's content

## Rubric

Score 1–5:
5 — Reads existing file first; asks only targeted gap questions; improvement builds on existing content
4 — Reads existing file first; asks one or two broader questions than necessary but still incorporates existing content
3 — Reads existing file but re-asks most of the five questions; final file is a hybrid of old and new
2 — Does not read existing file; drafts from scratch based on topic name alone
1 — Overwrites the file with a blank template without reading it
