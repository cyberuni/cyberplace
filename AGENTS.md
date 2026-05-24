# AGENTS.md

This file provides guidance to AI coding assistants when working with code in this repository.

## What This Repo Is

Opinionated skills, personas, workflows, and roles for AI agents. Unlike `unional/skills` (general-purpose, widely shareable), this repo encodes deliberate personal configurations — how agents should behave, communicate, and make decisions.

## No Build or Test System

Pure markdown. No build, lint, or test commands. The `npx skills` CLI is used by consumers to install skills, not by contributors.

## Adding a New Skill

Create `skills/<skill-name>/SKILL.md` with this structure:

```markdown
---
name: skill-name
description: "One sentence trigger description — WHAT it does, WHEN to invoke it, key situations it handles."
---

# Skill Title

...content...
```

For sub-skills (called by other skills, not triggered by user situation), prefix the description with `"Internal skill:"` to prevent accidental activation.

## Language

Write all content in en-US (American English spelling: "color", "organize", "behavior", etc.).

## Skill Design Principles

- **Decisions over documentation** — encode what to decide and how, not reference material the model already knows
- **Narrow and composable** — one workflow per skill; user-facing skills match situations, sub-skills are called explicitly by other skills
- **No baked-in opinions** — detect the user's setup at runtime rather than assuming a specific stack

## Skill Augmentations

When reading any `SKILL.md` file, always check whether a `SKILL.local.md` exists in the same directory. If it does, treat its contents as additional instructions that extend the base skill. Local augmentations take precedence over the base skill where they conflict.
