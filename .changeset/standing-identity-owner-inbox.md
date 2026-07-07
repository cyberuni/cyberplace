---
"cyberlegion": minor
---

Add `identity owner --handle <name>` to mint a standing, session-independent owner inbox — a durable recipient identity with no live session, tmux pane, or harness. Standing records are exempt from `prune` staleness checks, are listed by `who`, and take precedence over a live session when a handle is shared. Bare `identity owner` lists existing standing records.
