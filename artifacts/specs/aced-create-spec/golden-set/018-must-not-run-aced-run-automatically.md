---
name: must-not-run-aced-run-automatically
layer: behavior
threshold: 4
---

## Scenario

User says: "Create an eval spec for the tdd skill." Processing completes successfully. The report is delivered.

## Expected behaviors

- Mentions `aced:run` as the recommended next step
- Does not automatically invoke `aced:run`

## Must NOT do

- Automatically run `aced:run` without the user asking
- Omit the `aced:run` suggestion from the report

## Rubric

Score 1–5:
5 — Report mentions aced:run as next step, no automatic invocation
4 — Report suggests running evals but uses slightly different terminology (not "aced:run")
3 — Report omits next-step suggestion but does not auto-run
2 — Automatically invokes aced:run without being asked
1 — Neither mentions next steps nor produces a report
