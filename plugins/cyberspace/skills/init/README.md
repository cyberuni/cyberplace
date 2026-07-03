# init

Initialize a project's agent configuration to work across **every major agent harness** — analyze the codebase,
write or improve `AGENTS.md`, wire the per-harness config through the `universal-plugin` CLI, point `CLAUDE.md`
at `AGENTS.md`, repair repo-private skills, and suggest setting up SDD and registering ACED.

## When to use

Use this skill when onboarding a repository for agent-assisted development, setting up agent documentation, or
making agent config portable across Claude Code, Cursor, Codex, and Copilot.

Good triggers:

- "Initialize AGENTS.md for this repo"
- "Set up agent documentation"
- "Make my agent config work across Cursor and Claude Code"
- First-time onboarding of an AI agent to a codebase

## What it does

- Writes or improves `AGENTS.md`, grounded in real project files (asks before overwriting a differing section).
- Wires the per-harness config via the `universal-plugin` CLI, or routes to the direct-write fallback skill when
  the user declines `npx`.
- Merges and symlinks `CLAUDE.md` → `AGENTS.md`.
- Repairs repo-private skills via the CLI.
- Surfaces companion `init-*` skills and offers to run them.
- Suggests setting up SDD and — once SDD is present — registering ACED, honoring prior declines.

## Install

```bash
npx skills add cyberuni/cyberplace --skill init
```
