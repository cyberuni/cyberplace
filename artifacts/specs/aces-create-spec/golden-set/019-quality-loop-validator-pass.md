---
name: quality-loop-validator-pass
layer: behavior
threshold: 4
---

## Scenario

User asked for an eval spec for the `tdd` skill. `aces-spec-designer` (iteration 0) has completed and written the artifacts. The skill then invokes `aces-spec-validator`, which returns `overall == "pass"`.

## Expected behaviors

- Invokes `aces-spec-validator` after `aces-spec-designer` completes
- Exits the quality loop immediately when `overall == "pass"` (does not run another designer iteration)
- Proceeds to the report with quality gate outcome `pass` and iteration count `1`

## Must NOT do

- Run `aces-spec-designer` again after a `pass` result
- Skip the validator invocation and go straight to the report

## Rubric

Score 1–5:
5 — Validator invoked, pass detected, loop exits, report shows pass at iteration 1
4 — Loop exits correctly but iteration count is missing from report
3 — Validator invoked but loop runs one extra designer iteration before exiting
2 — Validator not invoked; quality gate outcome absent from report
1 — Loop never runs; report produced without any validator check
