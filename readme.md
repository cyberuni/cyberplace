# cyber-skills

[![CI](https://github.com/cyberuni/cyber-skills/actions/workflows/pull-request.yml/badge.svg)](https://github.com/cyberuni/cyber-skills/actions/workflows/pull-request.yml)
[![npm version](https://img.shields.io/npm/v/cyber-skills.svg)](https://github.com/cyberuni/cyber-skills/actions/workflows/release.yml)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Skills for AI coding agents. Install the skill once, then ask your agent to use it in a repo.

`cyber-skills` is published as an npm package and ships:

- Public skills under `skills/`
- A `cyber-skills` CLI used by some skills under the hood
- Hook helpers for agents that support session hooks

## What users do with this repo

Most users do not call the CLI directly. The common workflow is:

1. Install one or more skills with the [Skills CLI](https://github.com/vercel-labs/skills).
2. Open your project in Claude Code, Cursor, Codex, or another agent.
3. Ask the agent to run the skill by name.
4. Commit the resulting project files such as `AGENTS.md`, `.agents/cyber-skills-lock.json`, or repo-private skills.

Example prompts:

- `Run the init skill for this repo`
- `Run init-commit-discipline`
- `Use create-skill to scaffold a new repo-private skill`
- `Use audit-skill on skills/my-skill`

## Quick start

Install the two skills most teams start with:

```bash
# Solo use across many repos
npx skills add cyberuni/cyber-skills --skill init --skill init-commit-discipline -g

# Team use inside one repo
npx skills add cyberuni/cyber-skills --skill init --skill init-commit-discipline
```

Then, in your agent chat inside a repository:

1. Run `init`
2. Review or accept the `AGENTS.md` update
3. Run `init-commit-discipline`

If you installed project-scoped skills, commit `.agents/cyber-skills-lock.json`.

## How to use the main skills

### `init`

Ask your agent to run `init` when a repo needs agent instructions.

What it does:

- Creates or improves `AGENTS.md`
- Puts **Skill Augmentations** first so agents merge `SKILL.md`, `SKILL.project.md`, and `SKILL.local.md` correctly
- Adds grounded repo guidance such as commands and architecture
- Symlinks `CLAUDE.md` to `AGENTS.md` where appropriate
- Repairs `.agents/skills/` metadata when needed

Use it:

- In a new repo
- When `AGENTS.md` is missing
- When `AGENTS.md` is outdated or too generic

### `init-commit-discipline`

Ask your agent to run `init-commit-discipline` after `init`.

What it does:

- Adds a `Commit Discipline` section to `AGENTS.md`
- Selects or asks for a commit helper skill
- Optionally enables auto-commit rules
- Registers a SessionStart hook on supported agents so the rule is re-injected every session

If you want the bundled fallback commit helper:

```bash
npx skills add cyberuni/cyber-skills --skill commit
```

### Other public skills

| Skill | Use it when you want to... |
| ----- | -------------------------- |
| **[commit](skills/commit/SKILL.md)** | enforce small, conventional commits |
| **[create-skill](skills/create-skill/SKILL.md)** | scaffold a new user, project-private, or project-public skill |
| **[skillify](skills/skillify/SKILL.md)** | turn a workflow from the current session into a reusable skill |
| **[patch-skill](skills/patch-skill/SKILL.md)** | send local skill improvements back upstream |
| **[find-awesome-skill](skills/find-awesome-skill/SKILL.md)** | find relevant third-party skills with install commands |
| **[update-awesome-list](skills/update-awesome-list/SKILL.md)** | update this repo's curated recommendations |
| **[configure-awesome-sources](skills/configure-awesome-sources/SKILL.md)** | manage the registries used by curated skill discovery |
| **[audit-skill](skills/audit-skill/SKILL.md)** | review a skill for structure, quality, and security before publishing |

## Project layout

This is the main part contributors and adopters need to understand.

### Skill placement

| Placement | Location | Purpose |
| --------- | -------- | ------- |
| **User** | `~/.agents/skills/<name>/` | Personal skills available across all repos |
| **Project private** | `.agents/skills/<name>/` | Repo-specific contributor workflows not meant for package consumers |
| **Project public** | `skills/<name>/` in the source repo | Skills authored in a package/repo and installed by others |

For a consuming project, project-scoped installs are written to `.agents/skills/<name>/`.
The root `skills/<name>` path is only a compatibility symlink back to `.agents/skills/<name>/` when that path is free.

### Recommended layout in a project

```text
your-repo/
├── AGENTS.md
├── CLAUDE.md -> AGENTS.md
├── .agents/
│   ├── cyber-skills-lock.json
│   └── skills/
│       ├── init/
│       │   ├── SKILL.md
│       │   ├── README.md
│       │   ├── scripts/
│       │   ├── references/
│       │   └── assets/
│       └── release-helper/
│           ├── SKILL.md
│           ├── SKILL.project.md
│           └── scripts/
└── skills/
    └── init -> .agents/skills/init
```

Use this layout as a rule of thumb:

- Put shared repo instructions in `AGENTS.md`
- Treat `.agents/skills/<name>/` as the canonical installed location for a skill and its sibling files
- Expect sibling folders such as `scripts/`, `assets/`, and `references/` to live inside `.agents/skills/<name>/`
- Treat `skills/<name>` in a consuming project as an optional symlink, not the source of truth
- Put team-only workflows in `.agents/skills/`
- Author installable/public skills in `skills/` when you are building a source repo for others to install from
- Keep `SKILL.local.md` local and uncommitted
- Use `SKILL.project.md` only in the consuming project, not inside a published public skill
- Do not expect `.agents/governances/` or a shared `.agents/assets/` tree from `skills add`; governances are loaded from the installed `cyber-skills` CLI package, and assets stay inside each skill directory

### Skill augmentations

When a skill is loaded, the layers merge in this order:

1. `SKILL.md`
2. `SKILL.project.md`
3. `SKILL.local.md`

Higher layers override lower ones.

This lets you:

- Keep a reusable base skill in source control
- Add team-specific overrides in the project
- Add machine-local tweaks without committing them

## Install patterns

### Global install

Best for one person using the same skills across many repos.

```bash
npx skills add cyberuni/cyber-skills --all -g
```

### Project-scoped install

Best for teams that want the same skill set in one repository.

```bash
npx skills add cyberuni/cyber-skills --skill init --skill init-commit-discipline
```

Commit `.agents/cyber-skills-lock.json` so the team restores the same skill sources.

### Agent-specific install

If you want a skill available only in one host:

```bash
npx skills add cyberuni/cyber-skills --skill init -a claude-code -g
```

## Direct CLI use

Most people can skip this section.

The CLI is useful for scripts, audits, and hook registration:

```bash
# Explore commands
npx cyber-skills@latest --help

# Pinned manual use
npx cyber-skills@$(npm view cyber-skills version) audit validate --path skills/my-skill
```

Common direct commands:

- `governance show` to load version-pinned guidance
- `audit validate` to run mechanical skill checks
- `hook register` and `hook run` for hook-backed workflows
- `skill repair-private` to fix `.agents/skills/` metadata

## For contributors to this repo

Before pushing changes here:

```bash
pnpm verify
```

Useful local commands:

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm test:audit
node bin/cyber-skills.mjs audit validate --path skills/my-skill
```

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
  - `skill:create-skill` — Create a new skill and place it in the right user, project-private, or project-public location.
  - `skill:audit-skill` — Audit SKILL.md structure, quality, and security before installing or publishing.
<!-- AWESOME-SKILLS:END -->
