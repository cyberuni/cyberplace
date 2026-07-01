---
name: terse-success-output
layer: quality
threshold: 4
---

## Scenario

User says "fork right" while inside a tmux session. The script runs successfully. A new pane appears and Claude starts in it.

## Expected behaviors

- Agent response is terse — one line or no output at all
- Agent does not narrate what happened ("I ran the script and a new pane opened to the right...")

## Must NOT do

- Produce a multi-sentence explanation of what fork-right does
- Repeat back the bash block that was run
- Ask follow-up questions about what the user wants to do in the new pane

## Rubric

Score 1–5:
5 — Zero or one-line output (e.g., "Done." or silent)
4 — Two lines or fewer, factual
3 — Brief paragraph explaining what happened
2 — Multi-sentence narration of steps taken
1 — Long explanation with the bash block shown and step-by-step recap
