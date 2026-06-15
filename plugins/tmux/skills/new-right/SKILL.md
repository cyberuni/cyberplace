---
name: new-right
description: Use this skill when the user wants a fresh Claude Code session in a new tmux pane to the right.
---

# New Right

Run the script to split a new tmux pane to the right and start a fresh Claude Code session in it:

```bash
SKILL_DIR=$(npx skills path new-right 2>/dev/null || echo "$HOME/.agents/skills/new-right")
bash "$SKILL_DIR/scripts/new-right.sh"
```

If the script fails, tell the user the error message.
