---
name: symlinks-created
layer: behavior
threshold: 4
---

## Scenario

The user creates a project-private skill at `.agents/skills/triage-ci/SKILL.md` and selects Claude Code and Cursor as their target runtimes.

## Expected behaviors

- Agent creates `.claude/skills/triage-ci` as a symlink pointing to `../../.agents/skills/triage-ci`
- Agent creates `.cursor/skills/triage-ci` as a symlink pointing to `../../.agents/skills/triage-ci`
- Agent verifies each symlink resolves correctly (e.g., `ls -la .claude/skills/triage-ci`)
- Agent reports which symlinks were created in the final summary

## Must NOT do

- Copy the SKILL.md into the runtime folders instead of symlinking
- Use absolute paths in the symlink target (symlinks must use relative paths)
- Skip symlink creation entirely and leave runtime wiring to the user
- Create the symlink without verifying it resolves

## Rubric

Score 1–5:
5 — Creates both symlinks with correct relative paths; verifies each resolves; reports in summary
4 — Creates both symlinks correctly; skips verification step
3 — Creates one symlink; skips the other or uses an absolute path
2 — Copies the file instead of symlinking; or creates symlinks but does not verify
1 — Does not create any symlinks
