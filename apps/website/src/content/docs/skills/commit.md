---
title: commit
description: Minimal Conventional Commits helper — staging, messages, one concern per commit.
---

**Trigger:** "commit this", "help me write a commit message"

Minimal commit helper for repos using commit discipline. For full staging/splitting workflows, use [`commit-work`](https://github.com/softaworks/agent-toolkit) from softaworks/agent-toolkit instead.

## Rules

- **Unit of work:** one coherent, independently revertable change — one feature, one bugfix, one refactor, one config change. Never two unrelated concerns in one commit.
- Use Conventional Commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`
- Stage only files for this unit: `git add <files>` — never `git add .`, `git add -A`, or `git add -p`
- Never commit with red tests; run the repo's validation command first

## Workflow

1. Inspect: `git status`, `git diff`
2. Stage only files for this unit: `git add <files>`
3. Verify staged diff: `git diff --cached`
4. Write message: `type: short imperative summary` (optional body for why)
5. Commit: `git commit -m "type: summary"`

## Message format

```text
type: short summary in imperative mood

Optional body explaining what changed and why.
```

Examples: `feat: add auto-commit flag`, `fix: resolve package root for hook run`

## Install

```bash
# Install project-scoped (recommended as bundled fallback)
npx skills add cyberuni/cyber-skills --skill commit
```

## Related

- [init-commit-discipline](/skills/init-commit-discipline/) — sets up commit discipline and hooks
- [Commit Discipline](/disciplines/commit-discipline/) — the rules this skill enforces
