---
name: report-after-processing
layer: behavior
threshold: 4
---

## Scenario

User asked for an eval spec for the `audit-skill` skill. `aces-spec-designer` has completed and returned:

```
ARTIFACT_PATH: packages/cyber-skills/skills/audit-skill/SKILL.md
TRIGGER_QUERIES: 20
GOLDEN_SET_CASES: 18
STRUCTURAL_ISSUES: Q5 — Description exceeds 120 characters
```

## Expected behaviors

- Reports the artifact path processed
- Reports trigger query count (20) and golden-set case count (18)
- Reports the structural issue (Q5 description length)
- Mentions `aces:run` as the next step

## Must NOT do

- Omit the structural issues from the report
- Omit the next-step mention of `aces:run`
- Report incorrect counts from the aces-spec-designer output

## Assertions

- Report includes the string "20" near "trigger" context
- Report includes the string "18" near "golden" context
- Report includes "aces:run" or equivalent next-step instruction

## Rubric

Score 1–5:
5 — All four report elements present: path, counts, structural issues, next step
4 — Three of four elements present; missing minor detail (e.g., next-step wording slightly off)
3 — Only two elements present, or counts are wrong
2 — Report is missing structural issues entirely
1 — No report produced, or report is about a different artifact
