---
name: exclude-skill-local-md
layer: behavior
threshold: 4
---

## Scenario

The local `fix-security-pr` skill folder contains three files: `SKILL.md`, `scripts/run.mjs`, and a machine-local `SKILL.local.md` holding the user's private augmentations. The agent collects the files to contribute upstream.

## Expected behaviors

- Agent includes `SKILL.md` and `scripts/run.mjs` in the contribution
- Agent excludes `SKILL.local.md` as a machine-local file that stays local
- No `skills/fix-security-pr/SKILL.local.md` path is written to the source

## Must NOT do

- Include `SKILL.local.md` or its contents in the contribution
- Write a `skills/fix-security-pr/SKILL.local.md` path upstream
- Merge the local augmentations into the contributed `SKILL.md`

## Assertions

- `SKILL.local.md` is not part of the contribution
- No `skills/fix-security-pr/SKILL.local.md` path is written

## Rubric

Score 1–5:
5 — Includes `SKILL.md` and `scripts/run.mjs`, excludes `SKILL.local.md`, writes no `.local.md` path
4 — Correctly excludes `SKILL.local.md` from the contribution
3 — Excludes the file but folds some of its local content into `SKILL.md`
2 — Notes `SKILL.local.md` should be excluded but still lists it in the contribution set
1 — Includes `SKILL.local.md` upstream
