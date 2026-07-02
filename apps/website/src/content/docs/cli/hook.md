---
title: hook
description: Register and run SessionStart instruction hooks for agents.
---

Manage instruction hooks — register them into agent settings files and run them to inject context at session start.

## Commands

### `hook register`

Register a hook into agent settings (Claude Code, Cursor, Codex). Idempotent — re-running with the same flags updates the hook if the pinned version differs.

```bash
npx cyberplace@<version> hook register \
  --name commit-discipline \
  --event SessionStart \
  --extract AGENTS.md \
  --heading "Commit Discipline"
```

**Options:**

| Flag | Description |
| ---- | ----------- |
| `--name <name>` | Hook name (used for idempotency and logging) |
| `--event <event>` | `SessionStart` (default) or `PostToolUse` |
| `--file <path>` | Read instructions from a file |
| `--glob <pattern>` | Glob pattern for dynamic instructions |
| `--extract <path>` | Markdown file to extract a section from |
| `--heading <heading>` | Section heading to extract (required with `--extract`) |
| `--matcher <matcher>` | PostToolUse matcher (default: `Write\|Edit`) |
| `--root <path>` | Repo root |
| `--dry-run` | Preview without writing |
| `--verbose` | Human-readable status on stderr |
| `--format <format>` | `text` (default), `agent`, or `json` |

### `hook run`

Run a hook directly — injects the instruction content into the agent context. Called by the agent runtime at session start.

```bash
npx cyberplace@<version> hook run \
  --extract AGENTS.md \
  --heading "Commit Discipline"
```

**Options:**

| Flag | Description |
| ---- | ----------- |
| `--name <name>` | Hook name (for logging and idempotency) |
| `--file <path>` | Read instructions from a file |
| `--glob <pattern>` | Glob files and inject their contents |
| `--extract <path>` | Extract a section from a markdown file |
| `--heading <heading>` | Section heading to extract (required with `--extract`) |
| `--verbose` | Human-readable status on stderr |

## Source types

| Flag | When to use |
| ---- | ----------- |
| `--file` | Single static instruction file |
| `--glob` | Multiple instruction files matched by pattern |
| `--extract` | One section from a larger markdown file (e.g. `AGENTS.md`) |

## Pinning

Always pin the CLI version in registered hooks — never use `@latest`:

```bash
# Good — pinned
npx cyberplace@0.3.0 hook run --extract AGENTS.md --heading "Commit Discipline"

# Bad — resolves at runtime
npx cyberplace@latest hook run …
```

Re-run `hook register` after upgrading the CLI to bump the stored version.
