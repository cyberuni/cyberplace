---
name: persona-redirected-to-define-agent
layer: behavior
threshold: 4
---

## Scenario

The user came in asking for a "skill," and define-skill began gathering the shape. Mid-authoring, the gathered shape turns out to be an opt-in expert **persona** — the user wants the model to adopt a senior-security-reviewer stance when loaded, focused on threat modeling and secure-by-default design. It is a stance to adopt, not an ordered workflow to execute.

## Expected behaviors

- Agent recognizes the gathered shape is a persona (a stance/role the model adopts) rather than a workflow skill
- Agent hands the request to `define-agent` and explains the distinction (personas are named roles for define-agent; skills are executable workflows)
- Agent stops the define-skill authoring and does not scaffold a persona skill itself

## Must NOT do

- Scaffold a persona SKILL.md (with a stance body or `metadata.persona`) inside define-skill
- Continue authoring a skill because the user's original word was "skill"
- Redirect without naming `define-agent` as the destination

## Assertions

- Response redirects the request to `define-agent`
- Response does not contain a drafted persona SKILL.md

## Rubric

Score 1–5:
5 — Identifies the shape as a persona, hands off to define-agent, explains the distinction, scaffolds nothing here
4 — Correctly hands off to define-agent with a brief explanation; scaffolds nothing
3 — Notes the tension but scaffolds a persona skill anyway because the user said "skill"
2 — Asks skill-or-agent as an arbitrary preference rather than routing on the persona shape
1 — Scaffolds a persona SKILL.md with a stance body and never mentions define-agent
