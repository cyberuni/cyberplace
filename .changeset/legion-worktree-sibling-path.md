---
"cyberlegion": patch
---

Fix `session spawn`'s default worktree checkout location: it now lives as a sibling of the primary checkout (`<repo>.worktrees/legion-<id>`) instead of nested inside `<primary>/.agents/cyberlegion/worktrees/`, which polluted `git status` in the primary checkout and confused tooling that walks the tree recursively. The directory name uses the same 6-character id slice the peer's `handle` already defaults to.
