---
name: no-name-given-with-pasted-doc
layer: behavior
threshold: 4
---

## Scenario

The user pastes a long document with 12 quality criteria for evaluating API designs and says: "Make this a governance file." No name is given. The document contains clear criteria (what to enforce), not workflow steps.

## Expected behaviors

- Agent recognizes the content is governance-appropriate (criteria/rubric)
- Agent asks for a name (kebab-case slug) before proceeding — it cannot derive the canonical path without one
- Agent asks about placement if not clear from context
- Agent does not invent a name without telling the user

## Must NOT do

- Invent a name (e.g., `api-design-governance`) and proceed without asking
- Refuse to proceed because no name was given — instead, ask for it
- Re-ask for the criteria the user already pasted

## Rubric

Score 1–5:
5 — Asks for name (and placement if ambiguous); uses pasted content as the criteria; no re-asking for content
4 — Asks for name; may ask one clarifying question about the content; does not re-ask for the full criteria
3 — Invents a name but asks the user to confirm before proceeding
2 — Invents a name and proceeds without asking the user
1 — Asks the user to provide all five pieces of information including the criteria they already pasted
