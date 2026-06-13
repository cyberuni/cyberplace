# init-commit-discipline

Inject commit discipline into `AGENTS.md` and register SessionStart hooks on agents that support them.

## When to use

Use this skill after `init` when you want consistent commit habits enforced across agent sessions.

Good triggers include:

- "Set up commit discipline"
- "Initialize commit hooks for agents"
- After running the `init` skill in a new repo

## What it does

The skill:

- Resolves a commit helper skill (`commit-work`, bundled `commit`, or user override)
- Asks whether to enable auto-commit on completed units of work
- Injects a `## Commit Discipline` section into `AGENTS.md`
- Registers a SessionStart hook (Claude Code, Cursor, Codex) to reinject rules each session

## Install

```bash
npx skills add cyberuni/cyber-skills --skill init-commit-discipline
```

Run after installing `init`:

```bash
npx skills add cyberuni/cyber-skills --skill init --skill init-commit-discipline
```
