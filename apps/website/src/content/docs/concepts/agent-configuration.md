---
title: Agent Configuration
description: What agent configuration is — the collective term for all instructions an agent runtime loads to shape behavior.
---

**Agent configuration** is the collective term for all the instructions an agent runtime loads to shape how it behaves. A change to any of these artifacts changes how the agent responds, decides, and acts — making them the primary unit of quality control in agentic workflows.

## Concepts

Agent configuration is organized around distinct concepts, each with a different scope and delivery mechanism:

| Concept | What it defines | When active |
| ------- | --------------- | ----------- |
| **[Skills](/concepts/skills/)** | On-demand workflows — scaffolding, review, publishing | Loaded when agent matches a situation |
| **[Governances](/concepts/governances/)** | Normative standards for a specific domain — what correct looks like | Loaded on demand via `governance show` CLI |
| **[Disciplines](/concepts/disciplines/)** | Cross-cutting behavioral habits — always commit atomically, always brief subagents | Always-on via `AGENTS.md` and SessionStart hooks |
| **[Permissions](/concepts/permissions/)** | Tool capability boundaries — what the agent can and cannot invoke | Enforced by harness on every tool call |
| **[Constraints](/concepts/constraints/)** | Hard behavioral limits — max turns, guardrails, escalation triggers | Structural: harness-enforced. Behavioral: via discipline |
| **[Persona](/concepts/persona/)** | Agent identity — role, expertise, bundled permissions and constraints | Active whenever that subagent is spawned |
| **[Commands](/concepts/commands/)** | Named slash-command entries that trigger a specific workflow | Invoked explicitly by user |

Together these concepts define the *behavior surface* of an agentic system. Skills, governances, and commands are loaded on demand. Disciplines, permissions, and constraints are always active. Persona bundles the last three into a named, distributable unit.

## Artifacts

The concepts above map to concrete file artifacts:

| Artifact | Concepts it carries |
| -------- | ------------------- |
| **`AGENTS.md` section** | Disciplines, soft constraints (guardrails) |
| **`SKILL.md`** | Skills |
| **`agents/*.md`** | Persona, permissions, constraints |
| **`governances/*.md`** | Governances |
| **`settings.json`** | Project-scoped permissions, hook registration |
| **Commands (`commands/*.md`)** | Commands |

## Plugin distribution

Plugins are the distribution unit for agent configuration. A plugin can provide any combination of concepts:

| Plugin field | Concepts distributed |
|---|---|
| `skills` | Skills |
| `commands` | Commands |
| `agents` | Persona (bundled with permissions + constraints) |
| `hooks` | Disciplines (via SessionStart), constraint enforcement (via PermissionRequest) |
| `mcpServers` | Tool contracts (typed tool schemas) |
| *(no field — CLI)* | Governances — loaded out-of-band via `governance show` |

**Cross-plugin patterns:** One plugin's persona can be consumed as a subagent by another plugin's skills. Example: the `sdd` plugin provides `sdd-judge`; the `aces` plugin spawns `sdd-judge` to evaluate spec quality. Neither plugin has a hard `dependency` on the other — the integration is a workflow convention, not a schema constraint.

**Open Plugin Spec** adds a `rules` field that directly maps to governances — the closest analog to `governance show` at the schema level. Claude Code does not have a native governance field; governances travel via CLI convention instead.

## Why it matters

Agent configuration has the same failure modes as LLM prompts:

- **Silent regression** — editing a skill changes behavior without any signal that something broke
- **Trigger mismatch** — a skill's `description:` doesn't match when agents actually invoke it
- **Ambiguous rules** — vague language in `AGENTS.md` causes inconsistent agent behavior
- **Coverage gaps** — instructions work for common cases but fail silently on edge cases

Unlike code, agent configuration has no type-checker, no linter, and no test runner built in. Correctness is measured by whether the agent does the right thing in real situations — which requires explicit evaluation.

## Evaluation

[ACES (Agent Config Evaluation System)](/aces/overview/) provides layered evaluation for agent configuration:

1. **Structural** — does the artifact have the required fields and format?
2. **Trigger** — does the agent correctly identify when to invoke this artifact?
3. **Behavior** — when invoked, does the agent follow the steps and rules?
4. **Quality** — is the output the agent produces actually good?

## Related

- [ACES Overview](/aces/overview/) — eval system for agent configuration
- [Governances](/concepts/governances/) — normative domain standards
- [Disciplines](/concepts/disciplines/) — always-on behavioral habits
- [Permissions](/concepts/permissions/) — tool capability boundaries
- [Constraints](/concepts/constraints/) — hard behavioral limits and guardrails
- [Persona](/concepts/persona/) — bundled agent identity + permissions + constraints
- [Commit Discipline](/disciplines/commit-discipline/) — example of an always-on discipline
- [init skill](/skills/init/) — sets up `AGENTS.md` for a repo
