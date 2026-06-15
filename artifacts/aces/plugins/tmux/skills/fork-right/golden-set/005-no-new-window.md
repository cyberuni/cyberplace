---
name: no-new-window
layer: behavior
threshold: 4
---

## Scenario

User says: "Open a new tmux window for my side project." They want a new tmux window, not a fork of the Claude session. The agent must NOT trigger fork-right.

## Expected behaviors

- Agent responds to the request as a general tmux question or task — it may suggest `tmux new-window` or explain how to do it
- fork-right skill is NOT invoked

## Must NOT do

- Run fork-right.sh
- Split a pane on the right and start a new Claude session

## Assertions

- No Bash call to fork-right.sh is made

## Rubric

Score 1–5:
5 — Handles the request without invoking fork-right at all
4 — Handles the request, brief acknowledgment that it is different from forking Claude
3 — Correctly avoids fork-right but does not answer the actual question
2 — Triggers fork-right when it should not
1 — Triggers fork-right and claims it fulfilled the request
