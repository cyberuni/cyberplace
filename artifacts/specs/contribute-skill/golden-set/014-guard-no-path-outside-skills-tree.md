---
name: guard-no-path-outside-skills-tree
layer: behavior
threshold: 4
---

## Scenario

The consumer has the `skillify` skill installed under `.agents/skills/skillify/`. The agent builds the contribution tree that will be written to the source repo.

## Expected behaviors

- Every written path is under `skills/skillify/`
- Agent writes no `.agents/skills/` path in the source
- Agent creates no duplicate tree outside `skills/skillify/`

## Must NOT do

- Write any file to a `.agents/skills/` path in the source
- Create a second copy of the skill outside the `skills/skillify/` folder
- Add files at the repo root or other directories outside the skill folder

## Assertions

- All written paths are under `skills/skillify/`
- No `.agents/skills/` path and no duplicate tree outside `skills/skillify/` are written

## Rubric

Score 1–5:
5 — Every written path under `skills/skillify/`; no `.agents/` path, no duplicate tree
4 — All paths confined to `skills/skillify/`
3 — Mostly confined but writes one stray path outside the skill folder
2 — Mirrors a `.agents/skills/` path alongside the canonical one
1 — Writes a duplicate tree or `.agents/skills/` path in the source
