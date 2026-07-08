---
"cyberlegion": minor
---

Add a `workspace` value to `session spawn --at` (and `dispatch channel --at`) that opens a genuinely new workspace/session instead of a pane inside the caller's current one. Under herdr this also creates the new worktree via `herdr worktree create`, so it lands properly nested under its source workspace instead of just adding to the caller's own pane count; under tmux it opens a new detached session.
