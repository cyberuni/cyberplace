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
node skills/audit-skill/scripts/validate-skills.mjs --path skills/my-skill
```

Full quality review (Q6–Q12, E3–E5, E7–E8, P1–P3) requires running the `audit-skill` agent skill.

Run a single test file:

```bash
pnpm vitest run src/skills/audit-skill/scripts/validate-skills.test.ts
```

Regenerate the README awesome-skills section after editing `awesome-skills.json`:

```bash
pnpm render:awesome-list
```

## Architecture

This repo is a skill library and CLI tool for AI agents (Claude Code, Cursor, Codex).

**Key directories:**

- `skills/` — public skills shipped with the package; users install via `npx skills add cyberuni/cyber-skills`
- `.agents/skills/` — repo-internal skills for contributor workflows (changesets, security PRs, repo renames); all must have `metadata: internal: true`
- `src/` — TypeScript source for the CLI, hooks, skill scripts, and co-located tests
- `hooks/` — built runtime hook scripts published with the package
- `bin/cyber-skills.mjs` — built CLI entry point; supports `run-hook`, `register-hooks --set <set>`, and `inject-commit-discipline`
- `skills/` — public skills shipped with the package, including built helper scripts under `skills/*/scripts/`

**Skill lifecycle:** Skills are authored in `skills/<name>/SKILL.md`, validated by `audit-skill`, and surfaced to agents via the `skills` CLI or `npx skills add`. Runtime behavior (local augmentations, marking internal skills) is handled by hooks registered in `.claude/settings.json` and `.cursor/settings.json`.

**`cyber-skills` CLI:** Used to register agent hooks into agent settings files without adding it as a devDependency. In other repos, invoke via pinned npx with an exact version from `npm view cyber-skills version`. In this repo, build first, then use the local bin: `node bin/cyber-skills.mjs register-hooks --set init`. Idempotent.

## Validation After Changes

**Always run the following before committing or pushing any change to a skill:**

```bash
pnpm verify   # runs typecheck + lint + test + test:audit
```

This is required — CI runs `validate` on every PR that touches `skills/` or `.agents/skills/`.

## Commit Discipline

Commit every self-contained unit of work — code, config, skills — as its own commit before moving on.

**Unit of work:** one coherent, independently revertable change — one domain's refactor, one feature, one bugfix, one test suite expansion for one concern, one config change. Never two unrelated concerns in the same commit. A TDD red-green-refactor cycle alone is not a commit boundary; commit when the full intended change is complete and tests pass. If the working tree has unrelated changes, leave them unstaged — commit the current unit first, then continue.

- Conventional Commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`
- One concern per commit; never batch unrelated changes
- Stage only files for this unit: `git add <files>`, then verify with `git diff --cached`
- Never use `git add .`, `git add -A`, or `git add -p` (interactive commands agents cannot run)
- Never commit with red tests; run validation commands first
- Use the `commit-work` skill when committing (staging, splitting, message writing)

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

**Runtime hooks (this repo):** registered in `.claude/settings.json`. To re-register after changes, from the repo root:

```bash
pnpm build
node bin/cyber-skills.mjs register-hooks --set init
```

That registers:

- **`inject-local-augmentations.sh`** (SessionStart) — injects `.agents/skills/**/SKILL.local.md` into session context at startup
- **`mark-internal.sh`** (PostToolUse/afterFileEdit) — adds `metadata: internal: true` to any `SKILL.md` written under `.agents/skills/`

Hook scripts live in `.agents/hooks/`. Re-run registration after adding agents or changing hook sets.
