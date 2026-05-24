---
name: commit
description: "Use this skill when committing and you need Conventional Commits guidance — staging, messages, one concern per commit."
---

# Commit

Minimal commit helper for repos using commit discipline. For full staging/splitting workflows, use `commit-work` from [softaworks/agent-toolkit](https://github.com/softaworks/agent-toolkit) instead.

## Rules

- Commit every self-contained unit of work before moving on
- Use Conventional Commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`
- One concern per commit; never batch unrelated changes
- Use `git add -p` when a file has mixed changes
- Never commit with red tests; run the repo's validation command first

## Workflow

1. Inspect: `git status`, `git diff` (and `git diff --cached` after staging)
2. Stage only what belongs: `git add -p`
3. Review staged diff: `git diff --cached`
4. Write message: `type: short imperative summary` (optional body for why)
5. Commit: `git commit -m "type: summary"`

## Message format

```text
type: short summary in imperative mood

Optional body explaining what changed and why.
```

Examples: `feat: add commit discipline hook registration`, `fix: resolve package root for run-hook`
