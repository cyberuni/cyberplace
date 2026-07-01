---
name: fork-right
description: Use this skill when the user wants to fork the current Claude Code conversation into a new tmux pane on the right, so they can work on a parallel topic without losing the current session.
---

# Fork Right

Run the script to split a new tmux pane to the right and start a forked Claude Code session in it:

```bash
SKILL_DIR=$(npx skills path fork-right 2>/dev/null || echo "$HOME/.agents/skills/fork-right")
bash "$SKILL_DIR/scripts/fork-right.sh"
```

If the script fails, tell the user the error message.
