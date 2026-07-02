---
title: audit
description: Validate skills against structural, quality, and security checks.
---

Validate skills against mechanical checks: structure (S1–S5), quality (Q1–Q5, Q10–Q11), and security (E1–E2, E6, E9).

## Commands

### `audit validate`

```bash
# Validate all skills in the project
npx cyberplace@<version> audit validate

# Validate a single skill
npx cyberplace@<version> audit validate --path skills/my-skill

# Output for agents
npx cyberplace@<version> audit validate --format agent

# Output for scripts
npx cyberplace@<version> audit validate --format json
```

**Options:**

| Flag | Description |
| ---- | ----------- |
| `--path <path>` | Validate a single skill directory or `SKILL.md` file |
| `--root <path>` | Repo root (defaults to current directory) |
| `--format <format>` | `text` (default), `agent`, or `json` |

## What it checks

| Range | Category | Severity |
| ----- | -------- | -------- |
| S1–S5 | Structure | CRITICAL–MEDIUM |
| Q1–Q5, Q10–Q11 | Quality | HIGH–MEDIUM |
| E1–E2, E6, E9 | Security | CRITICAL–HIGH |

Full review (Q6–Q13, E3–E8, P1–P3) requires the [`audit-skill`](/skills/audit-skill/) agent skill.

## CI integration

```yaml
- run: npx cyberplace@$(npm view cyberplace version) audit validate
```

The command exits non-zero on any CRITICAL or HIGH finding, making it safe to use as a blocking CI check.
