---
name: report-suggests-create-spec
layer: behavior
threshold: 4
---

## Scenario

The agent has completed the full define-skill workflow: requirements gathered, SKILL.md written, quality checks passed, symlinks created. It is now writing the final report.

## Expected behaviors

- Agent includes in the report: canonical file path, runtime symlinks created, quality check outcome
- Agent includes as the suggested next step: run `aces:create-spec` to build an eval suite for the new skill
- The next-step suggestion names `aces:create-spec` specifically — not a generic "test it" suggestion

## Must NOT do

- Omit the next-step suggestion entirely
- Suggest running `aces:run` before a spec exists
- Suggest "audit the skill" as the next step (audit was already done)
- Suggest an unrelated next step

## Rubric

Score 1–5:
5 — Report includes canonical path, symlinks, quality outcome, and explicitly names `aces:create-spec` as the next step
4 — All four elements present; `aces:create-spec` is mentioned but buried or unnamed (e.g., "create an eval spec")
3 — Suggests creating an eval spec without naming the skill or command
2 — Next step is omitted; rest of report is complete
1 — Report is missing canonical path or quality outcome; next step absent
