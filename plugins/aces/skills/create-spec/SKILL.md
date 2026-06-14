---
name: create-spec
description: Use this skill when the user wants to create an eval spec for one or more artifacts (skills, AGENTS.md sections, subagent definitions, commands).
---

# create-spec

Create an eval spec (golden set + trigger queries) for one or more artifacts.

## Identify the target

If the user named a specific artifact, resolve it directly:

- **Skill** — path to a `SKILL.md` file
- **AGENTS.md section** — section heading (e.g., `## Commit Discipline`)
- **Subagent** — path to a subagent definition file
- **Command** — path to a command definition file

If no specific artifact was named, scan the project for artifacts that have no `artifacts/aces/` entry yet. Collect the full list and present it to the user — ask them to select one, several, or all before continuing.

## For each selected artifact

Invoke `aces-spec-designer` with:

```
ARTIFACT: <full text of the artifact file>
ARTIFACT_PATH: <relative path to the artifact>
AGENTSKILLS_EVALS: <contents of <artifact-dir>/evals/evals.json if present, else null>
```

Wait for `aces-spec-designer` to complete before moving to the next artifact.

## Report

After all selected artifacts are processed, report:

- Artifacts processed (paths)
- File counts per artifact (trigger queries, golden-set cases)
- Structural issues found (from `audit-skill` run inside `aces-spec-designer`)
- Next step: run `aces:run` to score the golden set against the current artifact
