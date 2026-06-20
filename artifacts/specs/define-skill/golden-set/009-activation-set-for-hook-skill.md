---
name: activation-set-for-hook-skill
layer: behavior
threshold: 4
---

## Scenario

The user says: "Create a project-private skill called inject-commit-discipline that automatically injects commit discipline rules at the start of every session. It should fire as a SessionStart hook, not on user request."

The user has specified hook-backed activation (SessionStart).

## Expected behaviors

- Agent adds `metadata.activation: SessionStart` to the frontmatter
- Agent does NOT add a `"Use this skill when"` description trigger phrasing that implies user invocation — hook-backed skills fire automatically
- Agent explains that after writing the skill, `hook register` must be run to wire the hook
- The description still starts with `"Use this skill when"` per format convention, but the body makes clear it fires automatically

## Must NOT do

- Omit `metadata.activation` entirely for a hook-backed skill
- Use `metadata.activation: per-situation` (the default) for a SessionStart hook
- Fail to mention that `hook register` is needed to activate it

## Rubric

Score 1–5:
5 — Sets `metadata.activation: SessionStart`; description present; mentions `hook register` as the required wiring step
4 — Correct `metadata.activation`; omits `hook register` reminder
3 — Adds `metadata.activation` with wrong value (e.g., `PostToolUse`) or misspells it
2 — Writes the skill without any activation metadata and does not mention hooks
1 — Treats this as a per-situation skill with no hook-related content
