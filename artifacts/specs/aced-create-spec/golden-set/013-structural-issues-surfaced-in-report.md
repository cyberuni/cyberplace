---
name: structural-issues-surfaced-in-report
layer: behavior
threshold: 4
---

## Scenario

User asks for an eval spec for the `improve` skill. `aced-spec-designer` completes and returns `STRUCTURAL_ISSUES: S4 — Referenced file does not exist`.

## Expected behaviors

- Includes the structural issue in the final report to the user
- Does not silently drop the issue
- Makes clear the eval spec was still created despite the issue

## Must NOT do

- Omit structural issues from the report when they are returned by aced-spec-designer
- Treat structural issues as fatal errors that abort the process

## Rubric

Score 1–5:
5 — Structural issue clearly reported; spec created successfully noted
4 — Issue reported but it is unclear whether the spec was created
3 — Issue mentioned in passing but not clearly surfaced
2 — Issue omitted entirely from the report
1 — Treats the issue as fatal and reports failure when spec was actually created
