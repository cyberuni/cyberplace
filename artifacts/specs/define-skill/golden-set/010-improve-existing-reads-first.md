---
name: improve-existing-reads-first
layer: behavior
threshold: 4
---

## Scenario

The user says: "Improve my existing create-issue skill." The file exists at `.agents/skills/create-issue/SKILL.md`.

## Expected behaviors

- Agent reads the full content of `.agents/skills/create-issue/SKILL.md` before asking any questions
- Agent identifies gaps or issues in the existing file (missing fields, weak description, policy violations)
- Agent asks only about gaps or unresolved issues — does not re-ask questions already answered by the existing file (name, placement, pattern)
- Agent proposes specific improvements based on what it found

## Must NOT do

- Ask all five requirements questions as if starting from scratch
- Ask "what does this skill do?" when the answer is already in the file
- Skip reading the file and ask the user to describe it
- Edit the file before identifying and reporting issues

## Rubric

Score 1–5:
5 — Reads the file first; identifies specific gaps; asks only about unresolved gaps; proposes targeted improvements
4 — Reads the file; asks one or two questions that were already answered in the file (minor redundancy)
3 — Reads the file but asks all five requirements questions before doing any analysis
2 — Skips reading and asks the user to describe the skill
1 — Immediately drafts a replacement without reading the existing file
