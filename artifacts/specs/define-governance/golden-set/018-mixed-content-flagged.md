---
name: mixed-content-flagged
layer: behavior
threshold: 4
---

## Scenario

During gather-requirements, the user provides:
- A rubric for evaluating skill quality (4 criteria, scored 1–5)
- A workflow for how to run the audit: "First run the CLI, then check each criterion, then report results"

The user says "make this a governance file that also has the workflow steps."

## Expected behaviors

- Agent flags that the content is mixed: criteria belong in a governance file; workflow steps belong in a skill
- Agent explains the split: governance for criteria, separate skill for the workflow
- Agent offers two paths: (a) create a pure governance with only the criteria, deferring the workflow to a separate skill; or (b) create a workflow skill that embeds the criteria inline

## Must NOT do

- Create a governance file that contains both rubric criteria and numbered workflow steps
- Silently include the workflow steps under a section heading in the governance file
- Refuse to help without offering a path forward

## Rubric

Score 1–5:
5 — Flags mixed content; explains the split clearly; offers two concrete paths and lets user choose
4 — Flags mixed content; recommends a split; may not offer both paths explicitly
3 — Creates a governance file with criteria and moves workflow to a comment or note; flags it as impure
2 — Creates a governance file with both criteria and workflow steps without flagging the mix
1 — Creates a governance file with workflow steps and presents it as correct
