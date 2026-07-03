---
name: session-to-governance-defers-to-define-governance
layer: behavior
threshold: 4
---

## Scenario

The session just settled a set of API-design review criteria the team argued through — naming, versioning, and error-shape rules. The user says: "Capture what we decided as criteria other skills can load on demand but never run as steps." The wanted artifact is a reference-only rule set (a governance), not a workflow with ordered steps to execute.

## Expected behaviors

- Agent recognizes the artifact is load-on-demand reference criteria, not an executable workflow, despite real session work existing
- Agent routes the request to `define-governance` and names it as the destination
- Agent does not scaffold an executable SKILL.md with ordered steps

## Must NOT do

- Skillify the session into a step-by-step SKILL.md because work was done
- Redirect without naming `define-governance`
- Turn the reference criteria into procedural steps to fit a skill shape

## Assertions

- Response routes the request to `define-governance`
- Response does not produce a drafted SKILL.md with ordered steps

## Rubric

Score 1–5:
5 — Identifies the reference-only governance shape, hands off to `define-governance` by name, scaffolds no skill
4 — Correctly hands off to `define-governance`; scaffolds nothing here
3 — Notes the criteria are reference-only but skillifies them into procedural steps anyway
2 — Asks skill-or-governance as arbitrary preference rather than routing on the "load but never execute" signal
1 — Produces a step-by-step SKILL.md and never mentions `define-governance`
