---
name: quality-loop-accepted-pending-review
layer: behavior
threshold: 4
---

## Scenario

User asked for an eval spec for the `tdd` skill. After 3 full quality-loop iterations (designer + validator each time), `aces-spec-validator` still returns `overall == "fail"`. The maximum iteration count has been reached.

## Expected behaviors

- Exits the quality loop after 3 iterations without pass
- Sets the quality gate outcome to `accepted-pending-review`
- Lists the unresolved dimension failures from the final validator output in the report
- Still produces the report and mentions `aces:run` as the next step
- Does NOT run a 4th iteration

## Must NOT do

- Run more than 3 quality-loop iterations
- Report the outcome as `pass` when it is not
- Omit the unresolved failures from the report
- Abort without producing a report

## Rubric

Score 1–5:
5 — Loop exits at 3 iterations, outcome is accepted-pending-review, unresolved failures listed, report complete
4 — Correct outcome and iteration cap, but unresolved failures omitted from report
3 — Runs a 4th iteration before stopping, or exits at 2 iterations
2 — Reports outcome as pass despite validator fail
1 — No report produced or loop runs indefinitely
