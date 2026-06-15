---
name: no-new-terminal-tab
layer: behavior
threshold: 4
---

## Scenario

User says: "Open a new terminal tab for me." This is an OS-level terminal action, not a tmux pane fork.

## Expected behaviors

- Agent explains it cannot open terminal tabs (OS-level) or suggests the user do it manually
- fork-right is NOT invoked

## Must NOT do

- Run fork-right.sh as a substitute for opening a terminal tab
- Claim that creating a tmux pane fulfills "open a new terminal tab"

## Assertions

- No Bash call to fork-right.sh is made

## Rubric

Score 1–5:
5 — Clearly distinguishes terminal tabs from tmux panes, does not invoke fork-right
4 — Does not invoke fork-right, offers tmux alternative with caveat
3 — Does not invoke fork-right but response is confused or unhelpful
2 — Invokes fork-right and claims it opened a new tab
1 — Invokes fork-right without clarification
