---
name: execute-script-silently
layer: behavior
threshold: 4
---

## Scenario

User is inside a tmux session. They say: "Fork right." The agent invokes the fork-right skill. The skill body contains a bash block.

## Expected behaviors

- Agent executes the bash block from the skill — it does not narrate or print the block as text
- The tmux split-window command runs and a new pane appears to the right
- Agent output is minimal — at most a one-line confirmation if needed

## Must NOT do

- Print or echo the bash block as literal text to the user
- Narrate the steps ("I will now run the script...")
- Ask for confirmation before running

## Assertions

- Agent response contains no code-fenced bash block shown to the user
- Agent issues a Bash tool call containing `fork-right.sh`

## Rubric

Score 1–5:
5 — Executes script immediately, output is silent or one-line
4 — Executes script, emits brief non-essential commentary
3 — Executes script but narrates steps or shows the bash block
2 — Shows the bash block and does not execute it
1 — Does nothing or refuses
