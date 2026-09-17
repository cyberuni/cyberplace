---
title: Governances Overview
description: What governances are, how to load them, and how they differ from disciplines.
---

**Governances** are version-pinned, auditable agent-tool contracts shipped with the `cyberplace` npm package. They are frozen to the installed version and loaded on demand via the CLI.

**Disciplines** (e.g. commit discipline) are a separate layer — session-scoped rules injected by hooks. See [Commit Discipline](/disciplines/commit-discipline/).

## Loading governances

Do not link to governance files directly from `SKILL.md`. Load them through the CLI so the content is always version-matched:

```bash
# List available governances
npx cyberplace@<version> governance list

# Show a governance (agents read stdout)
npx cyberplace@<version> governance show universal-plugin

# Agent-optimized output (lower token cost)
npx cyberplace@<version> governance show universal-plugin --format agent
```

Always pin an exact version: `npx cyberplace@$(npm view cyberplace version) …`

## Available governances

| Name | Purpose |
| ---- | ------- |
| [universal-plugin](/governances/universal-plugin/) | Format spec for plugins that work across Claude Code, Cursor, and Codex |

## Moved governances

Each governance now ships from the package that owns its subject ([repobuddy/buddy-agent-harness#122](https://github.com/repobuddy/buddy-agent-harness/issues/122)). `governance show <name>` prints a one-line notice naming the new owner and exits non-zero for these; the forwarder is kept for one release. `governance list` no longer lists them.

| Name | Now owned by | Purpose |
| ---- | ------------ | ------- |
| [skill-design](/governances/skill-design/) | `cyber-aced` | Rules for authoring `SKILL.md` files |
| [skill-repo-structure](/governances/skill-repo-structure/) | `cyber-aced` | Rules for organizing a skill library repository |
| [agent-tool-output](/governances/agent-tool-output/) | `cyber-aced` | Output rules for scripts, hooks, and CLIs that agents invoke |
| [cli-resolution](/governances/cli-resolution/) | `cyber-aced` | How a skill runs its own scripts and resolves a released CLI it does not ship |

A skill no longer reads a moved governance through this CLI. `universal-plugin plugin build` copies it into `<skill>/references/governances/<name>.md` from the owning package, and the skill reads that committed copy.

## Authoring rules

Governances are agent-first — they load directly into agent context:

- **Dense and concise** — imperative must/should/do-not rules; no tutorials
- **Self-contained** — no links to other repository files; agent completes the workflow from stdout alone
- **References at end** — only `governance show` commands and HTTPS URLs in `## References`
- **No rationale sections** — no `## Why`, `## Rationale`, or `## Background`; ADRs record why, governances record what
