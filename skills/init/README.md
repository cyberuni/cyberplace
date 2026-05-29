# init

Initialize or improve `AGENTS.md` with grounded codebase documentation for AI coding assistants, then symlink `CLAUDE.md` to it.

## When to use

Use this skill when setting up a repository for agent-assisted development or refreshing stale agent guidance.

Good triggers include:

- "Initialize AGENTS.md for this repo"
- "Set up agent documentation"
- First time onboarding an AI agent to a codebase
- `AGENTS.md` is missing or outdated

## What it does

The skill analyzes the codebase and writes or updates `AGENTS.md` with:

- Skill Augmentations rules (always first)
- Commands for build, lint, and test
- Architecture overview grounded in the repo
- Optional discipline sections and project-specific notes from existing docs

It also symlinks `CLAUDE.md` → `AGENTS.md`, repairs repo-private skills under `.agents/skills/`, and lists companion `init-*` skills to run next.

## Install

```bash
npx skills add cyberuni/cyber-skills --skill init
```
