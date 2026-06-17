---
title: Permissions
description: What permissions are — capability boundaries that define which tools an agent can and cannot invoke.
---

**Permissions** are capability boundaries that define what an agent is allowed to do — specifically, which tools it may invoke and which are off-limits. They are not behavioral guidance; they are hard fences enforced by the harness before any tool call runs.

**Tagline:** Governance defines what is correct. Permissions define what is possible.

## What permissions control

Permissions operate at the tool level:

- **Allowlist** — only these tools may be called (`tools` in agent frontmatter)
- **Denylist** — these tools are explicitly blocked (`disallowedTools` in agent frontmatter)
- **Project-level** — `settings.json` `allowedTools` / `permissions` apply to the main agent for a repo

A permission boundary is enforced regardless of what the agent is instructed to do. An agent with `disallowedTools: [Write]` cannot write files even if a skill tells it to.

## Where permissions live

| Scope | Location | Effect |
|-------|----------|--------|
| **Agent-scoped** | `agents/*.md` frontmatter (`tools`, `disallowedTools`) | Applies to that subagent only |
| **Project-scoped** | `.claude/settings.json` `allowedTools` | Applies to main agent in this repo |
| **User-scoped** | `~/.claude/settings.json` | Applies to main agent in all repos |

## Permissions vs Constraints

Both limit what an agent can do, but at different layers:

| | Permissions | Constraints |
|---|---|---|
| **Mechanism** | Harness-enforced before tool call | Behavioral limit in agent definition or hook |
| **What it stops** | Specific tool invocations | Patterns of behavior (turn count, operation type) |
| **Granularity** | Per-tool | Per-behavior |

## Plugin distribution

Permissions bundled in an agent definition travel with the agent — installing a plugin that includes an agent also installs its permissions. Project-level permissions in `settings.json` are local and not distributed by a plugin.

**In the plugin schema:**

| Schema | Field |
|--------|-------|
| Claude Code agent frontmatter | `tools`, `disallowedTools` |
| Open Plugin Spec agent frontmatter | same pattern |
| *(no top-level plugin field)* | — |

## Related

- [Constraints](/concepts/constraints/) — behavioral limits that complement permissions
- [Persona](/concepts/persona/) — the agent definition that bundles permissions
- [Agent Configuration](/concepts/agent-configuration/) — full picture of what shapes agent behavior
