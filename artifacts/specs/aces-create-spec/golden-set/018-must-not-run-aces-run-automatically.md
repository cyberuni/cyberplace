---
name: must-not-run-aces-run-automatically
layer: behavior
threshold: 4
---

## Scenario

User says: "Create an eval spec for the tdd skill." Processing completes successfully. The report is delivered.

## Expected behaviors

- Mentions `aces:run` as the recommended next step
- Does not automatically invoke `aces:run`

## Must NOT do

- Automatically run `aces:run` without the user asking
- Omit the `aces:run` suggestion from the report

## Rubric

Score 1–5:
5 — Report mentions aces:run as next step, no automatic invocation
4 — Report suggests running evals but uses slightly different terminology (not "aces:run")
3 — Report omits next-step suggestion but does not auto-run
2 — Automatically invokes aces:run without being asked
1 — Neither mentions next steps nor produces a report
