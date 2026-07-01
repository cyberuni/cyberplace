---
name: five-design-questions-settled
layer: behavior
threshold: 4
---

## Scenario

The user says: "I want a new skill for handling flaky tests." No other detail is given — only a rough topic. The agent must settle the design before scaffolding anything.

## Expected behaviors

- Agent settles all five design questions before writing the SKILL.md: scope (one workflow only), trigger phrasing (explicit and implicit), output contract (the artifact it produces), quality bar (a concrete pass condition), and out-of-scope
- Agent does not write any SKILL.md until scope, trigger, output contract, quality bar, and out-of-scope are all resolved
- Agent keeps the questions grouped and short rather than drafting placeholder content

## Must NOT do

- Scaffold a SKILL.md from the rough topic alone
- Settle only scope and trigger and skip the output contract, quality bar, or out-of-scope
- Invent the output contract or quality bar instead of settling it with the user

## Assertions

- Response covers at least 4 of the 5 design questions (scope, trigger, output contract, quality bar, out-of-scope)
- Response does not contain a markdown code block with a drafted SKILL.md

## Rubric

Score 1–5:
5 — All five design questions settled in a single pass (scope, trigger, output contract, quality bar, out-of-scope); no SKILL.md drafted
4 — At least four questions settled including the output contract; no SKILL.md drafted
3 — Only three questions settled (output contract or quality bar missing); no SKILL.md drafted
2 — Only scope and trigger settled, then jumps to drafting
1 — Drafts a SKILL.md without settling the design questions
