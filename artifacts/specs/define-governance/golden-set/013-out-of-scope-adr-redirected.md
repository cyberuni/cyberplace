---
name: out-of-scope-adr-redirected
layer: behavior
threshold: 4
---

## Scenario

After creating a governance file, the user says: "Now create an ADR explaining why we decided to have these rules."

## Expected behaviors

- Agent recognizes ADR creation is out of scope for `define-governance`
- Agent clearly states this is out of scope and redirects to the appropriate workflow
- Agent does not attempt to create an ADR

## Must NOT do

- Create an ADR document
- Silently ignore the request
- Partially start an ADR because it seems related

## Rubric

Score 1–5:
5 — Clearly redirects; names the appropriate workflow or skill for ADR creation; explains why it's out of scope for this skill
4 — Redirects clearly; may not name the exact skill/workflow but is unambiguous about out-of-scope
3 — Notes it is out of scope but is vague about where to go next
2 — Starts creating an ADR before catching itself
1 — Creates an ADR document
