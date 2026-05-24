# AGENTS.md

This file provides guidance to AI coding assistants when working with code in this repository.

## Commands

Run everything (typecheck + lint + tests + audit) before pushing:

```bash
pnpm verify
```

Run all tests:

```bash
pnpm test
```

Type-check only:

```bash
pnpm typecheck
```

Lint (and auto-fix) with Biome:

```bash
pnpm lint        # check only
pnpm check       # check and auto-fix
```

Audit all skills (runs S1–S5, Q1–Q5, Q10–Q11, E1–E2, E6 checks mechanically):

```bash
pnpm test:audit

# Audit a single skill:
npx tsx skills/audit-skill/scripts/validate-skills.mts --path skills/my-skill
```

Full quality review (Q6–Q12, E3–E5, E7–E8, P1–P3) requires running the `audit-skill` agent skill.

Run a single test file:

```bash
pnpm vitest run tests/audit-skill/scripts/validate-skills.test.mts
```

Regenerate the README awesome-skills section after editing `awesome-skills.json`:

```bash
pnpm render:awesome-list
```

## Validation After Changes

**Always run the following before committing or pushing any change to a skill:**

```bash
pnpm verify   # runs typecheck + lint + test + test:audit
```

This is required — CI runs `validate` on every PR that touches `skills/` or `.agents/skills/`.

## Commit Discipline

Commit every self-contained unit of work — code, config, skills — as its own commit before moving on.

- Conventional Commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`
- One concern per commit; never batch unrelated changes
- Use `git add -p` for mixed changes in one file
- Never commit with red tests; run validation commands first
- Use the `commit-work` skill for guidance on staging and message writing

## Adding a New Skill

Three kinds of skills exist depending on scope:

| Kind | Location | Use case |
|------|----------|----------|
| **Global** | `~/.agents/skills/<name>/` | Personal skills across all projects |
| **Repo internal** | `.agents/skills/<name>/` | Contributor tooling scoped to this repo |
| **Repo public** | `skills/<name>/` | Shipped with the package; users install via `npx skills add` |

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
