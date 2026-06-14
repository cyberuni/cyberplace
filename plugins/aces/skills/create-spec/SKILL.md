---
name: create-spec
description: Use this skill when the user wants to create an eval spec for one or more subjects (skills, AGENTS.md sections, subagent definitions, commands).
---

# create-spec

Create an eval spec (golden set + trigger queries) for one or more subjects.

## Identify the target

If the user named a specific subject, resolve it directly:

- **Skill** — path to a `SKILL.md` file
- **AGENTS.md section** — section heading (e.g., `## Commit Discipline`)
- **Subagent** — path to a subagent definition file
- **Command** — path to a command definition file

If no specific subject was named, scan the project for subjects that have no `artifacts/aces/` entry yet. Collect the full list and present it to the user — ask them to select one, several, or all before continuing.

## For each selected subject

Invoke `aces-spec-designer` with:

```
SUBJECT: <full text of the subject file>
SUBJECT_PATH: <relative path to the subject>
AGENTSKILLS_EVALS: <contents of <subject-dir>/evals/evals.json if present, else null>
```

Wait for `aces-spec-designer` to complete before moving to the next subject.

## Report

After all selected subjects are processed, report:

- Subjects processed (paths)
- File counts per subject (trigger queries, golden-set cases)
- Structural issues found (from `audit-skill` run inside `aces-spec-designer`)
- Next step: run `aces:run` to score the golden set against the current subject
