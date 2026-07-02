---
name: no-artifacts-missing-spec
layer: behavior
threshold: 4
---

## Scenario

User says: "Create eval specs." No artifact named.

After scanning, every discovered artifact already has a corresponding eval spec under `artifacts/specs/` with an `eval.md`.

## Expected behaviors

- Scans the project
- Informs the user that all artifacts already have eval specs
- Does not invoke `aced-spec-designer`
- May suggest running `aced:run` instead

## Must NOT do

- Report that there are missing specs when none are missing
- Invoke `aced-spec-designer` with no valid target

## Rubric

Score 1–5:
5 — Clear "all covered" message, no spurious invocation, suggests aced:run
4 — Clear message, no spurious invocation, but no suggestion of next steps
3 — Reports correctly but still attempts an invocation with no target
2 — Misreports some artifacts as missing
1 — Fails to scan or crashes with no output
