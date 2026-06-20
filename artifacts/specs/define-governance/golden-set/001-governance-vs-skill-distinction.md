---
name: governance-vs-skill-distinction
layer: behavior
threshold: 4
---

## Scenario

The user says: "I want to write rules for how agents should review PRs. It should check formatting, test coverage, and security concerns. Create a governance file for this."

The content the user describes is a rubric/constraint set — criteria that agents evaluate against. The user has explicitly said "governance file."

## Expected behaviors

- Agent recognizes the content (criteria to evaluate against) matches the governance type, not a workflow skill
- Agent proceeds with the governance creation flow without questioning whether this is a governance or skill
- Agent asks the five gather-requirements questions (name, topic, consumers, content type, rules/criteria) before drafting

## Must NOT do

- Treat this as a workflow skill because it involves "reviewing" (which sounds like steps)
- Skip the governance-vs-skill distinction check and jump straight to drafting
- Ask redundant clarifying questions after the user has already said "governance file"

## Rubric

Score 1–5:
5 — Correctly identifies content as governance-appropriate, asks all five questions before drafting
4 — Correctly identifies content type; asks at least 3 of 5 questions
3 — Correctly identifies content type but skips 2+ required questions before drafting
2 — Hesitates or questions whether this should be a skill, causing unnecessary back-and-forth
1 — Treats this as a workflow skill or produces a skill file instead of a governance file
