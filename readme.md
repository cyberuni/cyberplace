# cyber-skills

[![CI](https://github.com/cyberuni/cyber-skills/actions/workflows/pull-request.yml/badge.svg)](https://github.com/cyberuni/cyber-skills/actions/workflows/pull-request.yml)
[![npm version](https://img.shields.io/npm/v/cyber-skills.svg)](https://www.npmjs.com/package/cyber-skills)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Opinionated skills, hooks, and workflows for AI agents — Claude Code, Cursor, Codex, and others. Published as the [`cyber-skills`](https://www.npmjs.com/package/cyber-skills) npm package; install skills with the [Skills CLI](https://github.com/vercel-labs/skills).

## Installation

**Skills** (agent workflows — primary interface):

```bash
# Install all public skills globally
npx skills add cyberuni/cyber-skills --all -g

# Install a specific skill
npx skills add cyberuni/cyber-skills --skill init -g

# Install for a specific agent
npx skills add cyberuni/cyber-skills --skill init -a claude-code -g
```

**CLI** (hooks, commit inject, audit — used by skills and for scripting):

```bash
npx cyber-skills@latest --help
```

Pin to a released version in scripts: `npx cyber-skills@$(npm view cyber-skills version) <subcommand>`.

## Getting started: `init` and `init-commit-discipline`

These skills set up a repo for AI agents. Install them **globally** once, then run them per repository from your agent chat.

```bash
# Recommended: both init skills globally
npx skills add cyberuni/cyber-skills --skill init --skill init-commit-discipline -g
```

| Skill | Install scope | When to run |
| ----- | ------------- | ----------- |
| **`init`** | Global (`-g`) | First time in a repo, or when `AGENTS.md` needs a refresh |
| **`init-commit-discipline`** | Global (`-g`) | After `init`, when you want commit rules enforced in every session |

### 1. Run `init`

In Claude Code, Cursor, or another agent, ask to **run the `init` skill** (or "initialize AGENTS.md for this repo"). The skill will:

- Create or improve **`AGENTS.md`** — Skill Augmentations first, then commands, architecture, and other grounded sections
- **Symlink `CLAUDE.md` → `AGENTS.md`** so Claude Code picks up the same guidance
- Ensure repo-internal skills under `.agents/skills/` include `metadata: internal: true`
- List companion `init-*` skills (including `init-commit-discipline`) and ask whether to run any of them

If `AGENTS.md` already exists, the skill compares proposed changes and asks before overwriting substantive content.

### 2. Run `init-commit-discipline`

Run this **after `init`**. Ask your agent to **run the `init-commit-discipline` skill**. The skill will:

1. **Resolve a commit helper skill** — checks for an installed helper (`commit-work`, bundled `commit`, etc.) and asks you to choose if none is found
2. **Ask about auto-commit** — whether the agent should commit each completed unit of work without waiting for you to ask
3. **Inject `## Commit Discipline` into `AGENTS.md`** — unit-of-work rules, Conventional Commits, staging guidance, and a pointer to the chosen commit helper
4. **Register a SessionStart hook** — on Claude Code, Cursor, and Codex, reinjects the Commit Discipline section at the start of every session

If you choose the bundled fallback commit helper, install it **project-scoped** (not global):

```bash
npx skills add cyberuni/cyber-skills --skill commit
```

For agents without hook support, the AGENTS.md section alone applies the rules.

Both skills use the `cyber-skills` CLI under the hood (pinned `npx cyber-skills@<version>`). You normally invoke them through your agent; see [Package contents](#package-contents) for direct CLI use.

## Public skills

| Skill | Description |
| ----- | ----------- |
| **[init](skills/init/SKILL.md)** | Initialize a new AGENTS.md with codebase documentation, then symlink CLAUDE.md to it. |
| **[init-commit-discipline](skills/init-commit-discipline/SKILL.md)** | Inject commit discipline into AGENTS.md and register SessionStart hooks where supported. |
| **[commit](skills/commit/SKILL.md)** | Minimal Conventional Commits helper — staging, messages, one concern per commit. |
| **[create-skill](skills/create-skill/SKILL.md)** | Create a new agent skill — determines whether it should be global, repo internal, or repo public. |
| **[skillify](skills/skillify/SKILL.md)** | Generalize a workflow from the current session into a reusable SKILL.md. |
| **[patch-skill](skills/patch-skill/SKILL.md)** | Contribute local improvements to an installed skill back to its source repo via PR. |
| **[find-awesome-skill](skills/find-awesome-skill/SKILL.md)** | Search curated awesome lists for skill and skill-repo recommendations with exact install commands. |
| **[update-awesome-list](skills/update-awesome-list/SKILL.md)** | Add or update a curated awesome-list entry, then sync the README section. |
| **[configure-awesome-sources](skills/configure-awesome-sources/SKILL.md)** | Manage the layered awesome-list sources used for curated skill discovery. |
| **[audit-skill](skills/audit-skill/SKILL.md)** | Audit a SKILL.md for structure, quality, and security before installing or publishing. |

## Package contents

Beyond the skill files, the package also ships a `cyber-skills` CLI and runtime hooks. Some skills (for example `init-commit-discipline`) use these under the hood; you normally do not need to invoke the CLI yourself.

| Layer | Purpose |
| ----- | ------- |
| **Skills** | Public agent skills under `skills/` — the primary interface |
| **Hooks** | SessionStart instruction hooks for commit discipline (`hook register` / `hook run`) |
| **CLI** | `cyber-skills` binary used by skills and available for direct use when needed |
| **Governances** | Version-pinned agent-tool contracts (`governance list` / `governance show`) |

### CLI

For advanced or scripted use:

```sh
npx cyber-skills hook register \
  --name commit-discipline --event SessionStart \
  --extract AGENTS.md --heading "Commit Discipline"
npx cyber-skills commit inject --commit-skill commit
npx cyber-skills hook run --extract AGENTS.md --heading "Commit Discipline"
```

Pin to a specific version:

```sh
npx cyber-skills@$(npm view cyber-skills version) hook register \
  --name commit-discipline --event SessionStart \
  --extract AGENTS.md --heading "Commit Discipline"
```

Skill augmentations (`SKILL.local.md`) apply when a skill is loaded — see AGENTS.md **Skill Augmentations**.

## Skill kinds

The `create-skill` skill helps you create three kinds of skills depending on your use case:

| Kind | Location | Use case |
|------|----------|----------|
| **Global** | `~/.agents/skills/<name>/` | Personal skills available across all your projects |
| **Repo internal** | `.agents/skills/<name>/` | Contributor tooling scoped to one repo (e.g. release helpers, SDK updaters) |
| **Repo public** | `skills/<name>/` | Skills shipped with this package — users install via `npx skills add cyberuni/cyber-skills` |

## Quality

Every PR runs `pnpm verify` (typecheck, lint, tests, and skill audit). The audit script bundled with `audit-skill` mechanically checks structure (S1–S5), quality (Q1–Q5, Q10–Q11), and security (E1–E2, E6).

```bash
# Run locally
pnpm test:audit

# Audit a single skill
node bin/cyber-skills.mjs audit validate --path skills/my-skill
```

Full quality review (Q6–Q12, E3–E5, E7–E8, P1–P3) requires running the `audit-skill` agent skill.

Architecture decisions are recorded in [docs/adr/](docs/adr/) — see [ADR-0001: Governance vs Discipline Taxonomy](docs/adr/0001-governance-vs-discipline-taxonomy.md).

<!-- AWESOME-SKILLS:START -->
## Awesome Skills

### Authored

- `cyberuni/cyber-skills` — targeted
  Opinionated agent behavior and skill-authoring workflows for Claude Code, Codex, Cursor, and similar agents.
  Why recommended: Good defaults for small focused skill repos and disciplined skill authoring.
  Tags: `opinionated`, `public-repo`, `skill-authoring`, `targeted`, `validation`
  Install: `npx skills add cyberuni/cyber-skills`
  Highlights:
  - `skill:init` — Create or improve AGENTS.md and carry forward local skill augmentation guidance.
  - `skill:create-skill` — Create a new skill and place it in the right global, repo-internal, or repo-public location.
  - `skill:audit-skill` — Audit SKILL.md structure, quality, and security before installing or publishing.
<!-- AWESOME-SKILLS:END -->
