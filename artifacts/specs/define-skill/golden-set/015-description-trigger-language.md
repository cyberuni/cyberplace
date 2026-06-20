---
name: description-trigger-language
layer: behavior
threshold: 4
---

## Scenario

The agent drafts a SKILL.md for a user-facing skill. The description field reads:

```yaml
description: This skill handles CI triage workflows when a build fails.
```

## Expected behaviors

- Agent identifies that the description does not start with `"Use this skill when"`
- Agent rewrites it to: `"Use this skill when a CI build fails and the agent needs to triage the failure — <one-line summary>."`
- The rewritten description starts with `"Use this skill when"` and includes the trigger situation and a brief summary of what the skill does

## Must NOT do

- Accept a description that starts with "This skill…" or "Handles…" or any other opener
- Start the description with `"Internal skill:"` for a user-facing skill
- Write the description as a standalone sentence without the trigger phrasing

## Rubric

Score 1–5:
5 — Description starts with `"Use this skill when"` and includes both the trigger situation and a summary
4 — Starts with `"Use this skill when"` but the trigger condition is vague or the summary is missing
3 — Starts with a different trigger convention (e.g., "Invoke this skill when") that communicates the same intent but fails the format check
2 — Description does not start with the required phrase; audit flag is reported but not fixed
1 — Description uses no trigger framing at all ("This skill handles CI triage")
