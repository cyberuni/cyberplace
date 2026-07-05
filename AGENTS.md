# AGENTS.md

- **scripts:** repository scripts are in `package.json` such as `test` and `verify`

## Commit Discipline

- **Unit of work:** one complete, reviewed, coherent, independently revertable change
- **Auto-commit rule:** commit a unit of work automatically


## Delegation

The higher your tier, the more you delegate. Push the work down, keep your own context for judgment. Brief every child: the context, the why, what done looks like. It starts blank and inherits nothing.

| Model    | Best for             | Delegate?        | Effort |
| -------- | -------------------- | ---------------- | ------ |
| Haiku    | bulk mechanical      | never            | low    |
| Sonnet   | scoped research      | when it helps    | medium |
| Opus 4.8 | multi-step reasoning | on clear benefit | high   |
| Fable 5  | judgment, taste      | by default       | medium |

## Architecture

This repo is a skill library and CLI tool for AI agents (Claude Code, Cursor, Codex).

**Key directories:**

- `packages/cyberplace/skills/` — public skills shipped with the package; users install via `npx skills add cyberuni/cyberplace`
- `.agents/skills/` — repo-internal skills for contributor workflows (changesets, security PRs, repo renames); all must have `metadata: internal: true`
- `packages/cyberplace/src/` — TypeScript source; domain folders: `audit/`, `awesome/`, `commit/`, `governance/`, `hook/`, `skill/`
- `packages/cyberplace/governances/` — version-pinned agent-tool contracts shipped with the npm package; load via `cyberplace governance show <name>`
- `artifacts/adr/` — architecture decision records
- `docs/research/` — distilled background surveys (`YYYY-MM-<topic>.md`) linked from ADRs and governances (not loaded via CLI); `.research/<topic>/` holds the working dossier (topic/evidence/conclusion) the surveys distill from
- `packages/cyberplace/bin/cyberplace.mjs` — slim tracked shim; delegates to `dist/cli.mjs`
- `packages/cyberplace/dist/cli.mjs` — single bundled CLI (gitignored, built by tsdown); commands: `audit`, `awesome`, `commit`, `governance`, `hook`, `skill`

**Skill lifecycle:** Skills are authored in `packages/cyberplace/skills/<name>/SKILL.md`, validated by `improve-skill`, and surfaced to agents via the `skills` CLI or `npx skills add`. Runtime behavior (commit discipline) is handled by instruction hooks registered in `.claude/settings.json` and `.cursor/hooks.json`.

**`cyberplace` CLI:** Used to register agent hooks and run scripts without adding it as a devDependency. In other repos, invoke via pinned npx with an exact version from `npm view cyberplace version`. In this repo, build first, then use the local bin. Idempotent.

## Validation After Changes

**Always run the following before committing or pushing any change to a skill:**

```bash
pnpm verify   # runs typecheck + lint + test + test:audit
```

This is required — CI runs `pnpm verify` on every PR that touches `packages/cyberplace/skills/`, `.agents/skills/`, `packages/cyberplace/src/`, or package build config.

## Adding a New Skill

Separate the two axes:

- **Placement** — where the skill lives and who consumes it
- **Pattern** — what sort of workflow the skill encodes

### Skill placement

| Placement           | Location                             | Use case                                                     |
| ------------------- | ------------------------------------ | ------------------------------------------------------------ |
| **User**            | `~/.agents/skills/<name>/`           | Personal skills across all projects                          |
| **Project private** | `.agents/skills/<name>/`             | Contributor tooling scoped to this repo                      |
| **Project public**  | `packages/cyberplace/skills/<name>/` | Shipped with the package; users install via `npx skills add` |

### Skill patterns

| Pattern        | Use case                                                              |
| -------------- | --------------------------------------------------------------------- |
| **Process**    | Multi-step workflows where sequence and decisions matter              |
| **Tool-based** | Workflows centered on consistent use of tools, systems, or connectors |
| **Standard**   | Skills that enforce tone, structure, formatting, or quality bars      |

Create `packages/cyberplace/skills/<skill-name>/SKILL.md` with this structure:

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

Full authoring rules: `npx cyberplace@<version> governance show skill-design` (after build in this repo).
