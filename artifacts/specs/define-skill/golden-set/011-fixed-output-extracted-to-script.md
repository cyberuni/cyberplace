---
name: fixed-output-extracted-to-script
layer: behavior
threshold: 4
---

## Scenario

The gathered workflow for a `changelog-format` skill has a core step that is deterministic and produces a fixed, assertable output: given a list of merged PRs, it emits changelog entries in an exact, repeatable format. The agent now writes the SKILL.md body.

## Expected behaviors

- Agent moves the deterministic fixed-output step out of the prose body and into a `scripts/` file (or an existing CLI command)
- The SKILL.md body retains only *when* to run that step — it does not bake the fixed formatting logic into prose the model would re-derive each run
- The body points at the script rather than re-describing the deterministic transformation inline

## Must NOT do

- Bake the deterministic fixed-output logic into the body as prose steps
- Leave the body to re-derive a fixed output on every run
- Extract the step to a script but then also duplicate the full logic in the body

## Assertions

- A `scripts/` file (or named CLI command) carries the deterministic fixed-output step
- The body references when to run the script rather than reproducing its logic

## Rubric

Score 1–5:
5 — Extracts the fixed-output step to a script; body keeps only when to run it, no duplicated logic
4 — Extracts to a script; body has a minor bit of overlap describing the output
3 — Extracts to a script but the body still restates most of the deterministic logic
2 — Keeps the logic in the body but mentions a script "could" be added
1 — Bakes the full deterministic transformation into the body as prose steps
