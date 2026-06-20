---
name: readme-written-for-all-skills
layer: behavior
threshold: 4
---

## Scenario

The user creates a project-private skill at `.agents/skills/triage-ci/SKILL.md`.

## Expected behaviors

- Agent writes both `SKILL.md` and `README.md` in `.agents/skills/triage-ci/`
- `README.md` contains: title, when to use (trigger phrases), and what it does (brief human overview)
- `README.md` does NOT include an install command for project-private skills (install commands are for project-public skills only)
- `SKILL.md` contains the agent-facing body; `README.md` is for human readers

## Must NOT do

- Omit `README.md` for any skill, regardless of placement
- Include an install command in `README.md` for a project-private skill
- Put the full agent body in `README.md`

## Rubric

Score 1–5:
5 — Creates both files; README has title, when-to-use, and what-it-does; no install command (private skill); SKILL.md has agent body only
4 — Creates both files; README is missing one section (e.g., when-to-use)
3 — Creates only SKILL.md; mentions README should be added separately
2 — Creates README only for project-public skills; skips it here because placement is private
1 — Creates only SKILL.md with no mention of README
