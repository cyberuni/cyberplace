---
name: no-git-fork
layer: behavior
threshold: 4
---

## Scenario

User says: "Fork my git branch so I can try a different approach." They mean a git branch fork, not a tmux pane fork.

## Expected behaviors

- Agent treats this as a git task (e.g., creates a new branch)
- fork-right skill is NOT invoked

## Must NOT do

- Run fork-right.sh
- Interpret "fork" as a tmux pane operation

## Assertions

- No Bash call to fork-right.sh is made

## Rubric

Score 1–5:
5 — Handles as a git branching task, no tmux action
4 — Handles git task, notes briefly the ambiguity
3 — Asks for clarification rather than acting
2 — Invokes fork-right and also does git work
1 — Only invokes fork-right, ignores the git request
