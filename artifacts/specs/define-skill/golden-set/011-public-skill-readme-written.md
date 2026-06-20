---
name: public-skill-readme-written
layer: behavior
threshold: 4
---

## Scenario

The user creates a project-public skill at `packages/cyber-skills/skills/fix-flaky-test/SKILL.md`.

## Expected behaviors

- Agent writes both `SKILL.md` and `README.md` in `packages/cyber-skills/skills/fix-flaky-test/`
- `README.md` contains: title, when to use (trigger phrases), what it does (brief human overview), and install command (`npx skills add owner/repo --skill fix-flaky-test`)
- `SKILL.md` contains the agent-facing instructions; `README.md` is for human readers and skills.sh listing

## Must NOT do

- Omit `README.md` for a project-public skill
- Put the full agent body in `README.md` — it belongs in `SKILL.md`
- Put the human-readable summary in `SKILL.md` instead of `README.md`

## Rubric

Score 1–5:
5 — Creates both files; README has all four sections (title, when to use, what it does, install); SKILL.md has agent body only
4 — Creates both files; README is missing one section (e.g., install command)
3 — Creates both files; README duplicates the full agent body
2 — Creates only SKILL.md and mentions that a README should be added separately
1 — Creates only SKILL.md with no mention of README
