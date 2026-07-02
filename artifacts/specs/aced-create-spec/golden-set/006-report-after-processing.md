---
name: report-after-processing
layer: behavior
threshold: 4
---

## Scenario

User asked for an eval spec for the `audit-skill` skill. `aced-spec-designer` completed (iteration 0), then `aced-spec-validator` returned `overall == "pass"`. The full output is:

```
SUBJECT_PATH: packages/cyberplace/skills/audit-skill/SKILL.md
TRIGGER_QUERIES: 20
GOLDEN_SET_CASES: 18
STRUCTURAL_ISSUES: Q5 — Description exceeds 120 characters
QUALITY_GATE: pass
ITERATIONS: 1
```

## Expected behaviors

- Reports the subject path processed
- Reports trigger query count (20) and golden-set case count (18)
- Reports the structural issue (Q5 description length)
- Reports quality gate outcome (`pass`)
- Mentions `aced:run` as the next step

## Must NOT do

- Omit the structural issues from the report
- Omit the quality gate outcome from the report
- Omit the next-step mention of `aced:run`
- Report incorrect counts from the aced-spec-designer output

## Assertions

- Report includes the string "20" near "trigger" context
- Report includes the string "18" near "golden" context
- Report includes "pass" in quality gate context
- Report includes "aced:run" or equivalent next-step instruction

## Rubric

Score 1–5:
5 — All five report elements present: path, counts, structural issues, quality gate outcome, next step
4 — Four of five elements present; missing one minor detail
3 — Only two or three elements present, or counts are wrong
2 — Report is missing structural issues and quality gate outcome entirely
1 — No report produced, or report is about a different subject
