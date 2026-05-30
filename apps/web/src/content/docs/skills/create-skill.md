---
title: create-skill
description: Create a new agent skill — scaffold, audit, and link into detected agents.
---

**Trigger:** "create a new skill", "scaffold a skill", "I want to make a skill for X"

Walks through placement, patterns, scaffolding, auditing, and linking a new `SKILL.md` into the agent tools detected on the machine.

## Step 1 — Choose placement

| Placement | Location | Use case |
| --------- | -------- | -------- |
| **User** | `~/.agents/skills/<name>/` | Personal skills across all projects |
| **Project private** | `.agents/skills/<name>/` | Contributor tooling; must include `metadata: internal: true` |
| **Project public** | `skills/<name>/` | Shipped with a package via `npx skills add` |

## Step 2 — Choose pattern

| Pattern | When to use |
| ------- | ----------- |
| **Process** | Ordered multi-step workflow with decision points |
| **Tool-based** | Consistent use of tools, systems, or connectors |
| **Standard** | Tone, format, structure, or quality enforcement |
| **Persona** | Expert stance loaded opt-in; add `metadata.persona: "true"` |

## Step 3 — Scaffold

If `npx skills` is available:

```bash
npx skills init <name> --dir ~/.agents/skills
```

Otherwise, create manually:

```bash
mkdir -p ~/.agents/skills/<name>
# then write SKILL.md with name, description, and body
```

For project-public skills, also add a `README.md` beside `SKILL.md` (title, when to use, install command).

## Step 4 — Audit

```bash
# Mechanical checks (S1–S5, Q1–Q5, Q10–Q11, E1–E2, E6)
npx cyber-skills@<version> audit validate --path ~/.agents/skills/<name>
```

Fix any CRITICAL findings, then invoke the [`audit-skill`](/skills/audit-skill/) agent skill for full review.

## Step 5 — Link to agents

```bash
npx skills add ~/.agents/skills/<name>
```

Detects installed agents and prompts which ones to link. Falls back to manual symlink if needed:

```bash
ln -sf ~/.agents/skills/<name> ~/.claude/skills/<name>
```

## Design rules

Before writing content, load the skill-design governance:

```bash
npx cyber-skills@<version> governance show skill-design
```

Key principles: agent-first dense body, no rationale prose, decisions over documentation, narrow and composable.

## Install

```bash
npx skills add cyberuni/cyber-skills --skill create-skill -g
```

## Related

- [audit-skill](/skills/audit-skill/) — audit before publishing
- [Skill Design governance](/governances/skill-design/) — authoring rules
