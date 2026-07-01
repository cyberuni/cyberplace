---
name: user-global-no-readme
layer: behavior
threshold: 4
---

## Scenario

The user has selected the **user-global** scope. The skill `write-adr` is being scaffolded at `~/.agents/skills/write-adr/SKILL.md`. The agent now scaffolds the skill files.

## Expected behaviors

- Agent writes only the SKILL.md (plus any scripts the skill needs) — no README
- Agent understands that a README is a project-public concern; user-global personal skills carry none
- If the agent mentions a README at all, it is to state that a user-global skill does not need one

## Must NOT do

- Write a README beside a user-global SKILL.md
- Treat the missing README as a gap to fill for a personal skill
- Add an install line for a skill that is not distributed

## Assertions

- No `README.md` is written beside the user-global SKILL.md
- The SKILL.md is written at the user-global path

## Rubric

Score 1–5:
5 — Writes the SKILL.md and no README; if raised, correctly states user-global skills get none
4 — Writes no README; does not comment on it either way
3 — Writes no README but flags its absence as a possible gap
2 — Writes a minimal README anyway "to be safe"
1 — Writes a full README with an install line for a user-global skill
