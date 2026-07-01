---
title: Skills Overview
description: All public skills shipped with cyber-skills.
---

Skills are `SKILL.md` files that AI agents load on demand. Each encodes a workflow — steps, decisions, and tool use — so agents behave consistently across sessions and team members.

## Public skills

| Skill | Description |
| ----- | ----------- |
| [**init**](/skills/init/) | Initialize or improve `AGENTS.md` with codebase documentation, then symlink `CLAUDE.md` to it. |
| [**init-commit-discipline**](/skills/init-commit-discipline/) | Inject commit discipline into `AGENTS.md` and register SessionStart hooks where supported. |
| [**commit**](/skills/commit/) | Minimal Conventional Commits helper — staging, messages, one concern per commit. |
| [**create-skill**](/skills/create-skill/) | Create a new agent skill — scaffold, audit, and link into detected agents. |
| [**audit-skill**](/skills/audit-skill/) | Full audit of a `SKILL.md` for structure, quality, and security. |

## Skill placement

Skills live in one of three locations:

| Placement | Location | Use case |
| --------- | -------- | -------- |
| **User** | `~/.agents/skills/<name>/` | Personal skills across all projects |
| **Project private** | `.agents/skills/<name>/` | Contributor tooling scoped to one repo |
| **Project public** | `skills/<name>/` | Shipped with a package; users install via `npx skills add` |

## Skill patterns

| Pattern | Use case |
| ------- | -------- |
| **Process** | Multi-step workflows with ordered steps and decisions |
| **Tool-based** | Consistent use of tools, systems, or connectors |
| **Standard** | Tone, format, structure, or quality enforcement |

## Installing skills

```bash
# Install all public skills globally
npx skills add cyberuni/cyber-skills --all -g

# Install a specific skill
npx skills add cyberuni/cyber-skills --skill init -g
```

See [Installation](/getting-started/installation/) for pinning and team setup.
