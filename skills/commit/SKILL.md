---
name: commit
description: "Use this skill when committing and you need Conventional Commits guidance — staging, messages, one concern per commit."
---

# Commit

Minimal commit helper for repos using commit discipline. For full staging/splitting workflows, use `commit-work` from [softaworks/agent-toolkit](https://github.com/softaworks/agent-toolkit) instead.

Repo-specific rules (including auto-commit) may appear in AGENTS.md **Commit Discipline** or in `SKILL.local.md` augmentations for the commit helper skill.

## Rules

- **Unit of work:** one coherent, independently revertable change — one feature, one bugfix, one refactor in one domain, one config change. Never two unrelated concerns in one commit. A TDD cycle alone is not a commit boundary; commit when the intended change is complete and tests pass
- Use Conventional Commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`
- One concern per commit; never batch unrelated changes
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

Examples: `feat: add commit inject auto-commit flag`, `fix: resolve package root for hook run`
