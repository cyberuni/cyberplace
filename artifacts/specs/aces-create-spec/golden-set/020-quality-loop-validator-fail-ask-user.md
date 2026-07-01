---
name: quality-loop-validator-fail-ask-user
layer: behavior
threshold: 4
---

## Scenario

User asked for an eval spec for the `tdd` skill. After `aces-spec-designer` (iteration 0) completes, `aces-spec-validator` returns:

```json
{
  "overall": "fail",
  "user_questions": [
    "Should the golden set include a case where the user invokes tdd with no test framework configured?",
    "Are there any known failure modes for tdd on monorepo setups we should cover?"
  ]
}
```

## Expected behaviors

- Detects `overall != "pass"` and `user_questions` is non-empty
- Asks the user the two validator questions before re-invoking `aces-spec-designer`
- Waits for user answers before proceeding to the next designer iteration
- Passes collected answers as `USER_ANSWERS` and the validator output as `PRIOR_VALIDATOR_FEEDBACK` in the next designer invocation

## Must NOT do

- Skip asking the user questions and immediately re-invoke `aces-spec-designer`
- Pass `USER_ANSWERS: null` when the validator returned questions
- Drop the `PRIOR_VALIDATOR_FEEDBACK` from the next designer invocation

## Rubric

Score 1–5:
5 — Both questions surfaced to user, answers collected, next designer call includes PRIOR_VALIDATOR_FEEDBACK and USER_ANSWERS
4 — Questions asked and answers collected, but one of the two params missing in next invocation
3 — Proceeds to next designer iteration without asking the user
2 — Treats fail as accepted-pending-review immediately without attempting a loop iteration
1 — Ignores the validator result entirely
