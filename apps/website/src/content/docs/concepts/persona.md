---
title: Persona
description: What personas are — agent identity definitions that bundle role, expertise, permissions, and constraints into a named, invocable subagent.
---

**Personas** are agent identity definitions — they encode who an agent is, not what workflow it runs. A persona bundles role framing, expertise, permissions, and constraints into a single named, invocable unit. When a parent agent spawns a subagent, it is instantiating a persona.

**Tagline:** Skills define what to do. Personas define who does it.

## What a persona encodes

A persona is an agent definition file (`agents/*.md`) with two layers:

**Identity layer** (who the agent is):
- Role framing — "you are a senior code reviewer specializing in security"
- Expertise — domain knowledge the agent should apply
- Voice and tone — how the agent communicates

**Capability layer** (what the agent can do and how far it can go):
- `tools` / `disallowedTools` — [permissions](/concepts/permissions/) for this agent
- `maxTurns` / `effort` — [constraints](/concepts/constraints/) for this agent
- `skills` — which skills are available to this agent
- `model` — which model this agent uses

The identity layer shapes behavior through instruction. The capability layer shapes behavior through enforcement.

## Personas vs Skills vs Subagent definitions

These three are often confused:

| | Persona | Skill | Subagent definition |
|---|---|---|---|
| **What it encodes** | Who the agent is | What workflow to run | Same as persona — persona is the term for the concept; subagent definition is the implementation artifact |
| **Activation** | Spawned by parent agent | Invoked by agent matching a situation | Spawned by parent agent |
| **Reusability** | Yes — any agent can spawn it | Yes — any agent can invoke it | Yes |

"Subagent definition" is the file format. "Persona" is the concept. They are the same thing named differently by layer.

## Plugin distribution

Personas travel in the `agents/` directory of a plugin. Installing a plugin that includes agents makes those personas available as named subagents the harness can invoke.

A plugin can both **provide** and **consume** personas:
- **Provide** — `sdd` plugin ships `sdd-judge`, an agent that evaluates spec quality
- **Consume** — `aced` plugin spawns `sdd-judge` as a subagent when evaluating SDD artifacts

This is the primary cross-plugin integration pattern: one plugin's persona becomes a tool in another plugin's workflow.

**In the plugin schema:**

| Schema | Field |
|--------|-------|
| Claude Code | `agents` (path to agent definition files) |
| Open Plugin Spec | `agents` (same pattern) |

**Agent frontmatter fields that define a persona:**

```markdown
---
name: my-agent
description: What this agent specializes in — used by parent agents to decide when to spawn it
model: sonnet
effort: medium
maxTurns: 20
tools: [Read, Bash, WebSearch]
disallowedTools: [Write, Edit]
skills: [code-reviewer]
---

You are a [role framing here]...
```

## Related

- [Permissions](/concepts/permissions/) — tool boundaries bundled in a persona
- [Constraints](/concepts/constraints/) — behavioral limits bundled in a persona
- [Skills](/concepts/skills/) — on-demand workflows a persona can invoke
- [Agent Configuration](/concepts/agent-configuration/) — full picture of what shapes agent behavior
