# create-skill

Scaffold a new agent skill, audit it, and link it into detected agent directories.

## When to use

Use this skill when the user asks to create a new agent skill from scratch.

Good triggers include:

- "Create a skill for X"
- "Scaffold a new agent skill"
- "Add a skill to this repo"

## What it does

The skill:

- Chooses placement (user, project private, or project public)
- Identifies the workflow pattern (process, tool-based, standard, persona)
- Scaffolds `SKILL.md` via `npx skills init` or a manual template
- Runs mechanical audit checks and full quality review
- Links the skill into Claude Code, Cursor, Codex, and other detected agents

For public skills shipped in `skills/<name>/`, also add a sibling `README.md` with install instructions and usage triggers.

## Install

```bash
npx skills add cyberuni/cyber-skills --skill create-skill
```
