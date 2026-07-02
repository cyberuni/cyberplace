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
npx cyberplace@<version> governance show skill-design

# Agent-optimized output (lower token cost)
npx cyberplace@<version> governance show skill-design --format agent
```

Always pin an exact version: `npx cyberplace@$(npm view cyberplace version) …`

## Available governances

| Name | Purpose |
| ---- | ------- |
| [skill-design](/governances/skill-design/) | Rules for authoring `SKILL.md` files |
| [skill-repo-structure](/governances/skill-repo-structure/) | Rules for organizing a skill library repository |
| [agent-tool-output](/governances/agent-tool-output/) | Output rules for scripts, hooks, and CLIs that agents invoke |
| [cli-resolution](/governances/cli-resolution/) | Strategy for invoking a Node CLI that may be global, repo-local, or absent |
| [universal-plugin](/governances/universal-plugin/) | Format spec for plugins that work across Claude Code, Cursor, and Codex |

## Authoring rules

Governances are agent-first — they load directly into agent context:

- **Dense and concise** — imperative must/should/do-not rules; no tutorials
- **Self-contained** — no links to other repository files; agent completes the workflow from stdout alone
- **References at end** — only `governance show` commands and HTTPS URLs in `## References`
- **No rationale sections** — no `## Why`, `## Rationale`, or `## Background`; ADRs record why, governances record what
