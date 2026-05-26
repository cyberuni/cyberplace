# commit

Minimal Conventional Commits helper for staging, messages, and one-concern-per-commit discipline.

## When to use

Use this skill when committing changes and you need lightweight commit guidance.

Good triggers include:

- "Commit these changes"
- "Write a conventional commit message"
- Repos using `init-commit-discipline` without the full `commit-work` skill

For full staging and split workflows, prefer [`commit-work`](https://github.com/softaworks/agent-toolkit) from softaworks/agent-toolkit.

## What it does

The skill guides:

- Unit-of-work boundaries (one revertable concern per commit)
- Conventional Commits format (`feat:`, `fix:`, `refactor:`, etc.)
- Explicit staging (`git add <files>`, never `git add .`)
- Validation before commit (no red tests)

## Install

Project-scoped (recommended when used with `init-commit-discipline`):

```bash
npx skills add cyberuni/cyber-skills --skill commit
```
