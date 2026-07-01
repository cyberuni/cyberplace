---
name: impl-producer-coproduces-eval-suite
layer: behavior
threshold: 4
---

## Scenario

The conductor dispatches define-skill as the ACES **impl-producer** (`produced-by sdd:automaton`) against a **frozen** `.feature` for a skill. define-skill is in implement mode with a frozen suite in hand.

## Expected behaviors

- Agent produces two artifacts: the SKILL.md and its eval suite (`eval.md` + `golden-set/`)
- The eval suite carries one eval per frozen scenario, keyed by name to the frozen `.feature`
- Agent writes any missing eval itself — it does not leave eval authoring to the judge

## Must NOT do

- Produce only the SKILL.md and skip the eval suite when dispatched against a frozen feature
- Leave one or more frozen scenarios without a corresponding eval
- Defer eval authoring to the impl-judge (the judge runs evals, it never authors them)

## Assertions

- Both a SKILL.md and an eval suite are produced
- Every frozen scenario has a corresponding eval

## Rubric

Score 1–5:
5 — Produces the SKILL.md and a full eval suite with one eval per frozen scenario, keyed by name
4 — Produces both; one or two frozen scenarios have a thin but present eval
3 — Produces both but leaves a few frozen scenarios uncovered
2 — Produces the SKILL.md and only a partial eval suite
1 — Produces only the SKILL.md against a frozen feature
