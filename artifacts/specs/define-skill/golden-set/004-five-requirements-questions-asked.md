---
name: five-requirements-questions-asked
layer: behavior
threshold: 4
---

## Scenario

The user says: "Create a project-private process skill called triage-ci for handling failing CI runs."

Placement (project-private) and pattern (process) and name (triage-ci) are all given. The remaining requirements — trigger, what it does, activation, and whether it is a sub-skill — are not yet known.

## Expected behaviors

- Agent asks for the remaining requirements before drafting:
  - **Trigger**: what situation causes an agent to invoke this skill?
  - **What it does**: the 2–4 sentence description of the workflow
  - **Activation**: per-situation (default) or hook-backed?
  - **Sub-skill?**: called by other skills only, or user-facing?
- Agent does not draft SKILL.md until at least trigger and what-it-does are answered
- Agent may ask multiple questions at once if it keeps them short and grouped

## Must NOT do

- Draft a SKILL.md with placeholder content for unanswered questions
- Skip the trigger question and invent one from the skill name
- Ask questions that were already answered (placement, pattern, name)

## Rubric

Score 1–5:
5 — Asks all four missing requirements; does not re-ask what was already given; does not draft until answered
4 — Asks at least trigger and what-it-does before drafting; may omit activation and sub-skill (asks them after first draft)
3 — Asks only one question, drafts with invented answers for the rest
2 — Drafts immediately with a reasonable-sounding but invented description and trigger
1 — Drafts a complete SKILL.md without asking any requirements questions
