---
title: init-commit-discipline
description: Inject commit discipline into AGENTS.md and register SessionStart hooks where supported.
---

**Trigger:** "set up commit discipline", "enforce commit rules", "run init-commit-discipline"

Injects always-on commit discipline into the repo: an AGENTS.md section for every agent, plus SessionStart hooks on agents that support them (Claude Code, Cursor, Codex).

**Prerequisite:** Run [`init`](/skills/init/) first — `AGENTS.md` with Skill Augmentations must exist.

## What it does

1. **Resolves a commit helper skill** — checks for `commit-work` (recommended), the bundled `commit`, or another skill you name
2. **Asks about auto-commit** — whether the agent should commit each completed unit of work without waiting
3. **Injects `## Commit Discipline` into `AGENTS.md`** — unit-of-work definition, Conventional Commits rules, staging guidance, and a pointer to the chosen commit helper
4. **Registers a SessionStart hook** — reinjects the Commit Discipline section at the start of every agent session so the rules are always active

## Commit helper options

| Option | Action |
| ------ | ------ |
| **A — Recommended** | Install `softaworks/agent-toolkit@commit-work`: `npx skills add softaworks/agent-toolkit --skill commit-work -g` |
| **B — User override** | Name another commit skill to install or reference |
| **C — Bundled fallback** | Install cyber-skills' minimal `commit` skill: `npx skills add cyberuni/cyber-skills --skill commit` |

## Injected AGENTS.md shape

```markdown
## Commit Discipline

**Auto-commit rule:** … (only when opted in)

**Unit of work:** one coherent, independently revertable change …

- Conventional Commits: feat:, fix:, refactor:, test:, docs:, chore:
- One concern per commit; never batch unrelated changes
- Stage only files for this unit: git add <files>
- Never commit with red tests

### References

- **`commit-work` skill** — staging, splitting, and message writing when committing
```

## Install

```bash
npx skills add cyberuni/cyber-skills --skill init-commit-discipline -g
```

## Related

- [init](/skills/init/) — prerequisite
- [commit](/skills/commit/) — bundled fallback commit helper
- [Commit Discipline](/disciplines/commit-discipline/) — the rules this skill enforces
