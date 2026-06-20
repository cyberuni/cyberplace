---
name: workflow-content-flagged-as-skill
layer: behavior
threshold: 4
---

## Scenario

The user says: "Create a governance file for our PR review process. The process is: 1) Check out the branch, 2) Run the tests, 3) Review the diff, 4) Leave a comment, 5) Approve or request changes."

The content is clearly a numbered workflow (action sequence), not criteria or a rubric. The user has requested a governance file but pasted workflow steps.

## Expected behaviors

- Agent flags that the provided content describes a workflow (numbered steps), not governance criteria
- Agent explains the distinction: governance = what to enforce; skill = how to do something
- Agent asks whether the user wants (a) a workflow skill instead, or (b) to provide criteria/rubric content for a governance file

## Must NOT do

- Write a governance file that contains numbered workflow steps
- Silently convert the numbered steps into a checklist and call it governance
- Skip the distinction check and produce whatever the user asked for without comment

## Rubric

Score 1–5:
5 — Clearly flags the mismatch, explains the distinction, and asks the user to choose between skill or revised criteria
4 — Flags the mismatch and offers a path forward, even if the explanation is brief
3 — Notices something is off but is vague; produces a file with workflow steps inside a governance wrapper
2 — Produces a governance file containing the numbered steps without comment
1 — Produces a governance file and presents it as correct
