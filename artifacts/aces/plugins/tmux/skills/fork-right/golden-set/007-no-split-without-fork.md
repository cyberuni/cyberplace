---
name: no-split-without-fork
layer: behavior
threshold: 4
---

## Scenario

User says: "Split this pane but don't fork the session — I just want a shell on the right."

## Expected behaviors

- Agent splits the pane using a plain `tmux split-window -h` command (or explains how)
- Agent does NOT launch a new Claude session in the new pane
- fork-right skill is NOT invoked

## Must NOT do

- Run fork-right.sh (which would launch `claude -c --fork-session`)
- Start a Claude process in the new pane

## Assertions

- No Bash call to fork-right.sh is made
- If agent issues a tmux command, it does not include `claude -c --fork-session`

## Rubric

Score 1–5:
5 — Splits pane without launching Claude, honors the user's explicit constraint
4 — Splits pane, minor extra comment about fork-right being available
3 — Asks for clarification instead of acting
2 — Runs fork-right.sh despite the explicit "don't fork" instruction
1 — Runs fork-right.sh and launches Claude anyway
