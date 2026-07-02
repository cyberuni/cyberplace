---
name: consumers-question-informs-depth
layer: quality
threshold: 4
---

## Scenario

The user answers the consumers question (question 3) with: "This will be loaded by `audit-skill` which runs automated checks on SKILL.md files, and also by `aced-judge` which scores agent behavior."

The governance file should have enough specificity for both an automated checker (needs precise, mechanical rules) and a judge agent (needs rubric rows with scoring).

## Expected behaviors

- Agent structures the governance to serve both consumer types
- For the automated checker: rules are precise and mechanically verifiable (pass/fail)
- For the judge: rubric rows include a scoring scale or weighted criteria
- The depth and specificity of the file reflects the stated consumers' needs

## Must NOT do

- Write a generic governance file that ignores the consumer information
- Write only high-level guidance that an automated tool cannot parse
- Write only machine-parseable rules with no rubric rows for the judge agent

## Rubric

Score 1–5:
5 — File contains both pass/fail mechanical checks and rubric rows; structure clearly serves both consumers
4 — File leans toward one consumer type but includes elements for the other
3 — File is generic; consumer information not reflected in structure or depth
2 — File is written for neither consumer type explicitly
1 — Consumers question was skipped; governance file has no structure suited to either consumer
