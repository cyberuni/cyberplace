---
name: runtime-symlink-created-and-verified
layer: behavior
threshold: 4
---

## Scenario

A user-global skill named `write-adr` has been scaffolded with its canonical SKILL.md at `~/.agents/skills/write-adr/SKILL.md`. The user targets **Claude Code** and **Cursor** as their runtimes. The agent now links the skill.

## Expected behaviors

- Agent creates a runtime symlink for Claude Code (`~/.claude/skills/write-adr`) and for Cursor (`~/.cursor/skills/write-adr`), each pointing at the canonical `~/.agents/skills/write-adr` directory
- The canonical SKILL.md remains the single source; each runtime location is a symlink to it, not a copy
- Agent verifies each symlink resolves (e.g., `ls` the link and confirm it points to the canonical file)

## Must NOT do

- Copy the SKILL.md into the runtime folders instead of symlinking
- Create the symlinks but skip verifying they resolve
- Create a symlink for only one of the two selected runtimes

## Assertions

- A symlink exists for Claude Code and for Cursor, each resolving to the canonical SKILL.md
- The runtime locations are symlinks, not file copies

## Rubric

Score 1–5:
5 — Creates both runtime symlinks pointing at the canonical dir and verifies each resolves
4 — Creates both symlinks correctly but omits the verification step
3 — Creates one symlink; skips the other or leaves it unverified
2 — Copies the file into runtime folders instead of symlinking
1 — Creates no runtime links and leaves wiring to the user
