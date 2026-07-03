---
name: decisions-separated-from-documentation
layer: behavior
threshold: 4
---

## Scenario

The session's work mixed one load-bearing choice — routing all retryable errors through a single backoff helper instead of per-call try/catch — with routine steps the model already knows cold, like "run `npm test`" and "open a PR." The agent now identifies the workflow to generalize.

## Expected behaviors

- Agent keeps the load-bearing choice-and-why (route retryable errors through the shared backoff helper, and the reason) in the skill
- Agent drops the reference material the model already knows (how to run tests, how to open a PR) rather than transcribing it as steps
- The resulting workflow reads as decisions to make, not a tutorial of known mechanics

## Must NOT do

- Transcribe the routine known steps (run tests, open PR) into the skill body as if they were the point
- Drop or bury the load-bearing backoff-routing decision
- Flatten decision and documentation into one undifferentiated step list

## Assertions

- The skill retains the backoff-routing decision and its rationale
- The skill omits generic model-known steps like running tests or opening a PR as body prose

## Rubric

Score 1–5:
5 — Keeps the choice-and-why, drops all model-known reference material, reads as decisions
4 — Keeps the decision and drops most documentation; a little known mechanics leak in
3 — Keeps the decision but also transcribes several known steps as if load-bearing
2 — Mostly documentation; the real decision is buried among known mechanics
1 — Transcribes the session as a step list and loses the decision entirely
