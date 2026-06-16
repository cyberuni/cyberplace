---
title: Agent Tool Output
description: Rules for scripts, hooks, and CLIs that AI agents invoke.
---

**Load:** `npx cyber-skills@<version> governance show agent-tool-output`

Rules for scripts, hooks, and CLIs that AI agents invoke. Apply when authoring skill `scripts/` or documenting CLI commands in `SKILL.md`.

## Agent-native tools

For skill `scripts/`, hook runtime commands, and any tool where the primary consumer is always an agent.

### Stdout is the machine contract

- Emit **one JSON value** per run, or silence on success with no payload
- Use `process.stdout.write(JSON.stringify(result) + '\n')` — never `console.log` for contract output
- No prose, tables, progress bars, or ANSI decoration on stdout in default mode

### Stderr is human/diagnostic

- Use `console.warn`, `console.error`, or `process.stderr.write` for diagnostics
- Gate tables, progress, and verbose human output behind a `--verbose` flag

### Files hold durable state

- Write artifacts to disk; stdout JSON names paths or fields only
- Agents read artifact files by path from stdout JSON — not by scraping stdout prose

### Skills present; tools record

- `SKILL.md` tells the agent which file or JSON field to read
- The agent summarizes results for the user — the tool does not format user-facing prose on stdout

### Non-interactive paths

- Document `--yes` or an equivalent non-interactive flag when the tool can prompt
- Never put interactive prompts on stdout
- Agents must be able to run the tool without human input

### Exit codes

- `0` = success
- Non-zero = failure; include a concise error on stderr

## Dual-audience CLI

For command-line tools used by both humans and agents.

### Default stdout = human-readable

Tables, aligned fields, and prose summaries are fine for interactive terminal use.

### `--format agent` = agent contract

- Agents **must** pass `--format agent` when they need output optimized for LLM reasoning
- `--format agent` is terse, structured text — lower token cost and better reasoning than JSON
- `--format json` is for non-LLM machine consumers (scripts, pipelines)
- `SKILL.md` must instruct agents to use `--format agent`, not to parse default prose or tables
- `--json` is a deprecated alias for `--format json`

### Errors and verbosity

- Errors and validation failures go to stderr
- Optional human status goes to stderr when `--verbose` is set

## SKILL.md authoring

When a skill documents commands agents run:

- Tell agents which flag to use: `--format agent` for LLM consumption, `--format json` for non-LLM
- Do **not** instruct agents to parse default stdout prose, summary tables, or generic "script output" as data
- Prefer: "read `<artifact-path>`" or "run with `--format agent`" or "run with `--format json` and parse the array"
