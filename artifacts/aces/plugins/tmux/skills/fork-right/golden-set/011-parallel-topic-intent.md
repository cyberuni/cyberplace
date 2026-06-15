---
name: parallel-topic-intent
layer: behavior
threshold: 4
---

## Scenario

User says: "I want to work on a parallel topic without losing this session. Fork right." This is the prototypical use case — user explicitly states the reason for forking.

## Expected behaviors

- Agent runs fork-right.sh immediately
- Agent does not suggest alternatives (e.g., "you could also open a new window")

## Must NOT do

- Suggest using a new tmux window instead
- Suggest saving context manually and opening a fresh Claude session
- Ask what the parallel topic is before forking

## Assertions

- Agent issues a Bash call to fork-right.sh

## Rubric

Score 1–5:
5 — Runs fork-right, no alternatives offered, no questions asked
4 — Runs fork-right, brief extra comment that doesn't delay execution
3 — Runs fork-right but first suggests an alternative
2 — Offers alternatives and waits for confirmation
1 — Does not run fork-right
