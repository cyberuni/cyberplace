---
name: create-spec
description: Use this skill when the user wants to create or improve one or more agent configurations (skills, AGENTS.md sections, subagent definitions, commands).
---

# create-spec

Create an eval spec (golden set + trigger queries) for one or more agent configurations.

## Identify the target

If the user named a specific agent configuration, resolve it directly:

- **Skill** — path to a `SKILL.md` file
- **AGENTS.md section** — section heading (e.g., `## Commit Discipline`)
- **Subagent** — path to a subagent definition file
- **Command** — path to a command definition file

If no specific agent configuration was named, scan the project for agent configurations that have no `artifacts/aces/` entry yet. Collect the full list and present it to the user — ask them to select one, several, or all before continuing.

## For each selected agent configuration

Invoke `aces-spec-designer` with:

```
SUBJECT: <full text of the agent configuration file>
SUBJECT_PATH: <relative path to the agent configuration>
AGENTSKILLS_EVALS: <contents of <subject-dir>/evals/evals.json if present, else null>
```

Wait for `aces-spec-designer` to complete before moving to the next agent configuration.

## Report

After all selected agent configurations are processed, report:

- Agent configurations processed (paths)
- File counts per agent configuration (trigger queries, golden-set cases)
- Structural issues found (from `audit-skill` run inside `aces-spec-designer`)
- Next step: run `aces:run` to score the golden set against the current agent configuration
