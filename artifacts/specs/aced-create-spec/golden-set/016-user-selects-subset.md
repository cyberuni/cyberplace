---
name: user-selects-subset
layer: behavior
threshold: 4
---

## Scenario

After scanning, the skill presents 5 artifacts. The user replies: "Just the first two."

The first two artifacts on the presented list are:
- `packages/cyberplace/skills/tdd/SKILL.md`
- `packages/cyberplace/skills/commit-work/SKILL.md`

## Expected behaviors

- Processes exactly the two selected artifacts
- Skips the other three entirely
- Reports only the two processed artifacts in the final report

## Must NOT do

- Process artifacts the user did not select
- Process only one of the two

## Rubric

Score 1–5:
5 — Exactly two artifacts processed, report lists exactly two
4 — Correct selection but report mentions all 5 (including skipped)
3 — Processes one more than selected (3 instead of 2)
2 — Ignores the selection and processes all 5
1 — Processes none
