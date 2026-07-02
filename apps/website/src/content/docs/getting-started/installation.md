---
title: Installation
description: How to install cyberplace skills and CLI.
---

## Skills (primary interface)

Skills are agent workflows. Install them with the [Skills CLI](https://github.com/vercel-labs/skills):

```bash
# Install all public skills globally
npx skills add cyberuni/cyberplace --all -g

# Install a specific skill
npx skills add cyberuni/cyberplace --skill init -g

# Install for a specific agent
npx skills add cyberuni/cyberplace --skill init -a claude-code -g

# Team: project-scoped (commit skills-lock.json after install)
npx skills add cyberuni/cyberplace --skill init --skill init-commit-discipline
```

## CLI

The `cyberplace` CLI is used by skills under the hood and is available for direct scripting:

```bash
# Exploration only — do not use @latest in hooks or CI
npx cyberplace@latest --help
```

### Pinning

| Use case | Pinning |
| -------- | ------- |
| **Scripts / manual CLI** | `npx cyberplace@$(npm view cyberplace version) <subcommand>` |
| **`init` / `init-commit-discipline` skills** | The skill resolves semver on first use and pins it. Re-run `init-commit-discipline` to bump after upgrades. |
| **Skill content (`SKILL.md`)** | Not pinned by the CLI — see [Supply Chain](/getting-started/supply-chain/). |

## Getting started with `init` and `init-commit-discipline`

Install both skills, then run them from your agent chat:

```bash
# Solo: globally
npx skills add cyberuni/cyberplace --skill init --skill init-commit-discipline -g

# Team: project-scoped
npx skills add cyberuni/cyberplace --skill init --skill init-commit-discipline
```

| Skill | When to run |
| ----- | ----------- |
| **`init`** | First time in a repo, or when `AGENTS.md` needs a refresh |
| **`init-commit-discipline`** | After `init`, when you want commit rules enforced every session |

### 1. Run `init`

In Claude Code, Cursor, or another agent, ask to **run the `init` skill**. It will:

- Create or improve **`AGENTS.md`** — commands, architecture, and grounded sections
- **Symlink `CLAUDE.md` → `AGENTS.md`** so Claude Code picks up the same guidance
- Ensure repo-internal skills under `.agents/skills/` include `metadata: internal: true`
- List companion `init-*` skills and ask whether to run any

If `AGENTS.md` already exists, the skill compares proposed changes and asks before overwriting.

### 2. Run `init-commit-discipline`

Run this **after `init`**. Ask your agent to **run the `init-commit-discipline` skill**. It will:

1. **Resolve a commit helper skill** — checks for `commit-work`, the bundled `commit`, etc.
2. **Ask about auto-commit** — whether the agent should commit each completed unit without waiting
3. **Inject `## Commit Discipline` into `AGENTS.md`** — rules, Conventional Commits, staging guidance
4. **Register a SessionStart hook** — on Claude Code, Cursor, and Codex, reinjects the rules every session

If you choose the bundled fallback commit helper, install it project-scoped:

```bash
npx skills add cyberuni/cyberplace --skill commit
```
