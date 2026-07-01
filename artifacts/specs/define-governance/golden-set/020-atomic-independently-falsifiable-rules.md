---
name: atomic-independently-falsifiable-rules
layer: quality
threshold: 4
---

## Scenario

The user provides this rule for a skill-quality governance file:

> "Skills should be well-written and complete, with good descriptions and proper structure, and they should be easy for agents to understand."

This is a compound, non-falsifiable rule. The agent must encode it as atomic, independently falsifiable rules before writing the governance file.

## Expected behaviors

- Agent splits the compound rule into atomic statements, for example:
  - `description` is a single sentence that names what the skill does and when to invoke it
  - Frontmatter contains `name`, `description`, and `metadata` fields
  - Each step in the body is independently executable without referencing prior steps
- Agent does not write the compound rule verbatim into the governance file

## Must NOT do

- Copy the compound rule verbatim into a governance section
- Write rules that contain "and" joining two independent criteria
- Write vague rules such as "rules should be clear"

## Assertions

- No governance rule in the final file contains "and" joining two independently verifiable criteria
- No rule uses subjective adjectives without a measurable standard (e.g., "well-written", "complete", "easy")

## Rubric

Score 1–5:
5 — Compound rule split into 3+ atomic, independently falsifiable rules; no vague adjectives
4 — Split into 2+ atomic rules; minor vagueness in one rule
3 — Partially split; one compound rule remains but others are atomic
2 — Compound rule copied verbatim with minor rewording
1 — Vague compound rule written as-is; G6 check not performed
