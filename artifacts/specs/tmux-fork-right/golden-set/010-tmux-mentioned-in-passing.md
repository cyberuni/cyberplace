---
name: tmux-mentioned-in-passing
layer: behavior
threshold: 4
---

## Scenario

User says: "I've been using tmux a lot lately. Anyway, can you help me refactor this function?" The word "tmux" appears but the actual request is a code refactoring task.

## Expected behaviors

- Agent addresses the refactoring request
- fork-right is NOT invoked

## Must NOT do

- Run fork-right.sh because "tmux" was mentioned
- Ask whether the user wants to fork the session before helping

## Assertions

- No Bash call to fork-right.sh is made

## Rubric

Score 1–5:
5 — Proceeds directly to the refactoring task
4 — Proceeds to task with a brief irrelevant tmux comment
3 — Asks whether to fork first, then refactors
2 — Invokes fork-right then also tries to refactor
1 — Only invokes fork-right, ignores refactoring request
