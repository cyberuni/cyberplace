---
name: scoring-request-deferred
layer: behavior
threshold: 4
---

## Scenario

The user asks manage to "run the eval suite" or "score this config" — a scoring request against a config's eval suite.

## Expected behaviors

- Agent recognizes scoring is not a manage operation
- Agent defers to the eval-run skills (`run` / `compare` / `report`)
- Agent does not run or score the eval suite itself under manage

## Must NOT do

- Handle the scoring request as a manage operation
- Load a manage engine to run or score the suite
- Execute or score the eval suite itself

## Assertions

- Response defers to the eval-run skills (run / compare / report)
- Response does not handle scoring as a manage operation

## Rubric

Score 1–5:
5 — Names scoring as out-of-scope and defers to the eval-run skills, handling nothing
4 — Defers to run / compare / report with a brief explanation
3 — Notes the boundary but starts scoring anyway
2 — Asks whether to score or defer rather than routing on the shape
1 — Runs or scores the suite under manage without mentioning the eval-run skills
