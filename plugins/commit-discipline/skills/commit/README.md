# commit

Minimal Conventional Commits helper for staging, messages, and one-concern-per-commit discipline.

## When to use

Use this skill when committing changes and you need lightweight commit guidance.

Good triggers include:

- "Commit these changes"
- "Write a conventional commit message"
- Repos using `init-commit-discipline` without the full `commit-work` skill

For full staging and split workflows, prefer [`commit-work`](https://github.com/softaworks/agent-toolkit) from softaworks/agent-toolkit — but keep this skill's staging rules, since `commit-work` recommends the interactive `git add -p`.

## What it does

The skill guides:

- A definition of done that must hold before anything is staged (build, tests, lint, runtime surface exercised, docs)
- Unit-of-work boundaries (one revertable concern per commit), including a one-sentence describe test for splitting
- Conventional Commits format (`feat:`, `fix:`, `refactor:`, etc.)
- Explicit staging (`git add <files>`, never `git add .`)
- Pre-commit hook awareness, so hooks do not fail mid-commit

Repo rules in AGENTS.md/CLAUDE.md **Commit Discipline** or a `SKILL.local.md` override the skill's defaults; there is no separate config file.

## Install

Project-scoped (recommended when used with `init-commit-discipline`):

```bash
npx skills add cyberuni/cyberplace --skill commit
```
