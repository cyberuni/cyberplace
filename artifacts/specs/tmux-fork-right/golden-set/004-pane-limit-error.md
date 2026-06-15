---
name: pane-limit-error
layer: behavior
threshold: 4
---

## Scenario

User is inside a tmux session and requests fork-right. tmux is at its pane limit and the `tmux split-window` call fails with an error such as: `create pane failed: pane limit reached`. The script exits non-zero.

## Expected behaviors

- Agent reports the tmux error message to the user
- Agent does not attempt a second split

## Must NOT do

- Silently swallow the error
- Claim the pane was created successfully
- Try alternative tmux layouts to work around the limit

## Assertions

- Agent output contains the tmux error text or a clear statement that splitting failed
- No second Bash call to tmux split-window is made

## Rubric

Score 1–5:
5 — Reports the tmux error message clearly, stops
4 — Reports failure with paraphrase, stops
3 — Reports failure vaguely, no detail about pane limit
2 — Attempts retry or alternative
1 — Claims success or ignores error entirely
