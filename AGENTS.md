# AGENTS.md

- **scripts:** repository scripts are in `package.json` such as `test` and `verify`

## Commit Discipline

- **Unit of work:** one complete, reviewed, coherent, independently revertable change
- **Auto-commit rule:** commit a unit of work automatically

## Delegation

If this harness can spawn subagents, delegate the mechanical work and the research whose answer is far smaller than the reading behind it.

Size the job, not the step. A job made of many routine steps, or of waiting on something outside you, goes to a subagent as one job, even when each step alone is quicker to do than to brief. Do a job yourself only when the whole of it is quicker than the brief.

Split the job by what each part needs. The routine run goes to a cheaper subagent, told what counts as routine and to stop and report anything else instead of guessing. A hard part, such as a diagnosis, goes to whichever model can do it best, which may be a stronger subagent than you. Keep the decisions, such as what matters most, which option to take, or whether a result is good enough: they rest on what the user asked for and approved, which only you know. While a subagent runs, do not poll it or redo its work; handle its report when it arrives.

A subagent inherits your model if you do not pick one, and none of your context either way. Pick the cheapest, unless you cannot say what a right answer looks like or could not cheaply tell a wrong one. Where you can set its effort, pick the lowest, unless you could not write down the steps that reach that answer. Give it the context, the why, and what done looks like. Name the actions the user has authorized and the ones it must not take, since the subagent never saw the user say either.

## Architecture

This repo is a skill library and CLI tool for AI agents (Claude Code, Cursor, Codex).

**Key directories:**

- `packages/cyberplace/skills/` — public skills shipped with the package; users install via `npx skills add cyberuni/cyberplace`
- `.agents/skills/` — repo-internal skills for contributor workflows (changesets, security PRs, repo renames); all must have `metadata: internal: true`
- `packages/cyberplace/src/` — TypeScript source; domain folders: `audit/`, `awesome/`, `commit/`, `governance/`, `hook/`, `skill/`
- `packages/cyberplace/governances/` — version-pinned agent-tool contracts shipped with the npm package; load via `cyberplace governance show <name>`
- `artifacts/adr/` — architecture decision records
- `.research/<topic>/` — background research dossiers (`topic` / `evidence` / `conclusion` / `changes`) linked from ADRs and governances (not loaded via CLI); `conclusion.md` is the file other documents cite
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

For **name-only skills** (loaded **by name** by another skill, never matched to a user situation), set the description to exactly `"By name only"` and nothing else. The minimal description is the mechanism, not a label: the description is the only surface the model matches against, so anything added to it is another handle for a spurious match. Identity — what the skill is, who calls it, what it returns — goes in the body and README.

`user-invocable` is a **visibility** flag only: it controls whether a skill appears in the user's command list and never determines how a skill is selected. A skill may legitimately be `user-invocable: false` and still situationally triggered. Both are distinct from `metadata: internal: true`, which marks a _project-local internal_ skill (marketplace visibility). See [ADR-0031](artifacts/adr/0031-selection-is-not-visibility.md).

## Language

Write all content in en-US (American English spelling: "color", "organize", "behavior", etc.).
