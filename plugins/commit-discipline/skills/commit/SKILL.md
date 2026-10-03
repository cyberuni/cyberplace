---
name: commit
description: "Use this skill when committing and you need Conventional Commits guidance — staging, messages, one concern per commit."
---

# Commit

Minimal commit helper for repos using commit discipline. For full staging/splitting workflows, use `commit-work` from [softaworks/agent-toolkit](https://github.com/softaworks/agent-toolkit) — but keep the staging rules below: `commit-work` recommends `git add -p`, which is interactive and an agent cannot run it.

Repo-specific rules (including auto-commit) appear in AGENTS.md or CLAUDE.md **Commit Discipline**, or in a `SKILL.local.md` beside this skill, and take precedence over it.

## Rules

- **Unit of work:** one coherent, independently revertable change — one feature, one bugfix, one refactor in one domain, one config change. Never two unrelated concerns in one commit. A TDD cycle alone is not a commit boundary; commit when the intended change is complete and tests pass
- Use Conventional Commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`
- One concern per commit; never batch unrelated changes
- Stage only files for this unit: `git add <files>` — never `git add .`, `git add -A`, or `git add -p`
- Never commit with red tests; run the repo's validation command first

## Definition of done

Do not stage until the change is actually finished. Before `git add`:

- Type-check or build passes
- Tests pass — the affected suite at minimum, the repo's full validation command when the change is broad
- Lint and format are clean
- Anything with a runtime surface (UI, endpoint, CLI, config) has been exercised once; passing tests is not proof it works
- Docs are updated, and a changeset added if the repo uses them

Unfinished work is not a commit boundary, and neither is a TDD red-green cycle on its own.

## Pre-commit hooks

Check for `.husky/`, `.pre-commit-config.yaml`, or `git config core.hooksPath`, and say what will run before you commit.

Run those same checks yourself first — a hook that fails mid-commit leaves the work half-staged.

## Workflow

1. Inspect: `git status`, `git diff`
2. Stage only files for this unit: `git add <files>`
3. Verify staged diff: `git diff --cached`
4. Describe the staged change in one sentence. If you need an "and" to describe it, it is two commits — unstage and split
5. Write message: `type: short imperative summary` (optional body for why)
6. Commit: `git commit -m "type: summary"`

## Message format

```text
type: short summary in imperative mood

Optional body explaining what changed and why.
```

Examples: `feat: add commit inject auto-commit flag`, `fix: resolve package root for hook run`
