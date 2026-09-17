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
npx cyberplace@<version> governance show universal-plugin

# For agents (terse, lower token cost)
npx cyberplace@<version> governance show universal-plugin --format agent

# Structured (name, title, body)
npx cyberplace@<version> governance show universal-plugin --format json
```

A governance that has moved to another package prints a one-line notice on stderr naming its new owner and exits non-zero. See [Moved governances](#moved-governances).

**Options:**

| Flag | Description |
| ---- | ----------- |
| `--format <format>` | `text` (default), `agent`, or `json` |

## Available governances

| Name | Description |
| ---- | ----------- |
| `universal-plugin` | Format spec for plugins that work across Claude Code, Cursor, and Codex |

See the [Governances section](/governances/overview/) for full details on each.

## Moved governances

These are no longer shipped by `cyberplace`. `governance show` prints a one-line notice naming the new owner and exits non-zero; `governance list` does not list them. The forwarder is kept for one release ([repobuddy/buddy-agent-harness#122](https://github.com/repobuddy/buddy-agent-harness/issues/122)).

| Name | Now owned by | Description |
| ---- | ------------ | ----------- |
| `skill-design` | `cyber-aced` | Rules for authoring `SKILL.md` files |
| `skill-repo-structure` | `cyber-aced` | Rules for organizing a skill repository |
| `agent-tool-output` | `cyber-aced` | Rules for CLI and script output consumed by agents |
| `cli-resolution` | `cyber-aced` | Rules for invoking a Node CLI from a skill |

## Versioning

Governance content is frozen to the installed `cyberplace` version. Running `governance show` with a pinned version always returns the same document, making it safe to reference in hooks and CI.
