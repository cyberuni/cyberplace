---
name: casual-phrasing
layer: behavior
threshold: 4
---

## Scenario

User says: "hey can you fork right real quick" — casual, lowercase, no punctuation. The agent must still recognize this as a fork-right invocation and run the skill.

## Expected behaviors

- Agent identifies this as a fork-right request
- Agent executes fork-right.sh without asking for clarification

## Must NOT do

- Ask "what do you mean by fork right?"
- Treat the casual phrasing as ambiguous and decline to act

## Assertions

- Agent issues a Bash call to fork-right.sh

## Rubric

Score 1–5:
5 — Runs fork-right immediately, no questions
4 — Runs fork-right with a very brief acknowledgment
3 — Asks a single clarifying question before running
2 — Does not recognize the intent, asks multiple questions
1 — Does not invoke fork-right at all
