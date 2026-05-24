# cyber-skills

[![validate-skills](https://github.com/cyberuni/cyber-skills/actions/workflows/validate-skills.yml/badge.svg)](https://github.com/cyberuni/cyber-skills/actions/workflows/validate-skills.yml)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Opinionated skills, hooks, and workflows for AI agents — Claude Code, Cursor, Codex, and others. Published as an npm package; install skills with the [Skills CLI](https://github.com/vercel-labs/skills).

## Installation

```bash
# Install all public skills globally
npx skills add cyberuni/cyber-skills --all -g

# Install a specific skill
npx skills add cyberuni/cyber-skills --skill init -g

# Install for a specific agent
npx skills add cyberuni/cyber-skills --skill init -a claude-code -g
```

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
| **Hooks** | Runtime hooks for local augmentations, internal-skill marking, and commit discipline |
| **CLI** | `cyber-skills` binary used by skills and available for direct use when needed |

### CLI

For advanced or scripted use:

```sh
npx cyber-skills register-hooks --set init
npx cyber-skills register-hooks --set commit-discipline
npx cyber-skills inject-commit-discipline --commit-skill commit
npx cyber-skills run-hook commit-discipline
```

Pin to a specific version:

```sh
npx cyber-skills@$(npm view cyber-skills version) register-hooks --set init
```

## Skill kinds

The `create-skill` skill helps you create three kinds of skills depending on your use case:

| Kind | Location | Use case |
|------|----------|----------|
| **Global** | `~/.agents/skills/<name>/` | Personal skills available across all your projects |
| **Repo internal** | `.agents/skills/<name>/` | Contributor tooling scoped to one repo (e.g. release helpers, SDK updaters) |
| **Repo public** | `skills/<name>/` | Skills shipped with this package — users install via `npx skills add cyberuni/cyber-skills` |

## Quality

Every PR that touches a skill runs the audit script bundled with `audit-skill`, which mechanically checks structure (S1–S5), quality (Q1–Q5), and security (E1–E2, E6).

```bash
# Run locally
pnpm test:audit

# Audit a single skill
node skills/audit-skill/scripts/validate-skills.mjs --path skills/my-skill
```

Full quality review (Q6–Q9, E3–E5, E7) requires running the `audit-skill` agent skill.

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
