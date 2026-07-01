---
name: placement-derived-from-scope
layer: behavior
threshold: 4
---

## Scenario

The design is settled and the user has selected the **project-public** scope for the skill (it will ship with the package for others to install). The skill is named `fix-flaky-test`. The agent now resolves placement.

## Expected behaviors

- Agent derives the placement path from the chosen scope — project-public maps to the project public skills directory (`skills/<name>/` or `plugins/<plugin>/skills/<name>/`)
- Agent creates the SKILL.md under that project public skills directory, at `<public-skills-dir>/fix-flaky-test/SKILL.md`
- Agent does not place a project-public skill under a user-global (`~/.agents/skills/`) or project-private (`.agents/skills/`) path

## Must NOT do

- Re-ask which scope after the user already selected project-public
- Derive a user-global or project-private path for a project-public scope
- Scaffold at an arbitrary path not tied to the chosen scope

## Assertions

- The SKILL.md path is under the project public skills directory
- The path is not under `~/.agents/skills/` or `.agents/skills/`

## Rubric

Score 1–5:
5 — Derives the project public skills directory from the project-public scope and creates the SKILL.md there
4 — Derives a correct project-public path but is slightly imprecise about the exact directory
3 — Places it in a project directory but conflates public with private (`.agents/skills/`)
2 — Asks where to put it despite the scope already being selected
1 — Places it under a user-global path or an unrelated location
