# AGENTS.md

This file provides guidance to AI coding assistants when working with code in this repository.

## Skill Augmentations

When reading any `SKILL.md` file, always check whether a `SKILL.local.md` exists in the same directory. If it does, treat its contents as additional instructions that extend the base skill. Local augmentations take precedence over the base skill where they conflict.

**Runtime hooks (this repo):** commit discipline is registered in `.claude/settings.json`. To re-register after changes, from the repo root:

```bash
pnpm build
node bin/cyber-skills.mjs hook register \
  --name commit-discipline --event SessionStart \
  --extract AGENTS.md --heading "Commit Discipline"
```

Augmentations apply when a skill is loaded, per the **Skill Augmentations** rule above. Hooks run via `npx cyber-skills@<version> hook run --file|--glob|--extract`.

When writing or editing any `SKILL.md` under `.agents/skills/`, always include `metadata: internal: true` in the frontmatter.

## Commit Discipline

**Auto-commit rule:** When a unit of work is complete and verified, commit it immediately — do not wait for the user to ask. Batching multiple units into one commit, or finishing all work before committing, are both violations of this rule.

**Unit of work:** one coherent, independently revertable change — one domain's refactor, one feature, one bugfix, one test suite expansion for one concern, one config change. Never two unrelated concerns in the same commit. A TDD red-green-refactor cycle alone is not a commit boundary; commit when the full intended change is complete and tests pass. If the working tree has unrelated changes, leave them unstaged — commit the current unit first, then continue.

- Conventional Commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`
- One concern per commit; never batch unrelated changes
- Stage only files for this unit: `git add <files>`, then verify with `git diff --cached`
- Never use `git add .`, `git add -A`, or `git add -p` (interactive commands agents cannot run)
- Never commit with red tests; run validation commands first

### References

- **`commit-work` skill** — staging, splitting, and message writing when committing

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
node bin/cyber-skills.mjs audit validate --path skills/my-skill
```

Repair repo-private skills after `npx skills update` or other drift:

```bash
pnpm repair:private-skills
```

Full quality review (Q6–Q13, E3–E5, E7–E8, P1–P3) requires running the `audit-skill` agent skill.

Run a single test file:

```bash
pnpm vitest run src/audit/validate.test.ts
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
- `src/` — TypeScript source; domain folders: `audit/`, `awesome/`, `commit/`, `governance/`, `hook/`, `skill/`
- `governances/` — version-pinned agent-tool contracts shipped with the npm package; load via `cyber-skills governance show <name>`
- `docs/adr/` — architecture decision records
- `docs/research/` — background surveys linked from ADRs and governances (not loaded via CLI)
- `bin/cyber-skills.mjs` — slim tracked shim; delegates to `dist/cli.mjs`
- `dist/cli.mjs` — single bundled CLI (gitignored, built by tsdown); commands: `audit`, `awesome`, `commit`, `governance`, `hook`, `skill`
- `skills/` — public skills shipped with the package

**Skill lifecycle:** Skills are authored in `skills/<name>/SKILL.md`, validated by `audit-skill`, and surfaced to agents via the `skills` CLI or `npx skills add`. Runtime behavior (commit discipline) is handled by instruction hooks registered in `.claude/settings.json` and `.cursor/hooks.json`. Local skill augmentations (`SKILL.local.md`) are applied when a skill is loaded — see **Skill Augmentations** below.

**`cyber-skills` CLI:** Used to register agent hooks and run scripts without adding it as a devDependency. In other repos, invoke via pinned npx with an exact version from `npm view cyber-skills version`. In this repo, build first, then use the local bin. Idempotent.

## Validation After Changes

**Always run the following before committing or pushing any change to a skill:**

```bash
pnpm verify   # runs typecheck + lint + test + test:audit
```

This is required — CI runs `pnpm verify` on every PR that touches `skills/`, `.agents/skills/`, `src/`, or package build config.

## Adding a New Skill

Separate the two axes:

- **Placement** — where the skill lives and who consumes it
- **Pattern** — what sort of workflow the skill encodes

### Skill placement

| Placement | Location | Use case |
|-----------|----------|----------|
| **User** | `~/.agents/skills/<name>/` | Personal skills across all projects |
| **Project private** | `.agents/skills/<name>/` | Contributor tooling scoped to this repo |
| **Project public** | `skills/<name>/` | Shipped with the package; users install via `npx skills add` |

### Skill patterns

| Pattern | Use case |
|---------|----------|
| **Process** | Multi-step workflows where sequence and decisions matter |
| **Tool-based** | Workflows centered on consistent use of tools, systems, or connectors |
| **Standard** | Skills that enforce tone, structure, formatting, or quality bars |

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

- **Agent-first** — dense, self-contained bodies; no links to other repository files; optional depth in References via `governance show` or skill-sibling files
- **No rationale prose** — do not include `## Why` sections or causal "because…" explanation in skill bodies; ADRs record why
- **Decisions over documentation** — encode what to decide and how, not reference material the model already knows
- **Narrow and composable** — one workflow per skill; user-facing skills match situations, sub-skills are called explicitly by other skills
- **No baked-in opinions** — detect the user's setup at runtime rather than assuming a specific stack

Full authoring rules: `npx cyber-skills@<version> governance show skill-design` (after build in this repo).
