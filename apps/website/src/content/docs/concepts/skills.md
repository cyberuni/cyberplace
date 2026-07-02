---
title: Skills
description: What skills are — on-demand workflow instructions an agent loads when it matches a situation, and how they differ from personas and governances.
---

**Skills** are on-demand workflow instructions — they encode what to do, not who does it. A skill is a `SKILL.md` file the agent loads when its `description` matches the current situation; unlike a persona, invoking a skill does not spawn a new agent identity, it adds instructions to whichever agent is already running.

**Tagline:** Skills define what to do. [Personas](/concepts/persona/) define who does it.

## What a skill encodes

A `SKILL.md` file has two parts:

- **`description` frontmatter** — the only field loaded at startup; it carries the entire triggering burden. A well-formed description states the capability, "Use this skill when…", and at least one implicit phrasing an agent might not otherwise connect to the trigger.
- **Body** — the workflow itself: numbered steps for a process skill, tool usage and guardrails for a tool-based skill, or rules and pass conditions for a standard (tone/format/quality) skill.

Skills stay narrow and composable by design: one workflow per skill. A skill that other skills call internally, rather than one a user triggers directly, prefixes its description with `"Internal skill:"` so it never self-activates on a user request.

## Placement

| Placement | Location | Use case |
| --------- | -------- | -------- |
| **User** | `~/.agents/skills/<name>/` | Personal skills across all projects |
| **Project private** | `.agents/skills/<name>/` | Contributor tooling scoped to one repo |
| **Project public** | `skills/<name>/` | Shipped with a package; users install via `npx skills add` |

## Skills vs Personas vs Governances

These three are often confused:

| | Skill | Persona | Governance |
|---|---|---|---|
| **What it encodes** | What workflow to run | Who the agent is | What correct looks like for a domain |
| **Activation** | Invoked by the agent matching a situation | Spawned as a new subagent | Loaded on demand, e.g. via `governance show` |
| **Changes agent identity?** | No — runs in the current agent's context | Yes — a new role, expertise, and capability bundle | No — a reference document, never executed as steps |

A skill can *invoke* a persona (spawning a subagent for part of its workflow) and can *load* a governance (reading its rules before acting), but a skill is neither of those things itself.

## Plugin distribution

Skills travel in the `skills` field of a plugin manifest. Installing a plugin that includes skills makes them available to the agent runtime — the description is scanned at startup, the body is loaded only once the skill activates.

**In the plugin schema:**

| Schema | Field |
|--------|-------|
| Claude Code | `skills` (path to `SKILL.md` files) |
| Open Plugin Spec | `skills` (same pattern) |

**Frontmatter fields that define a skill:**

```markdown
---
name: my-skill
description: Use this skill when <trigger>. <One-line capability summary.>
---

# My Skill

## When to use
<the trigger condition, restated for the body>

## Instructions
1. <step>
2. <step>
```

## Related

- [Persona](/concepts/persona/) — bundled agent identity a skill can invoke as a subagent
- [Governances](/concepts/governances/) — normative rules a skill loads to stay aligned
- [Agent Configuration](/concepts/agent-configuration/) — full picture of what shapes agent behavior
- [Skills Overview](/skills/overview/) — the skills shipped with this repo
