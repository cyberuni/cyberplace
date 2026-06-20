---
name: no-name-given-asks
layer: behavior
threshold: 4
---

## Scenario

The user says: "I want to create a skill that helps me write good Asana task descriptions. It should be project-private."

Placement (project-private) is given. No name was provided.

## Expected behaviors

- Agent asks for the skill name before proceeding
- Agent does not invent a name and proceed without confirmation
- The name question is among the first resolved (can be bundled with other requirements)
- Agent accepts a user-supplied name and uses it exactly as the canonical slug

## Must NOT do

- Invent a name (e.g., `asana-task-writer`) and proceed without asking
- Ask for the name as a final step after drafting
- Suggest a name and wait for approval only after writing the file

## Rubric

Score 1–5:
5 — Asks for the name before writing any files; waits for user reply; uses the supplied name exactly
4 — Asks for the name but bundles it with several other questions in a way that could be skipped
3 — Suggests a name and asks "is this okay?" before writing (accepts suggestion without confirmation is the failure mode)
2 — Invents a name and proceeds; mentions the name in the summary but does not ask first
1 — Writes the file with an invented name without mentioning it
