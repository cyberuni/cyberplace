# create-persona-skill

Scaffold an opt-in persona or role skill with `metadata.persona` and a clear activation model.

## When to use

Use this skill when the user wants an expert stance or role the agent loads on demand.

Good triggers include:

- "Create a persona skill"
- "Build a role skill for orchestrator / designer / PM"
- "Act as X — make that reusable"

## What it does

The skill interviews for role, domain, decisions, delegation, output style, and triggers, then writes `SKILL.md` with:

- `metadata.persona: "true"`
- Opt-in activation via `description` (default) or optional SessionStart hook
- Persona-specific heuristics and boundaries

## Install

```bash
npx skills add cyberuni/cyber-skills --skill create-persona-skill
```
