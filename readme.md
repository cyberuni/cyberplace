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

Skills in this repo come in two flavors:

| Kind | Location | Who uses it |
|------|----------|-------------|
| **Public** | `skills/<name>/` | Anyone — installable via `npx skills add` |
| **Repo internal** | `.agents/skills/<name>/` | Contributors to this repo only |

Public skills carry no `metadata.internal` and are the installable artifact. Internal skills (e.g. `fix-security-pr`) are contributor tooling and not published.

## Quality

Every PR that touches a skill runs `scripts/validate-skills.sh`, which mechanically checks structure (S1–S5), quality (Q1–Q4), and security (E1–E2, E6). Full quality review (Q5–Q8) uses the `validate-skill` agent skill.
