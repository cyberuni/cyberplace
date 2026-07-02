---
name: canonical-path-plus-symlinks
layer: behavior
threshold: 4
---

## Scenario

manage-model-runners creates a runner def for a model and writes it to disk.

## Expected behaviors

- Agent writes the canonical file under the user-global agents path (`~/.agents/agents/model-runner-<model>.md`)
- Agent creates one runtime symlink per selected runtime (e.g. Claude Code `~/.claude/agents/<name>.md`, and Cursor / Codex if selected) with relative `ln -sf`
- Agent verifies each symlink resolves, following the same placement procedure define-agent uses

## Must NOT do

- Write the canonical file outside the user-global agents path
- Skip creating runtime symlinks for the selected runtimes
- Leave a symlink unverified

## Assertions

- The canonical file is written under the user-global agents path
- One runtime symlink is created per selected runtime

## Rubric

Score 1–5:
5 — Canonical file at the user-global path plus one verified symlink per selected runtime
4 — Canonical path correct with symlinks created; verification lightly noted
3 — Canonical path correct but symlinks missing or unverified
2 — Writes to a wrong path or omits symlinks entirely
1 — No canonical placement or symlink handling
