---
name: symlinks-created
layer: behavior
threshold: 4
---

## Scenario

The user has chosen project placement for a governance file named `commit-standards`. The canonical path is `.agents/skills/commit-standards/SKILL.md`. The user is using Claude Code and Cursor. After writing the file, the agent must create symlinks.

## Expected behaviors

- Agent creates a symlink at `.claude/skills/commit-standards/SKILL.md` pointing to the canonical path using a relative path
- Agent creates a symlink at `.cursor/rules/commit-standards.mdc` pointing to the canonical path using a relative path
- Agent reports both symlinks in the summary

## Must NOT do

- Use absolute paths in symlinks
- Skip symlink creation entirely
- Create only one symlink when both runtimes are specified

## Assertions

- Agent creates exactly two symlinks (or reports the two symlink paths it created)
- Symlink paths use relative references from the symlink location

## Rubric

Score 1–5:
5 — Both symlinks created with relative paths; both reported in summary
4 — Both symlinks created; one uses an absolute path but the file is reachable
3 — One symlink created; the other is mentioned but skipped or errored
2 — Neither symlink created; agent only mentions the canonical file path
1 — Symlink section completely ignored; not mentioned in report
