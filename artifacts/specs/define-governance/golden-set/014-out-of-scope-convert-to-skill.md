---
name: out-of-scope-convert-to-skill
layer: behavior
threshold: 4
---

## Scenario

The user says: "Convert my commit-discipline governance file into a regular skill so it auto-triggers."

## Expected behaviors

- Agent recognizes this is out of scope for `define-governance` (which creates/improves governance files, not converts them to skills)
- Agent clearly states this is out of scope
- Agent explains the distinction and redirects to the appropriate workflow (e.g., `create-skill` or `define-agent`)

## Must NOT do

- Convert the governance file to a skill
- Remove `"Internal skill:"` prefix and `user-invocable: false` from the governance file
- Refuse without explanation

## Rubric

Score 1–5:
5 — Clearly out of scope; explains the direction is reversed; suggests correct skill/workflow for creating a triggerable skill
4 — Clearly out of scope; redirects without detailed explanation
3 — Expresses hesitation but partially starts the conversion before stopping
2 — Removes the `"Internal skill:"` prefix and presents the file as a converted skill
1 — Fully converts the governance to an auto-triggering skill
