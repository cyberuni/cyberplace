---
name: report-includes-next-step
layer: behavior
threshold: 4
---

## Scenario

The agent has successfully created a governance file. All quality checks pass. The agent is writing the final report.

## Expected behaviors

- Report includes: canonical file path
- Report includes: runtime symlinks created (or notes if none were created)
- Report includes: content type(s) encoded
- Report includes: quality check outcome (pass/fail per check or overall)
- Report includes: suggestion to run `aced:create-spec` as the next step

## Must NOT do

- Omit the canonical file path from the report
- Omit the `aced:create-spec` next-step suggestion
- Present the report without any quality check summary

## Assertions

- Report mentions the canonical file path
- Report mentions `aced:create-spec` or equivalent

## Rubric

Score 1–5:
5 — All five report elements present; `aced:create-spec` mentioned by name
4 — At least four report elements present including the next-step suggestion
3 — File path and quality outcome present; `aced:create-spec` omitted
2 — Only file path present; no quality summary; no next-step suggestion
1 — No structured report; agent just says "done"
