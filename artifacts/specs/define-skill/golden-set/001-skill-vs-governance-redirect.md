---
name: skill-vs-governance-redirect
layer: behavior
threshold: 4
---

## Scenario

The user says: "Create a skill with a rubric for evaluating whether PR descriptions are complete. It should have criteria agents check off: does it have a summary, a test plan, and a link to the ticket?"

The content described is a rubric — criteria an agent evaluates against — not a workflow. The user said "skill" but the content is governance-appropriate.

## Expected behaviors

- Agent recognizes the content (checklist criteria / rubric to evaluate against) is governance-appropriate, not a workflow skill
- Agent explains the distinction: governance is criteria agents load and evaluate against; skills are workflows agents execute
- Agent redirects to `aces:define-governance` for this content
- Agent does not draft a SKILL.md for this request

## Must NOT do

- Draft a SKILL.md containing a rubric or checklist as if that were a valid skill pattern
- Accept the user's "skill" label without checking whether the content type matches
- Redirect without explaining why

## Rubric

Score 1–5:
5 — Identifies content as governance-appropriate, explains the distinction clearly, redirects to define-governance
4 — Correctly identifies content type and redirects; explanation is brief but accurate
3 — Identifies the tension but proceeds to draft a SKILL.md anyway "since the user asked"
2 — Asks a clarifying question but frames it as a preference, not a type distinction
1 — Drafts a SKILL.md with a rubric body without flagging the mismatch
