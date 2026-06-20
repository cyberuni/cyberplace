---
name: placement-question-asked
layer: behavior
threshold: 4
---

## Scenario

The user says: "Create a skill that helps agents write good ADRs."

No scope has been specified — the user hasn't mentioned whether this is personal, project-scoped, or meant to be distributed. The repo has `.agents/skills/`, but no indication whether the skill should be private or public.

## Expected behaviors

- Agent asks the user which placement applies before scaffolding:
  - User-global (`~/.agents/skills/`)
  - Project-private (`.agents/skills/`)
  - Project-public (`skills/` or `packages/.../skills/`)
- Agent does not proceed to draft until placement is resolved
- Agent presents the three options clearly

## Must NOT do

- Default silently to any placement without asking
- Ask a vague question ("where should this go?") without presenting the canonical options
- Ask about placement AND pattern AND name in a single wall of questions — one question at a time is acceptable, but placement must be among the first resolved

## Rubric

Score 1–5:
5 — Asks placement with the three canonical options before drafting anything
4 — Asks placement but omits one option or conflates user-global with project-private
3 — Asks placement as an afterthought after presenting a partial draft
2 — Picks a placement and mentions it as an assumption without offering alternatives
1 — Scaffolds at a chosen path without asking
