# agent-helmsman

[![validate-skills](https://github.com/cyberuni/agent-helmsman/actions/workflows/validate-skills.yml/badge.svg)](https://github.com/cyberuni/agent-helmsman/actions/workflows/validate-skills.yml)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Opinionated skills, personas, workflows, and roles for AI agents — Claude Code, Cursor, Codex, and others.

Where `unional/skills` encodes general-purpose workflows any team can use, `agent-helmsman` is the helm: deliberate, opinionated configurations that shape how AI agents behave, communicate, and make decisions.

## Public skills

Install any of these with `npx skills add cyberuni/agent-helmsman`.

| Skill | Description |
| ----- | ----------- |
| **[init](skills/init/SKILL.md)** | Initialize a new AGENTS.md with codebase documentation, then symlink CLAUDE.md to it. |
| **[create-skill](skills/create-skill/SKILL.md)** | Create a new agent skill — determines whether it should be global, repo internal, or repo public. |
| **[find-awesome-skill](skills/find-awesome-skill/SKILL.md)** | Search curated awesome lists for skill and skill-repo recommendations with exact install commands. |
| **[update-awesome-list](skills/update-awesome-list/SKILL.md)** | Add or update a curated awesome-list entry, then sync the README section. |
| **[configure-awesome-sources](skills/configure-awesome-sources/SKILL.md)** | Manage the layered awesome-list sources used for curated skill discovery. |
| **[validate-skill](skills/validate-skill/SKILL.md)** | Validate a SKILL.md for structure, quality, and security before committing or publishing. |

## Installation

```bash
# Install all public skills globally
npx skills add cyberuni/agent-helmsman --all -g

# Install a specific skill
npx skills add cyberuni/agent-helmsman --skill init -g

# Install for a specific agent
npx skills add cyberuni/agent-helmsman --skill init -a claude-code -g
```

## Skill kinds

The `create-skill` skill helps you create three kinds of skills depending on your use case:

| Kind | Location | Use case |
|------|----------|----------|
| **Global** | `~/.agents/skills/<name>/` | Personal skills available across all your projects |
| **Repo internal** | `.agents/skills/<name>/` | Contributor tooling scoped to one repo (e.g. release helpers, SDK updaters) |
| **Repo public** | `skills/<name>/` | Skills shipped with a package — users install via `npx skills add <owner>/<repo>` |

## Quality

Every PR that touches a skill runs the validation script bundled with `validate-skill`, which mechanically checks structure (S1–S5), quality (Q1–Q4), and security (E1–E2, E6).

```bash
# Run locally
npm run validate

# Validate a single skill
npx tsx skills/validate-skill/scripts/validate-skills.mts --path skills/my-skill
```

Full quality review (Q5–Q8, E3–E5, E7) requires running the `validate-skill` agent skill.

<!-- AWESOME-SKILLS:START -->
## Awesome Skills

### Authored

- `cyberuni/agent-helmsman` — targeted
  Opinionated agent behavior and skill-authoring workflows for Claude Code, Codex, Cursor, and similar agents.
  Why recommended: Good defaults for small focused skill repos and disciplined skill authoring.
  Tags: `opinionated`, `public-repo`, `skill-authoring`, `targeted`, `validation`
  Install: `npx skills add cyberuni/agent-helmsman`
  Highlights:
  - `skill:init` — Create or improve AGENTS.md and carry forward local skill augmentation guidance.
  - `skill:create-skill` — Create a new skill and place it in the right global, repo-internal, or repo-public location.
  - `skill:validate-skill` — Validate SKILL.md structure, quality, and security before commit or publication.
<!-- AWESOME-SKILLS:END -->
