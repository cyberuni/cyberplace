# AGENTS.md

This file provides guidance to AI coding assistants when working with code in this repository.

## Commands

Run all tests:

```bash
pnpm test
```

Audit all skills (runs S1–S5, Q1–Q4, E1–E2, E6 checks mechanically):

```bash
pnpm test:audit

# Audit a single skill:
npx tsx skills/audit-skill/scripts/validate-skills.mts --path skills/my-skill
```

Run a single test file:

```bash
npx tsx --test tests/audit-skill/scripts/validate-skills.test.mts
```

Regenerate the README awesome-skills section after editing `awesome-skills.json`:

```bash
pnpm render:awesome-list
```

## Validation After Changes

**Always run the following before committing or pushing any change to a skill:**

```bash
pnpm test
pnpm test:audit
```

This is required — CI runs `validate` on every PR that touches `skills/` or `.agents/skills/`.

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
