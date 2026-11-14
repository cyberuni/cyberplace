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
npx skills add cyberuni/cyberplace --skill init
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
| **`init` skill** | The skill resolves semver on first use and pins it. |
| **Skill content (`SKILL.md`)** | Not pinned by the CLI — see [Supply Chain](/getting-started/supply-chain/). |

## Getting started with `init`

Install the skill, then run it from your agent chat:

```bash
# Solo: globally
npx skills add cyberuni/cyberplace --skill init -g

# Team: project-scoped
npx skills add cyberuni/cyberplace --skill init
```

| Skill | When to run |
| ----- | ----------- |
| **`init`** | First time in a repo, or when `AGENTS.md` needs a refresh |

### 1. Run `init`

In Claude Code, Cursor, or another agent, ask to **run the `init` skill**. It will:

- Create or improve **`AGENTS.md`** — commands, architecture, and grounded sections
- **Symlink `CLAUDE.md` → `AGENTS.md`** so Claude Code picks up the same guidance
- Ensure repo-internal skills under `.agents/skills/` include `metadata: internal: true`
- List companion `init-*` skills and ask whether to run any

If `AGENTS.md` already exists, the skill compares proposed changes and asks before overwriting.

### 2. Commit discipline

The `init-commit-discipline` and `commit` skills are retired. For commit rules enforced every session, install the [`repobuddy`](https://github.com/repobuddy/repobuddy) plugin (4.6.0+) and run `/repobuddy:repo enhance`; use `repobuddy:commit` as the commit helper. See [Commit Discipline](/disciplines/commit-discipline/).
