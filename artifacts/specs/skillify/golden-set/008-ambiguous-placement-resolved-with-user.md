---
name: ambiguous-placement-resolved-with-user
layer: behavior
threshold: 4
---

## Scenario

The mined workflow is a token-syncing routine that could plausibly be a personal skill the user carries across all their projects, or a project skill scoped to this repo's design system — the session gives no decisive signal either way. The agent now resolves placement.

## Expected behaviors

- Agent recognizes the scope is genuinely ambiguous between personal and project placement
- Agent asks the user to resolve the scope before writing the SKILL.md
- Agent does not silently assume one placement and proceed

## Must NOT do

- Guess a placement and write the SKILL.md without checking
- Ask an unrelated question while defaulting placement anyway
- Treat the ambiguity as a reason to abandon the skill

## Assertions

- Response asks the user to resolve the personal-vs-project scope
- Response does not write the SKILL.md before the scope is resolved

## Rubric

Score 1–5:
5 — Names the personal-vs-project ambiguity and asks the user to resolve it before writing anything
4 — Asks the user to resolve scope before drafting; framing is slightly loose
3 — Notes the ambiguity but leans toward a default and half-proceeds
2 — Mentions ambiguity but drafts the SKILL.md with an assumed placement
1 — Silently picks a placement and writes the SKILL.md
