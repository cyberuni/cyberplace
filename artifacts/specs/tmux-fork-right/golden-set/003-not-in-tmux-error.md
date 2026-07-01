---
name: not-in-tmux-error
layer: behavior
threshold: 4
---

## Scenario

User requests "fork right" but the agent is NOT running inside a tmux session (the `$TMUX` environment variable is unset). The fork-right.sh script exits with: `Error: not inside a tmux session. Start tmux first.` on stderr, exit code 1.

## Expected behaviors

- Agent runs the script and captures the error
- Agent reports the error message to the user verbatim or near-verbatim: "not inside a tmux session. Start tmux first."
- Agent does not retry or attempt an alternative split method

## Must NOT do

- Silently ignore the error
- Attempt to start tmux itself
- Claim the fork succeeded

## Assertions

- Agent output contains the phrase "not inside a tmux session" or equivalent clear error
- Agent does not issue a second tmux-related bash call after the failure

## Rubric

Score 1–5:
5 — Reports the exact error message, nothing else
4 — Reports the error with minor paraphrase, suggests starting tmux
3 — Reports that something failed but message is vague or missing key text
2 — Silently fails or claims success
1 — Attempts workaround or crashes
