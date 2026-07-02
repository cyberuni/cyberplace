---
title: governance
description: List and display version-pinned governance documents.
---

Load version-pinned agent-tool contracts that ship with the `cyberplace` package.

## Commands

### `governance list`

List all available governances:

```bash
npx cyberplace@<version> governance list
npx cyberplace@<version> governance list --format agent
npx cyberplace@<version> governance list --format json
```

### `governance show`

Display a governance document. **Agents read stdout** — do not parse it as data; treat it as normative text.

```bash
# Show a governance (human-readable)
npx cyberplace@<version> governance show skill-design

# For agents (terse, lower token cost)
npx cyberplace@<version> governance show skill-design --format agent

# Structured (name, title, body)
npx cyberplace@<version> governance show skill-design --format json
```

**Options:**

| Flag | Description |
| ---- | ----------- |
| `--format <format>` | `text` (default), `agent`, or `json` |

## Available governances

| Name | Description |
| ---- | ----------- |
| `skill-design` | Rules for authoring `SKILL.md` files |
| `skill-repo-structure` | Rules for organizing a skill repository |
| `agent-tool-output` | Rules for CLI and script output consumed by agents |
| `cli-resolution` | Rules for invoking a Node CLI from a skill |
| `universal-plugin` | Format spec for plugins that work across Claude Code, Cursor, and Codex |

See the [Governances section](/governances/overview/) for full details on each.

## Versioning

Governance content is frozen to the installed `cyberplace` version. Running `governance show` with a pinned version always returns the same document, making it safe to reference in hooks and CI.
