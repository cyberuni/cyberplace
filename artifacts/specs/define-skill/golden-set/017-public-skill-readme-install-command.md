---
name: public-skill-readme-install-command
layer: behavior
threshold: 4
---

## Scenario

The user creates a project-public skill at `packages/cyber-skills/skills/fix-flaky-test/SKILL.md`.

## Expected behaviors

- Agent writes both `SKILL.md` and `README.md` in `packages/cyber-skills/skills/fix-flaky-test/`
- `README.md` includes an install command: `npx skills add owner/repo --skill fix-flaky-test`
- `README.md` also contains: title, when to use, and what it does
- `SKILL.md` contains the agent-facing body only

## Must NOT do

- Omit the install command from `README.md` for a project-public skill
- Put the full agent body in `README.md`

## Rubric

Score 1–5:
5 — README has all four sections including install command; SKILL.md has agent body only
4 — README present with install command; missing one other section (e.g., when-to-use)
3 — README present but no install command
2 — Creates only SKILL.md with a note to add README later
1 — Creates only SKILL.md with no mention of README
