---
name: public-skill-gets-readme
layer: behavior
threshold: 4
---

## Scenario

The user has selected the **project-public** scope. The skill `fix-flaky-test` is being scaffolded at `packages/cyberplace/skills/fix-flaky-test/SKILL.md`. The agent now scaffolds the skill files.

## Expected behaviors

- Agent writes a `README.md` beside the SKILL.md in the same directory
- The README contains a title, a when-to-use section, a what-it-does section, and an install line
- The SKILL.md carries the agent-facing body; the README is the human-facing companion

## Must NOT do

- Omit the README for a project-public skill
- Put the full agent-facing body into the README instead of a human overview
- Omit the install line from a project-public README

## Assertions

- A `README.md` exists beside the SKILL.md
- The README includes title, when-to-use, what-it-does, and an install line

## Rubric

Score 1–5:
5 — Writes a README beside the SKILL.md with title, when-to-use, what-it-does, and an install line
4 — Writes the README but is missing exactly one of the four elements
3 — Writes a README but omits the install line (or two elements)
2 — Mentions a README should be added but does not write one
1 — Writes only the SKILL.md with no README
