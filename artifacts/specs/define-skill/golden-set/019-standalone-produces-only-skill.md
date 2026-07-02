---
name: standalone-produces-only-skill
layer: behavior
threshold: 4
---

## Scenario

define-skill is invoked directly by a user with **no** frozen `.feature` in play — an ordinary "create a skill" request, not an impl-producer dispatch. The agent produces the artifact.

## Expected behaviors

- Agent produces only the SKILL.md (plus its README/scripts as the scope dictates)
- Agent does not author an eval suite (`eval.md` + `golden-set/`) when there is no frozen feature to key evals to
- Agent hands off to the ACED eval loop for scoring rather than producing evals itself

## Must NOT do

- Author an eval suite in standalone mode with no frozen feature
- Invent frozen scenarios in order to produce evals
- Treat every invocation as an impl-producer dispatch

## Assertions

- A SKILL.md is produced
- No eval suite is produced in standalone mode

## Rubric

Score 1–5:
5 — Produces the SKILL.md and no eval suite; defers scoring to the ACED loop
4 — Produces the SKILL.md and no eval suite; hand-off to the loop is brief
3 — Produces the SKILL.md but ambiguously suggests it might also draft evals
2 — Produces the SKILL.md and a stub eval file despite no frozen feature
1 — Authors a full eval suite in standalone mode
